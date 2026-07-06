from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import base64
import logging
import bcrypt
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.text_to_speech import OpenAITextToSpeech
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
from seed_data import ANIME_DATA, LOCATION_DATA, CHARACTERS


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI(title="AniJourney AI")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    user: dict

class RecommendIn(BaseModel):
    query: str

class TripIn(BaseModel):
    anime_ids: List[str]
    duration_days: int = 5
    budget_inr: int = 150000
    season: str = "Spring"
    start_city: str = "Tokyo"

class CompanionMsgIn(BaseModel):
    character_id: str
    session_id: str
    message: str

class FavoriteIn(BaseModel):
    item_type: str  # "anime" or "location"
    item_id: str

class FoodFestivalIn(BaseModel):
    anime_ids: List[str]
    kind: str = "both"  # food | festival | both

class CheckinIn(BaseModel):
    location_id: str

class ReviewIn(BaseModel):
    location_id: str
    rating: int  # 1-5
    text: str

class TTSIn(BaseModel):
    text: str
    character_id: str

class CosplayIn(BaseModel):
    anime_id: str
    style: str = "photorealistic"  # photorealistic | anime | studio
    notes: str = ""


# ---------- Auth Helpers ----------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, hashed: str) -> bool:
    return bcrypt.checkpw(p.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=14)}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def current_user(cred: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = pyjwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except pyjwt.PyJWTError:
        raise HTTPException(401, "Invalid token")


# ---------- Seed ----------
@app.on_event("startup")
async def seed():
    if await db.anime.count_documents({}) == 0:
        await db.anime.insert_many([{**a} for a in ANIME_DATA])
    if await db.locations.count_documents({}) == 0:
        await db.locations.insert_many([{**l} for l in LOCATION_DATA])
    if await db.characters.count_documents({}) == 0:
        await db.characters.insert_many([{**c} for c in CHARACTERS])
    logger.info("Seed complete")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "AniJourney AI API"}


@api_router.post("/auth/register", response_model=TokenOut)
async def register(data: RegisterIn):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": data.email,
        "name": data.name,
        "password": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(doc)
    return {"access_token": create_token(uid), "user": {"id": uid, "email": data.email, "name": data.name}}


@api_router.post("/auth/login", response_model=TokenOut)
async def login(data: LoginIn):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    return {
        "access_token": create_token(user["id"]),
        "user": {"id": user["id"], "email": user["email"], "name": user["name"]}
    }


@api_router.get("/auth/me")
async def me(user=Depends(current_user)):
    return user


# ---------- Anime & Locations ----------
@api_router.get("/anime")
async def list_anime():
    return await db.anime.find({}, {"_id": 0}).to_list(500)


@api_router.get("/anime/{anime_id}")
async def get_anime(anime_id: str):
    a = await db.anime.find_one({"id": anime_id}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Anime not found")
    locs = await db.locations.find({"anime_id": anime_id}, {"_id": 0}).to_list(200)
    return {"anime": a, "locations": locs}


@api_router.get("/locations")
async def list_locations():
    return await db.locations.find({}, {"_id": 0}).to_list(500)


@api_router.get("/characters")
async def list_chars():
    return await db.characters.find({}, {"_id": 0}).to_list(50)


# ---------- AI Recommendation ----------
def strip_json(text: str) -> str:
    m = re.search(r'\{[\s\S]*\}', text)
    return m.group(0) if m else text


@api_router.post("/recommend")
async def recommend(data: RecommendIn):
    anime_list = await db.anime.find({}, {"_id": 0}).to_list(500)
    catalog = json.dumps([{"id": a["id"], "title": a["title"], "mood": a["mood"], "genres": a["genres"]} for a in anime_list])
    system = (
        "You are an anime mood expert for AniJourney AI. Given a user's feeling/vibe query, "
        "recommend 3 anime from this catalog. Respond ONLY with valid JSON: "
        '{"recommendations":[{"id":"...","title":"...","reason":"why it matches (one sentence)"}]}'
        f"\n\nCATALOG: {catalog}"
    )
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"rec-{uuid.uuid4()}", system_message=system).with_model("anthropic", "claude-sonnet-4-5-20250929")
    resp = await chat.send_message(UserMessage(text=data.query))
    try:
        result = json.loads(strip_json(resp))
    except Exception:
        result = {"recommendations": [], "raw": resp}
    return result


# ---------- AI Trip Generator ----------
@api_router.post("/trip/generate")
async def generate_trip(data: TripIn):
    animes = await db.anime.find({"id": {"$in": data.anime_ids}}, {"_id": 0}).to_list(20)
    locs = await db.locations.find({"anime_id": {"$in": data.anime_ids}}, {"_id": 0}).to_list(200)
    if not animes:
        raise HTTPException(400, "No anime selected")
    system = (
        "You are AniJourney AI's expert Japan trip planner. Create a day-by-day anime pilgrimage itinerary. "
        "Use ONLY the provided locations. Return valid JSON only, no markdown, this shape: "
        '{"title":"...","summary":"2-3 sentences","estimated_cost_inr": number, '
        '"days":[{"day":1,"city":"...","theme":"...","activities":[{"time":"morning|afternoon|evening","place":"...","anime":"...","description":"...","cost_inr":number}]}],'
        '"tips":["...","..."]}'
    )
    user_msg = (
        f"Favorite anime: {[a['title'] for a in animes]}\n"
        f"Duration: {data.duration_days} days\n"
        f"Budget: ₹{data.budget_inr}\n"
        f"Season: {data.season}\n"
        f"Starting city: {data.start_city}\n\n"
        f"Available anime locations: {json.dumps(locs)}"
    )
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"trip-{uuid.uuid4()}", system_message=system).with_model("anthropic", "claude-sonnet-4-5-20250929")
    resp = await chat.send_message(UserMessage(text=user_msg))
    try:
        return json.loads(strip_json(resp))
    except Exception:
        return {"error": "parse", "raw": resp}


# ---------- AI Character Companion ----------
@api_router.post("/companion/chat")
async def companion_chat(data: CompanionMsgIn):
    char = await db.characters.find_one({"id": data.character_id}, {"_id": 0})
    if not char:
        raise HTTPException(404, "Character not found")
    system = (
        f"You are {char['name']} from {char['anime']}. Stay fully in character. "
        f"Persona: {char['persona']}. "
        "You are guiding the user on their anime pilgrimage in Japan. Reference real Japanese locations, culture, food, and shrines. "
        "Keep replies 2-4 sentences, warm and personal."
    )
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=data.session_id, system_message=system).with_model("anthropic", "claude-sonnet-4-5-20250929")
    resp = await chat.send_message(UserMessage(text=data.message))
    await db.messages.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": data.session_id,
        "character_id": data.character_id,
        "user_msg": data.message,
        "ai_msg": resp,
        "ts": datetime.now(timezone.utc).isoformat()
    })
    return {"character": char["name"], "reply": resp}


# ---------- Favorites ----------
@api_router.post("/favorites")
async def add_fav(data: FavoriteIn, user=Depends(current_user)):
    doc = {"id": str(uuid.uuid4()), "user_id": user["id"], "item_type": data.item_type, "item_id": data.item_id, "ts": datetime.now(timezone.utc).isoformat()}
    await db.favorites.update_one(
        {"user_id": user["id"], "item_type": data.item_type, "item_id": data.item_id},
        {"$setOnInsert": doc}, upsert=True
    )
    return {"ok": True}


@api_router.get("/favorites")
async def get_favs(user=Depends(current_user)):
    return await db.favorites.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)


@api_router.delete("/favorites/{item_type}/{item_id}")
async def del_fav(item_type: str, item_id: str, user=Depends(current_user)):
    await db.favorites.delete_one({"user_id": user["id"], "item_type": item_type, "item_id": item_id})
    return {"ok": True}


# ---------- AI Food & Festival Recommendations ----------
@api_router.post("/food-festivals")
async def food_festivals(data: FoodFestivalIn):
    animes = await db.anime.find({"id": {"$in": data.anime_ids}}, {"_id": 0}).to_list(20)
    if not animes:
        raise HTTPException(400, "Select at least one anime")
    system = (
        "You are a Japanese food & festival expert for anime pilgrims. For each anime the user loves, "
        "recommend real Japanese food dishes and festivals inspired by or referenced in that anime. "
        "Return valid JSON ONLY (no markdown), shape: "
        '{"items":[{"anime":"...","kind":"food|festival","name":"...","location":"city / prefecture",'
        '"description":"2 sentences","best_time":"month or season"}]}'
    )
    user_msg = f"Anime: {[a['title'] for a in animes]}. Kind wanted: {data.kind}. Give 6-8 items total, mixed."
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"food-{uuid.uuid4()}", system_message=system).with_model("anthropic", "claude-sonnet-4-5-20250929")
    resp = await chat.send_message(UserMessage(text=user_msg))
    try:
        return json.loads(strip_json(resp))
    except Exception:
        return {"items": [], "raw": resp}


# ---------- Passport (Stamps / XP / Badges) ----------
BADGES = [
    {"id": "first-step", "name": "First Step", "emoji": "🌱", "requires": 1},
    {"id": "shrine-explorer", "name": "Shrine Explorer", "emoji": "⛩️", "requires": 3},
    {"id": "sakura-master", "name": "Sakura Master", "emoji": "🌸", "requires": 5},
    {"id": "kyoto-walker", "name": "Kyoto Walker", "emoji": "👘", "requires": 7},
    {"id": "anime-pilgrim", "name": "Anime Pilgrim", "emoji": "🎌", "requires": 10},
]

@api_router.post("/visits/checkin")
async def checkin(data: CheckinIn, user=Depends(current_user)):
    loc = await db.locations.find_one({"id": data.location_id}, {"_id": 0})
    if not loc:
        raise HTTPException(404, "Location not found")
    existing = await db.visits.find_one({"user_id": user["id"], "location_id": data.location_id})
    if existing:
        return {"ok": True, "xp_gained": 0, "already": True}
    await db.visits.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "location_id": data.location_id,
        "xp": 100,
        "ts": datetime.now(timezone.utc).isoformat()
    })
    return {"ok": True, "xp_gained": 100}


@api_router.get("/passport")
async def passport(user=Depends(current_user)):
    visits = await db.visits.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    count = len(visits)
    total_xp = sum(v.get("xp", 0) for v in visits)
    level = 1 + total_xp // 300
    stamps = []
    if visits:
        loc_ids = [v["location_id"] for v in visits]
        locs = await db.locations.find({"id": {"$in": loc_ids}}, {"_id": 0}).to_list(500)
        loc_map = {l["id"]: l for l in locs}
        stamps = [{"location": loc_map.get(v["location_id"]), "ts": v["ts"]} for v in visits if loc_map.get(v["location_id"])]
    badges_out = [{**b, "unlocked": count >= b["requires"]} for b in BADGES]
    return {"stamps": stamps, "total_xp": total_xp, "level": level, "count": count, "badges": badges_out}


# ---------- Reviews ----------
@api_router.post("/reviews")
async def add_review(data: ReviewIn, user=Depends(current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "location_id": data.location_id,
        "rating": max(1, min(5, data.rating)),
        "text": data.text,
        "ts": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/reviews/{location_id}")
async def get_reviews(location_id: str):
    revs = await db.reviews.find({"location_id": location_id}, {"_id": 0}).sort("ts", -1).to_list(100)
    return revs


# ---------- TTS: Character Voice ----------
CHARACTER_VOICES = {
    "frieren": "nova",     # soft feminine
    "gojo": "onyx",        # cocky deep male
    "luffy": "fable",      # bright energetic
    "violet": "shimmer",   # gentle formal feminine
    "l": "echo",           # cryptic monotone
}

@api_router.post("/companion/speak")
async def companion_speak(data: TTSIn):
    voice = CHARACTER_VOICES.get(data.character_id, "alloy")
    tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
    audio_bytes = await tts.generate_speech(
        text=data.text[:4000],
        model="tts-1",
        voice=voice,
        response_format="mp3"
    )
    return Response(content=audio_bytes, media_type="audio/mpeg")


# ---------- Cosplay Planner (Image Generation) ----------
@api_router.post("/cosplay/generate")
async def cosplay_generate(data: CosplayIn):
    anime = await db.anime.find_one({"id": data.anime_id}, {"_id": 0})
    if not anime:
        raise HTTPException(404, "Anime not found")
    prompt = (
        f"A high-quality cosplay reference sheet for a character from '{anime['title']}'. "
        f"Style: {data.style}. Composition: full-body character on soft studio background, "
        f"Japanese anime aesthetic, cinematic lighting, detailed costume, cherry blossom accents. "
        f"{data.notes}".strip()
    )
    imgen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
    images = await imgen.generate_images(prompt=prompt, model="gpt-image-1", number_of_images=1, quality="low")
    if not images:
        raise HTTPException(500, "Image generation failed")
    b64 = base64.b64encode(images[0]).decode()
    return {"anime": anime["title"], "prompt": prompt, "image_b64": b64}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

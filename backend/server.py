from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import logging
import bcrypt
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage
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

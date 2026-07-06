from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Response, UploadFile, File, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import io
import json
import base64
import logging
import bcrypt
import bleach
import requests
import jwt as pyjwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.text_to_speech import OpenAITextToSpeech
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
from emergentintegrations.llm.openai.speech_to_text import OpenAISpeechToText
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
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str

    @field_validator("password")
    @classmethod
    def strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must include letters and numbers")
        return v

    @field_validator("name")
    @classmethod
    def name_ok(cls, v: str) -> str:
        v = v.strip()
        if not 1 <= len(v) <= 60:
            raise ValueError("Name must be 1-60 characters")
        return bleach.clean(v, tags=[], strip=True)

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

class TripSaveIn(BaseModel):
    title: str
    itinerary: dict  # full generated JSON


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
    # Security: unique index on user email + text index on anime/locations for search
    await db.users.create_index("email", unique=True)
    await db.anime.create_index([("title", "text"), ("synopsis", "text"), ("mood", "text"), ("genres", "text")])
    await db.locations.create_index([("name", "text"), ("city", "text"), ("region", "text"), ("description", "text")])
    await db.posts.create_index([("created_at", -1)])
    await db.trips.create_index("slug", unique=True)
    if await db.anime.count_documents({}) == 0:
        await db.anime.insert_many([{**a} for a in ANIME_DATA])
    if await db.locations.count_documents({}) == 0:
        await db.locations.insert_many([{**loc} for loc in LOCATION_DATA])
    if await db.characters.count_documents({}) == 0:
        await db.characters.insert_many([{**c} for c in CHARACTERS])
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    logger.info("Seed complete")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "AniJourney AI API"}


@api_router.post("/auth/register", response_model=TokenOut)
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterIn):
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
@limiter.limit("10/minute")
async def login(request: Request, data: LoginIn):
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
async def list_anime(
    q: Optional[str] = None,
    genre: Optional[str] = None,
    mood: Optional[str] = None,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    sort: str = "title",
    limit: int = 100,
):
    query: dict = {}
    if genre:
        query["genres"] = {"$in": [genre]}
    if mood:
        query["mood"] = {"$in": [mood]}
    if year_min is not None or year_max is not None:
        yr: dict = {}
        if year_min is not None:
            yr["$gte"] = year_min
        if year_max is not None:
            yr["$lte"] = year_max
        query["year"] = yr
    if q:
        query["$or"] = [
            {"title": {"$regex": re.escape(q), "$options": "i"}},
            {"synopsis": {"$regex": re.escape(q), "$options": "i"}},
            {"genres": {"$regex": re.escape(q), "$options": "i"}},
            {"mood": {"$regex": re.escape(q), "$options": "i"}},
        ]
    sort_field = "year" if sort == "year" else "title"
    sort_dir = -1 if sort == "year" else 1
    return await db.anime.find(query, {"_id": 0}).sort(sort_field, sort_dir).to_list(min(max(1, limit), 500))


@api_router.get("/anime/facets")
async def anime_facets():
    """Dynamic filter options — pulled live from the DB, not hardcoded."""
    genres = await db.anime.distinct("genres")
    moods = await db.anime.distinct("mood")
    years = await db.anime.distinct("year")
    return {
        "genres": sorted(genres),
        "moods": sorted(moods),
        "years": {"min": min(years) if years else 1980, "max": max(years) if years else 2026},
        "total": await db.anime.count_documents({}),
    }


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
        loc_map = {loc["id"]: loc for loc in locs}
        stamps = [{"location": loc_map.get(v["location_id"]), "ts": v["ts"]} for v in visits if loc_map.get(v["location_id"])]
    badges_out = [{**b, "unlocked": count >= b["requires"]} for b in BADGES]
    return {"stamps": stamps, "total_xp": total_xp, "level": level, "count": count, "badges": badges_out}


# ---------- Reviews ----------
@api_router.post("/reviews")
async def add_review(data: ReviewIn, user=Depends(current_user)):
    text = bleach.clean(data.text or "", tags=[], strip=True)[:1000].strip()
    if not text:
        raise HTTPException(400, "Review text required")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "location_id": data.location_id,
        "rating": max(1, min(5, data.rating)),
        "text": text,
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


# ---------- Object Storage ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "anijourney"
_storage_key = None

def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path: str, data: bytes, content_type: str):
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Cosplay: modify to allow saving ----------
@api_router.post("/cosplay/save")
async def cosplay_save(payload: dict, user=Depends(current_user)):
    img_b64 = payload.get("image_b64")
    anime_id = payload.get("anime_id")
    prompt = payload.get("prompt", "")
    if not img_b64 or not anime_id:
        raise HTTPException(400, "Missing fields")
    img_bytes = base64.b64decode(img_b64)
    path = f"{APP_NAME}/cosplay/{user['id']}/{uuid.uuid4()}.png"
    put_object(path, img_bytes, "image/png")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "anime_id": anime_id,
        "prompt": prompt,
        "storage_path": path,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cosplay.insert_one(doc)
    return {"ok": True, "id": doc["id"], "storage_path": path}


@api_router.get("/cosplay/gallery")
async def cosplay_gallery(mine: bool = False, user=Depends(current_user)):
    q = {"is_deleted": False}
    if mine:
        q["user_id"] = user["id"]
    items = await db.cosplay.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/cosplay/image/{item_id}")
async def cosplay_image(item_id: str):
    rec = await db.cosplay.find_one({"id": item_id, "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Not found")
    data, ct = get_object(rec["storage_path"])
    return Response(content=data, media_type=ct)


# ---------- STT: Voice input ----------
@api_router.post("/companion/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(400, "File too large (25MB max)")
    stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
    ext = (file.filename or "audio.webm").split(".")[-1].lower()
    if ext not in ["mp3","mp4","mpeg","mpga","m4a","wav","webm"]:
        ext = "webm"
    buf = io.BytesIO(audio_bytes)
    buf.name = f"voice.{ext}"
    resp = await stt.transcribe(file=buf, model="whisper-1", response_format="json")
    text = resp.text if hasattr(resp, "text") else str(resp)
    return {"text": text}


# ---------- Trip Persistence ----------
def _slug():
    return uuid.uuid4().hex[:10]

@api_router.post("/trips")
async def save_trip(data: TripSaveIn, user=Depends(current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "slug": _slug(),
        "user_id": user["id"],
        "user_name": user["name"],
        "title": data.title,
        "itinerary": data.itinerary,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.trips.insert_one(doc)
    return {"ok": True, "id": doc["id"], "slug": doc["slug"]}

@api_router.get("/trips/mine")
async def my_trips(user=Depends(current_user)):
    return await db.trips.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.get("/trips/share/{slug}")
async def get_trip(slug: str):
    t = await db.trips.find_one({"slug": slug}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Trip not found")
    return t


def _ical_esc(s: str) -> str:
    return (s or "").replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")


@api_router.get("/trips/share/{slug}/ics")
async def trip_ics(slug: str):
    t = await db.trips.find_one({"slug": slug}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Trip not found")
    it = t["itinerary"]
    base = datetime.now(timezone.utc)
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AniJourney AI//EN", "CALSCALE:GREGORIAN"]
    for d in it.get("days", []):
        day_offset = d.get("day", 1) - 1
        day_date = (base + timedelta(days=day_offset)).strftime("%Y%m%d")
        time_map = {"morning": "0900", "afternoon": "1400", "evening": "1900"}
        for i, a in enumerate(d.get("activities", [])):
            start = time_map.get((a.get("time") or "morning").lower(), "0900")
            end_h = int(start[:2]) + 2
            end = f"{end_h:02d}{start[2:]}"
            uid = f"{slug}-{d.get('day')}-{i}@anijourney.ai"
            lines += [
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTART:{day_date}T{start}00",
                f"DTEND:{day_date}T{end}00",
                f"SUMMARY:{_ical_esc(a.get('place',''))}",
                f"DESCRIPTION:{_ical_esc((a.get('anime','') + ' — ') if a.get('anime') else '')}{_ical_esc(a.get('description',''))}",
                f"LOCATION:{_ical_esc(d.get('city',''))}",
                "END:VEVENT"
            ]
    lines.append("END:VCALENDAR")
    ics = "\r\n".join(lines)
    return Response(content=ics, media_type="text/calendar", headers={"Content-Disposition": f'attachment; filename="{slug}.ics"'})


@api_router.get("/share/trip/{slug}", response_class=Response)
async def og_trip(slug: str):
    t = await db.trips.find_one({"slug": slug}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Not found")
    title = t.get("title", "Anime Journey")
    summary = (t["itinerary"].get("summary") or "A pilgrimage through Japan's anime-inspired locations.")[:200]
    img = "https://images.unsplash.com/photo-1665706896821-319040b81753?w=1200&h=630&fit=crop"
    origin = os.environ.get("PUBLIC_ORIGIN", "").rstrip("/")
    canonical = f"{origin}/trip/{slug}" if origin else f"/trip/{slug}"
    html = f"""<!doctype html><html><head>
<meta charset="utf-8" />
<title>{title} · AniJourney AI</title>
<meta name="description" content="{summary}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="{title} · AniJourney AI" />
<meta property="og:description" content="{summary}" />
<meta property="og:image" content="{img}" />
<meta property="og:url" content="{canonical}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title} · AniJourney AI" />
<meta name="twitter:description" content="{summary}" />
<meta name="twitter:image" content="{img}" />
<meta http-equiv="refresh" content="0; url=/trip/{slug}" />
</head><body><a href="/trip/{slug}">View trip on AniJourney AI</a></body></html>"""
    return Response(content=html, media_type="text/html")


@api_router.get("/share/cosplay/{item_id}", response_class=Response)
async def og_cosplay(item_id: str):
    rec = await db.cosplay.find_one({"id": item_id, "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Not found")
    anime = await db.anime.find_one({"id": rec["anime_id"]}, {"_id": 0})
    title = f"Cosplay · {anime['title'] if anime else 'AniJourney'}"
    desc = f"Cosplay design by {rec.get('user_name','a pilgrim')} — AniJourney AI"
    origin = os.environ.get("PUBLIC_ORIGIN", "").rstrip("/")
    img_url = f"{origin}/api/cosplay/image/{item_id}" if origin else f"/api/cosplay/image/{item_id}"
    html = f"""<!doctype html><html><head>
<meta charset="utf-8" />
<title>{title}</title>
<meta property="og:type" content="image" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:image" content="{img_url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="{img_url}" />
<meta http-equiv="refresh" content="0; url=/gallery" />
</head><body><a href="/gallery">View on AniJourney AI</a></body></html>"""
    return Response(content=html, media_type="text/html")


# ---------- Community: Travel Stories / Posts ----------
class PostIn(BaseModel):
    title: str
    body: str
    anime_id: Optional[str] = None
    location_id: Optional[str] = None
    image_b64: Optional[str] = None  # optional attached image

class CommentIn(BaseModel):
    post_id: str
    text: str


@api_router.post("/community/posts")
async def create_post(data: PostIn, user=Depends(current_user)):
    title = bleach.clean(data.title or "", tags=[], strip=True)[:120].strip()
    body = bleach.clean(data.body or "", tags=[], strip=True)[:3000].strip()
    if not title or not body:
        raise HTTPException(400, "Title and body required")
    storage_path = None
    if data.image_b64:
        try:
            img_bytes = base64.b64decode(data.image_b64)
            if len(img_bytes) > 5 * 1024 * 1024:
                raise HTTPException(400, "Image too large (5MB max)")
            storage_path = f"{APP_NAME}/posts/{user['id']}/{uuid.uuid4()}.png"
            put_object(storage_path, img_bytes, "image/png")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Post image upload failed: {e}")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "title": title,
        "body": body,
        "anime_id": data.anime_id,
        "location_id": data.location_id,
        "storage_path": storage_path,
        "likes": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.posts.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/community/posts")
async def list_posts(anime_id: Optional[str] = None, limit: int = 50):
    q: dict = {}
    if anime_id:
        q["anime_id"] = anime_id
    items = await db.posts.find(q, {"_id": 0}).sort("created_at", -1).to_list(min(max(1, limit), 100))
    # attach comment counts + like counts
    for p in items:
        p["like_count"] = len(p.get("likes", []))
        p["comment_count"] = await db.comments.count_documents({"post_id": p["id"]})
        p["likes"] = []  # don't leak user ids
    return items


@api_router.get("/community/posts/{post_id}")
async def get_post(post_id: str):
    p = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Post not found")
    p["like_count"] = len(p.get("likes", []))
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("ts", 1).to_list(200)
    p["comments"] = comments
    p["likes"] = []
    return p


@api_router.post("/community/posts/{post_id}/like")
async def toggle_like(post_id: str, user=Depends(current_user)):
    p = await db.posts.find_one({"id": post_id})
    if not p:
        raise HTTPException(404, "Post not found")
    liked = user["id"] in p.get("likes", [])
    op = "$pull" if liked else "$addToSet"
    await db.posts.update_one({"id": post_id}, {op: {"likes": user["id"]}})
    return {"liked": not liked}


@api_router.post("/community/comments")
async def add_comment(data: CommentIn, user=Depends(current_user)):
    text = bleach.clean(data.text or "", tags=[], strip=True)[:500].strip()
    if not text:
        raise HTTPException(400, "Comment text required")
    if not await db.posts.find_one({"id": data.post_id}):
        raise HTTPException(404, "Post not found")
    doc = {
        "id": str(uuid.uuid4()),
        "post_id": data.post_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "text": text,
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    await db.comments.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/community/image/{post_id}")
async def post_image(post_id: str):
    p = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not p or not p.get("storage_path"):
        raise HTTPException(404, "Not found")
    data, ct = get_object(p["storage_path"])
    return Response(content=data, media_type=ct)


# ---------- Marketplace: Hotels & Events (curated + AI-augmented) ----------
CURATED_HOTELS = [
    {"id": "hotel-park-tokyo", "name": "Park Hyatt Tokyo", "city": "Tokyo", "region": "Kanto",
     "price_inr": 32000, "rating": 4.8, "anime_ref": "Lost in Translation vibes near Shibuya",
     "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "amenities": ["Onsen", "Wifi", "Concierge"]},
    {"id": "hotel-granvia-kyoto", "name": "Hotel Granvia Kyoto", "city": "Kyoto", "region": "Kansai",
     "price_inr": 18000, "rating": 4.6, "anime_ref": "Steps from Kyoto Animation studio",
     "image": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800", "amenities": ["Wifi", "Spa", "Breakfast"]},
    {"id": "hotel-nishiyama", "name": "Nishiyama Ryokan", "city": "Kyoto", "region": "Kansai",
     "price_inr": 12000, "rating": 4.7, "anime_ref": "Traditional tatami stay near Arashiyama",
     "image": "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=800", "amenities": ["Onsen", "Kaiseki", "Tatami"]},
    {"id": "hotel-osaka-fp", "name": "The Fairmont Osaka", "city": "Osaka", "region": "Kansai",
     "price_inr": 21000, "rating": 4.7, "anime_ref": "Near Universal Studios (One Piece / Naruto zones)",
     "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", "amenities": ["Pool", "Gym", "Wifi"]},
    {"id": "hotel-ginzan-fujiya", "name": "Notoya Ryokan", "city": "Obanazawa", "region": "Yamagata",
     "price_inr": 22000, "rating": 4.9, "anime_ref": "Spirited Away's snowy bathhouse",
     "image": "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800", "amenities": ["Onsen", "Kaiseki", "River view"]},
    {"id": "hotel-hakone-koraku", "name": "Hakone Kowakien Ten-yu", "city": "Hakone", "region": "Kanagawa",
     "price_inr": 16500, "rating": 4.6, "anime_ref": "Mt. Fuji views like Your Name",
     "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", "amenities": ["Onsen", "Fuji view", "Breakfast"]},
    {"id": "hotel-sapporo-jrt", "name": "JR Tower Hotel Nikko Sapporo", "city": "Sapporo", "region": "Hokkaido",
     "price_inr": 14000, "rating": 4.5, "anime_ref": "Erased Hokkaido setting",
     "image": "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800", "amenities": ["Spa", "Wifi", "Gym"]},
    {"id": "hotel-uji-hanayashiki", "name": "Hanayashiki Ukifune-en", "city": "Uji", "region": "Kyoto",
     "price_inr": 19000, "rating": 4.7, "anime_ref": "Sound! Euphonium riverside",
     "image": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800", "amenities": ["Onsen", "River view", "Matcha kaiseki"]},
]

CURATED_EVENTS = [
    {"id": "evt-ac-tokyo", "name": "AnimeJapan Tokyo Big Sight", "city": "Tokyo", "date": "2026-03-21",
     "type": "Convention", "price_inr": 2500,
     "image": "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800",
     "description": "Japan's largest anime industry convention."},
    {"id": "evt-kyoto-jidai", "name": "Kyoto Jidai Matsuri", "city": "Kyoto", "date": "2026-10-22",
     "type": "Festival", "price_inr": 0,
     "image": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800",
     "description": "Historic parade — inspired countless period anime."},
    {"id": "evt-ashikaga-wisteria", "name": "Ashikaga Wisteria Festival", "city": "Ashikaga", "date": "2026-04-25",
     "type": "Festival", "price_inr": 1800,
     "image": "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800",
     "description": "The wisteria groves that inspired Demon Slayer."},
    {"id": "evt-jjk-exhibit", "name": "Jujutsu Kaisen Museum Exhibit", "city": "Tokyo", "date": "2026-05-10",
     "type": "Exhibition", "price_inr": 3200,
     "image": "https://images.unsplash.com/photo-1554797589-7241bb691973?w=800",
     "description": "Limited-run exhibition celebrating the Shibuya Incident."},
    {"id": "evt-ghibli-park", "name": "Ghibli Park Autumn Openings", "city": "Nagakute", "date": "2026-10-01",
     "type": "Theme Park", "price_inr": 4500,
     "image": "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?w=800",
     "description": "Newly opened Mononoke Village + Witch Valley."},
    {"id": "evt-sakura-tokyo", "name": "Tokyo Sakura Matsuri", "city": "Tokyo", "date": "2026-03-28",
     "type": "Festival", "price_inr": 0,
     "image": "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800",
     "description": "Cherry blossom festival at Ueno Park & Meguro River."},
]


@api_router.get("/marketplace/hotels")
async def marketplace_hotels(city: Optional[str] = None, max_price: Optional[int] = None, sort: str = "rating"):
    items = list(CURATED_HOTELS)
    if city:
        items = [h for h in items if h["city"].lower() == city.lower()]
    if max_price is not None:
        items = [h for h in items if h["price_inr"] <= max_price]
    if sort == "price":
        items.sort(key=lambda h: h["price_inr"])
    else:
        items.sort(key=lambda h: -h["rating"])
    return items


@api_router.get("/marketplace/events")
async def marketplace_events(event_type: Optional[str] = None, city: Optional[str] = None):
    items = list(CURATED_EVENTS)
    if event_type:
        items = [e for e in items if e["type"].lower() == event_type.lower()]
    if city:
        items = [e for e in items if e["city"].lower() == city.lower()]
    items.sort(key=lambda e: e["date"])
    return items


@api_router.post("/marketplace/book")
async def marketplace_book(payload: dict, user=Depends(current_user)):
    """Mock booking endpoint — records intent, doesn't take payment."""
    item_type = payload.get("item_type")
    item_id = payload.get("item_id")
    if item_type not in ("hotel", "event") or not item_id:
        raise HTTPException(400, "Invalid booking payload")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "item_type": item_type,
        "item_id": item_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(doc)
    return {"ok": True, "id": doc["id"], "status": "pending"}



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

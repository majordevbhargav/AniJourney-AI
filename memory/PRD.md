# AniJourney AI — Product Requirements

## Vision
Cinematic AI-powered platform for anime fans to plan pilgrimage trips through Japan's real-world anime-inspired locations. Combines mood-based anime discovery, geo-tagged pilgrimage atlas, AI itinerary generation, in-character companion chat, community stories, and a hotels/events marketplace.

## Tech Stack
- Frontend: React 19 + Tailwind + Shadcn UI + Framer + React Leaflet + Sonner + jsPDF
- Backend: FastAPI + MongoDB (motor) + JWT + bcrypt + slowapi (rate limiting) + bleach (sanitization)
- AI: Claude Sonnet 4.5 + OpenAI TTS/STT + gpt-image-1 via emergentintegrations
- Maps: Leaflet + OpenStreetMap
- Storage: Emergent Object Storage

## Personas
- International first-time visitor to Japan
- Anime superfan planning a pilgrimage
- Casual fan wanting anime cafés / shrines nearby

## Implemented (Feb 2026)
- Landing (cinematic hero, Navbar with EN/JP toggle) ✅
- JWT auth with rate-limited login/register (5/min & 10/min), strong password (≥8 + letters+digits), HTML-sanitized name, unique email index ✅
- **25 anime + 44 real pilgrimage locations** with per-anime real MAL cover art ✅
- Dynamic anime catalog: search (q), filter by genre / mood / year, sort by title/year via `/api/anime` + `/api/anime/facets` ✅
- AI Mood Recommender (Claude Sonnet 4.5) ✅
- Pilgrimage Atlas (Leaflet, real coords) ✅
- AI Trip Architect + persistence + share slug ✅
- **Trip export: iCal (backend) + PDF (client-side jsPDF)** ✅
- AI Character Companion (Claude) + OpenAI TTS + Whisper STT ✅
- Cosplay Generator (gpt-image-1) + Object Storage Gallery ✅
- Passport / Stamps / XP / Badges ✅
- Food & Festival AI ✅
- Community (posts, likes, comments, image uploads) with sanitized inputs ✅
- Marketplace (curated hotels + events, filters, mock booking flow) ✅
- Multi-language UI (EN/JP) ✅
- OG image + share HTML for social embeds ✅

## Security Hardening
- Rate limits: /api/auth/register 5/min, /api/auth/login 10/min
- Strong password enforcement + name sanitization (bleach)
- Reviews / posts / comments sanitized on write, length-limited
- MongoDB unique indexes on `users.email` and `trips.slug`; text indexes on anime/locations
- JWT 14-day exp, bcrypt password hashing
- 5MB image cap on community post uploads

## Backlog / Next Phase
- P1: Vision AI (AR camera scene detection)
- P1: Real payment processor (Stripe) for marketplace
- P1: Push/email notifications
- P2: Leaderboards, friends, social graph
- P2: Split server.py into routers (currently ~950 lines)
- P2: Google/Apple sign-in

## Test Credentials
See `/app/memory/test_credentials.md` — `traveler@ani.jp / sakura2026`

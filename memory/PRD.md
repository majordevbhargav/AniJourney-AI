# AniJourney AI — Product Requirements

## Vision
Cinematic AI-powered platform for anime fans to plan pilgrimage trips through Japan's real-world anime-inspired locations. Combines mood-based anime discovery, geo-tagged pilgrimage atlas, AI itinerary generation, and in-character companion chat powered by Claude Sonnet 4.5.

## Tech Stack (MVP)
- Frontend: React 19 + Tailwind + Shadcn UI + Framer + React Leaflet + Sonner
- Backend: FastAPI + MongoDB (motor) + JWT auth (bcrypt)
- AI: Claude Sonnet 4.5 via emergentintegrations (Emergent Universal Key)
- Maps: Leaflet + OpenStreetMap

## Personas
- International first-time visitor to Japan
- Anime superfan planning pilgrimage
- Casual fan wanting local anime cafés / shrines

## Implemented (Feb 2026 — MVP)
- Landing (cinematic hero, sakura, tetris grid)
- JWT auth (register / login / me)
- Anime catalog (6 curated) + detail page with pilgrimage locations
- AI Mood Recommender (Claude Sonnet 4.5)
- Pilgrimage Atlas — interactive Leaflet map (11 real locations)
- AI Trip Architect — multi-day itinerary generator (budget/season/duration)
- AI Character Companion Chat (Frieren, Gojo, Luffy, Violet, L)
- Favorites (persist per user)

## Backlog / Next Phase
- P0: Save generated itineraries per user
- P0: AI stream responses (SSE) for companion
- P1: AI Anime Camera (vision — GPT/Gemini Vision)
- P1: Anime Stamp Collection / Passport gamification
- P1: Food & Festival AI recommendations
- P2: AR Mode
- P2: Community / Reviews
- P2: Cosplay planner, Voice companion (TTS)

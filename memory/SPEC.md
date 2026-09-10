# Eleva Filmmaking — Living Spec

## Product
Dark cinematic portfolio site for Eleva Filmmaking, focused on presenting video work and converting visitors into WhatsApp quote conversations.

## Public flow
- Landing page at `/` with sticky navigation, hero, about/metrics, filterable video portfolio, integrated modal HTML5 player, WhatsApp CTAs, contact section, and footer.
- Portfolio video data comes from `GET /api/videos`; the shell and content remain usable if the API is temporarily unavailable.
- WhatsApp destination: `https://wa.me/5512992431406?text=Olá! Gostaria de solicitar um orçamento para a Eleva Filmmaking.`
- Brand logo uses the provided PDF as a reference, with a responsive fallback mark; uploaded PNG/SVG/WebP logos replace it from the admin panel.

## Admin flow
- `/admin` is protected by a simple PIN. The current PIN is stored in `memory/test_credentials.md`.
- Admin can add, edit, and remove video records and upload a logo image as a persisted data URL.
- Video records accept MP4/thumbnail URLs, or a local MP4 upload up to 500 MB with chunked storage and progress feedback.
- Uploaded videos are stored under `backend/uploads/` with generated filenames and served through `/api/media/{filename}`.
- Mutations require the PIN server-side and use MongoDB through the shared motor handle.

## Data model
- `videos`: string `id`, title, category, client, duration, description, thumbnail_url, video_url, featured, aspect_ratio, created_at.
- `site_settings`: singleton `key=brand`, `logo_url`, `updated_at`.
- Demo seed data: four cinematic sample videos across Comerciais, Documentários, Videoclipes, and Institucional.

## Stack and boundary
- FastAPI + MongoDB backend, every endpoint under `/api` and mounted from `api_router`.
- Vite + React + TypeScript strict frontend, TanStack Query data access through `src/lib/api.ts`.
- Dark default visual system: #0B0B0C / #E50914 / white, Outfit headlines, Plus Jakarta Sans body, JetBrains Mono metadata.
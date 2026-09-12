# Eleva Filmmaking — Living Spec

## Product
Dark cinematic personal portfolio site for the filmmaker behind Eleva Filmmaking, focused on presenting event coverage, commercial videos, drone imagery, and converting visitors into WhatsApp conversations.

## Public flow
- Landing page at `/` with sticky navigation, hero, personal about/services section, filterable video portfolio, optional filterable photo gallery for aerials/stills, integrated modal players, WhatsApp CTAs, contact section, and footer.
- Portfolio video data comes from `GET /api/videos`; the shell and content remain usable if the API is temporarily unavailable.
- WhatsApp destination: `https://wa.me/5512992431406?text=Olá! Gostaria de solicitar um orçamento para a Eleva Filmmaking.`
- Brand logo uses the provided PDF as a reference, with a responsive fallback mark; uploaded PNG/SVG/WebP logos replace it from the admin panel.
- Main public copy is loaded from `GET /api/settings`: hero, about, three services, portfolio, gallery, and contact text can be edited without code.

## Admin flow
- `/admin` is protected by a simple PIN. The current PIN is stored in `memory/test_credentials.md`.
- Admin can add, edit, and remove video records, manage gallery photos, upload a logo image, upload local MP4 videos up to 500 MB, and upload local JPG/JPEG/PNG thumbnails/photos up to 10 MB.
- The “Textos da página” editor groups all main copy by section and supports line breaks in display titles.
- Video records accept MP4/thumbnail URLs, or a local MP4 upload up to 500 MB with chunked storage and progress feedback.
- Local JPG/JPEG/PNG thumbnails up to 10 MB are validated, previewed immediately, stored under `backend/uploads/`, and served through `/api/media/{filename}`.
- Uploaded media uses generated filenames and the same progress-enabled XHR boundary.
- Mutations require the PIN server-side and use MongoDB through the shared motor handle.

## Data model
- `videos`: string `id`, title, category, client, duration, description, thumbnail_url, video_url, featured, aspect_ratio, created_at.
- `photos`: string `id`, title, category, image_url, alt, created_at.
- `site_settings`: singleton `key=brand`, `logo_url`, editable hero/about/services/portfolio/gallery/contact copy, `updated_at`.
- Demo seed data: four cinematic sample videos plus four photo references across Drone and Stills.

## Stack and boundary
- FastAPI + MongoDB backend, every endpoint under `/api` and mounted from `api_router`.
- Vite + React + TypeScript strict frontend, TanStack Query data access through `src/lib/api.ts`.
- Dark default visual system: #0B0B0C / #E50914 / white, Outfit headlines, Plus Jakarta Sans body, JetBrains Mono metadata.
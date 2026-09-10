import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from lib.db import db
from models.portfolio import (
    AdminAuthRequest,
    AdminAuthResponse,
    BrandSettings,
    BrandSettingsUpdate,
    MediaUpload,
    Video,
    VideoCreate,
)

router = APIRouter()
ADMIN_PIN = os.environ.get("ADMIN_PIN", "2001")
MEDIA_DIR = Path(__file__).resolve().parent.parent / "uploads"
MAX_VIDEO_BYTES = 500 * 1024 * 1024
UPLOAD_CHUNK_SIZE = 1024 * 1024


def _check_pin(pin: str) -> None:
    if pin != ADMIN_PIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="PIN inválido")


def _normalise_video(document: dict) -> Video:
    created_at = document.get("created_at")
    if isinstance(created_at, datetime) and created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return Video(**{**document, "created_at": created_at})


@router.get("/videos", response_model=list[Video])
async def list_videos() -> list[Video]:
    documents = await db.videos.find().sort([("featured", -1), ("created_at", -1)]).to_list(1000)
    return [_normalise_video(document) for document in documents]


@router.get("/settings", response_model=BrandSettings)
async def get_settings() -> BrandSettings:
    document = await db.site_settings.find_one({"key": "brand"})
    if not document:
        return BrandSettings()
    return BrandSettings(**document)


@router.post("/admin/auth", response_model=AdminAuthResponse)
async def authenticate_admin(payload: AdminAuthRequest) -> AdminAuthResponse:
    authenticated = payload.pin == ADMIN_PIN
    return AdminAuthResponse(
        authenticated=authenticated,
        message="Acesso autorizado" if authenticated else "PIN inválido. Tente novamente.",
    )


@router.post("/admin/videos", response_model=Video)
async def create_video(payload: VideoCreate) -> Video:
    _check_pin(payload.pin)
    data = payload.model_dump(exclude={"pin"})
    video = Video(id=str(uuid.uuid4()), created_at=datetime.now(timezone.utc), **data)
    await db.videos.insert_one(video.model_dump())
    return video


@router.put("/admin/videos/{video_id}", response_model=Video)
async def update_video(video_id: str, payload: VideoCreate) -> Video:
    _check_pin(payload.pin)
    data = payload.model_dump(exclude={"pin"})
    existing = await db.videos.find_one({"id": video_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Vídeo não encontrado")
    updated = Video(id=video_id, created_at=existing.get("created_at", datetime.now(timezone.utc)), **data)
    await db.videos.replace_one({"id": video_id}, updated.model_dump())
    return updated


@router.post("/admin/videos/{video_id}/delete", response_model=AdminAuthResponse)
async def delete_video(video_id: str, payload: AdminAuthRequest) -> AdminAuthResponse:
    _check_pin(payload.pin)
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vídeo não encontrado")
    return AdminAuthResponse(authenticated=True, message="Vídeo removido")


@router.put("/admin/settings", response_model=BrandSettings)
async def update_settings(payload: BrandSettingsUpdate) -> BrandSettings:
    _check_pin(payload.pin)
    settings = BrandSettings(logo_url=payload.logo_url, updated_at=datetime.now(timezone.utc))
    await db.site_settings.update_one(
        {"key": "brand"},
        {"$set": {**settings.model_dump(), "key": "brand"}},
        upsert=True,
    )
    return settings


@router.post("/admin/media/video", response_model=MediaUpload)
async def upload_video(pin: str = Form(...), file: UploadFile = File(...)) -> MediaUpload:
    _check_pin(pin)
    original_name = file.filename or "video.mp4"
    if not original_name.lower().endswith(".mp4"):
        raise HTTPException(status_code=400, detail="Envie um arquivo MP4")

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4()}.mp4"
    destination = MEDIA_DIR / stored_name
    total_bytes = 0
    try:
        with destination.open("wb") as output:
            while chunk := await file.read(UPLOAD_CHUNK_SIZE):
                total_bytes += len(chunk)
                if total_bytes > MAX_VIDEO_BYTES:
                    raise HTTPException(status_code=413, detail="O MP4 deve ter no máximo 500 MB")
                output.write(chunk)
    except HTTPException:
        destination.unlink(missing_ok=True)
        raise
    except Exception:
        destination.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Não foi possível armazenar o vídeo")
    finally:
        await file.close()

    return MediaUpload(
        url=f"/api/media/{stored_name}",
        filename=original_name,
        size_bytes=total_bytes,
        content_type="video/mp4",
    )


@router.get("/media/{filename}")
async def serve_video(filename: str) -> FileResponse:
    candidate = (MEDIA_DIR / filename).resolve()
    if MEDIA_DIR.resolve() not in candidate.parents or not candidate.is_file():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(candidate, media_type="video/mp4")
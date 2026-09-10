from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class VideoBase(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=40)
    client: str = Field(min_length=2, max_length=80)
    duration: str = Field(default="00:00", max_length=12)
    description: str = Field(default="", max_length=500)
    thumbnail_url: str = Field(default="", max_length=2000)
    video_url: str = Field(default="", max_length=2000)
    featured: bool = False
    aspect_ratio: str = Field(default="16 / 9", max_length=20)


class VideoCreate(VideoBase):
    pin: str = Field(min_length=1, max_length=32)


class Video(VideoBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdminAuthRequest(BaseModel):
    pin: str = Field(min_length=1, max_length=32)


class AdminAuthResponse(BaseModel):
    authenticated: bool
    message: str


class BrandSettings(BaseModel):
    logo_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BrandSettingsUpdate(BaseModel):
    pin: str = Field(min_length=1, max_length=32)
    logo_url: Optional[str] = Field(default=None, max_length=5_000_000)


class MediaUpload(BaseModel):
    url: str
    filename: str
    size_bytes: int
    content_type: str
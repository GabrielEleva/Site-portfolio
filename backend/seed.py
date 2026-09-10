import asyncio
from datetime import datetime, timezone

from lib.db import db, ensure_indexes


VIDEOS = [
    {
        "id": "v1",
        "title": "Redline Hypercar — Lançamento Oficial",
        "category": "Comerciais",
        "client": "Redline Motors",
        "duration": "01:45",
        "thumbnail_url": "https://images.unsplash.com/photo-1612544409025-e1f6a56c1152?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "featured": True,
        "aspect_ratio": "16 / 9",
        "description": "Comercial cinematográfico de alta velocidade gravado em pista fechada com câmeras RED 8K e drones FPV.",
    },
    {
        "id": "v2",
        "title": "Aura Sound — Bastidores",
        "category": "Documentários",
        "client": "Aura Music Festival",
        "duration": "04:20",
        "thumbnail_url": "https://images.unsplash.com/photo-1632187989763-c9c620420b4d?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "featured": True,
        "aspect_ratio": "16 / 9",
        "description": "Uma imersão emocional nos bastidores do maior festival de música independente do estado.",
    },
    {
        "id": "v3",
        "title": "Eclipse Fashion — Outono / Inverno",
        "category": "Videoclipes",
        "client": "Eclipse Label",
        "duration": "02:10",
        "thumbnail_url": "https://images.unsplash.com/photo-1608186286925-8c0e1c1fbeac?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "featured": False,
        "aspect_ratio": "16 / 9",
        "description": "Fashion film com iluminação neo-noir, jogos de sombras e paleta de cores dramática.",
    },
    {
        "id": "v4",
        "title": "Urban Essence — Campanha Institucional",
        "category": "Institucional",
        "client": "Urban Construct",
        "duration": "02:50",
        "thumbnail_url": "https://images.unsplash.com/photo-1611784728558-6c7d9b409cdf?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        "featured": True,
        "aspect_ratio": "16 / 9",
        "description": "Filme institucional revelando a transformação arquitetônica e o propósito por trás dos novos empreendimentos.",
    },
]


async def seed() -> None:
    now = datetime.now(timezone.utc)
    for video in VIDEOS:
        await db.videos.update_one(
            {"id": video["id"]},
            {"$setOnInsert": {**video, "created_at": now}},
            upsert=True,
        )
    await db.site_settings.update_one(
        {"key": "brand"},
        {"$setOnInsert": {"key": "brand", "logo_url": None, "updated_at": now}},
        upsert=True,
    )
    await ensure_indexes()


if __name__ == "__main__":
    asyncio.run(seed())
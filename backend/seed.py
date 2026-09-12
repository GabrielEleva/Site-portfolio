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
        "title": "Aura Sound — Cobertura de evento",
        "category": "Eventos",
        "client": "Aura Music Festival",
        "duration": "04:20",
        "thumbnail_url": "https://images.unsplash.com/photo-1632187989763-c9c620420b4d?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "featured": True,
        "aspect_ratio": "16 / 9",
        "description": "Uma cobertura sensível da energia, das pessoas e dos momentos que fizeram este evento acontecer.",
    },
    {
        "id": "v3",
        "title": "Vista Aérea — Imagens de impacto",
        "category": "Drone",
        "client": "Projeto autoral",
        "duration": "02:10",
        "thumbnail_url": "https://images.unsplash.com/photo-1608186286925-8c0e1c1fbeac?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "featured": False,
        "aspect_ratio": "16 / 9",
        "description": "Imagens aéreas para revelar escala, movimento e novas perspectivas de um projeto.",
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

PHOTOS = [
    {
        "id": "p1",
        "title": "Estrada aberta",
        "category": "Drone",
        "image_url": "https://images.unsplash.com/photo-1660591900271-a7e5f7404f36?crop=entropy&cs=srgb&fm=jpg&w=1400&q=85",
        "alt": "Estrada atravessando uma paisagem aérea em preto e branco",
    },
    {
        "id": "p2",
        "title": "Névoa da serra",
        "category": "Drone",
        "image_url": "https://images.unsplash.com/photo-1627650875150-843d6c9c4c76?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "alt": "Árvores e montanhas cobertas por névoa",
    },
    {
        "id": "p3",
        "title": "Por trás da câmera",
        "category": "Stills",
        "image_url": "https://images.unsplash.com/photo-1556912300-3017f3de2aa6?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "alt": "Equipe trabalhando em uma filmagem",
    },
    {
        "id": "p4",
        "title": "Olhar de set",
        "category": "Stills",
        "image_url": "https://images.unsplash.com/photo-1496559249665-c7e2874707ea?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
        "alt": "Filmmaker registrando uma cena",
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
    for photo in PHOTOS:
        await db.photos.update_one(
            {"id": photo["id"]},
            {"$setOnInsert": {**photo, "created_at": now}},
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
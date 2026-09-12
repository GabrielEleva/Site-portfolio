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
    hero_eyebrow: str = "Filmmaker · SP / Vale do Paraíba"
    hero_title: str = "Transformamos\nhistórias\nem imagens."
    hero_footer: str = "Captação, direção e pós-produção para histórias que pedem presença."
    about_label: str = "Sobre o trabalho"
    about_title: str = "Cada frame carrega\numa intenção."
    about_description: str = "Sou filmmaker e uso imagem, movimento e som para contar histórias com intenção. Este é um recorte do meu trabalho em eventos, campanhas comerciais e imagens aéreas."
    about_highlight: str = "Imagem com ritmo, textura e verdade"
    service_events_title: str = "Cobertura de eventos"
    service_events_description: str = "A energia, as pessoas e os momentos que não podem se repetir."
    service_commercials_title: str = "Vídeos comerciais"
    service_commercials_description: str = "Filmes para apresentar marcas, produtos e ideias com personalidade."
    service_drone_title: str = "Imagens de drone"
    service_drone_description: str = "Perspectivas aéreas para ampliar a escala e o impacto da sua história."
    portfolio_label: str = "Trabalhos selecionados"
    portfolio_title: str = "Feito para\nser sentido."
    portfolio_description: str = "Eventos, campanhas e imagens aéreas que ganharam movimento, som e intenção."
    gallery_label: str = "Galeria fotográfica"
    gallery_title: str = "Além do\nmovimento."
    gallery_description: str = "Fotos aéreas, stills e fragmentos do set para contar a história por outros ângulos."
    contact_label: str = "Próximo projeto"
    contact_title: str = "Vamos elevar\na sua história?"
    contact_description: str = "Me conte o que você quer registrar ou colocar no mundo. A gente conversa pelo WhatsApp e transforma a ideia em filme."
    contact_button_label: str = "Falar sobre um projeto"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BrandSettingsUpdate(BaseModel):
    pin: str = Field(min_length=1, max_length=32)
    logo_url: Optional[str] = Field(default=None, max_length=5_000_000)
    hero_eyebrow: Optional[str] = Field(default=None, max_length=120)
    hero_title: Optional[str] = Field(default=None, max_length=240)
    hero_footer: Optional[str] = Field(default=None, max_length=240)
    about_label: Optional[str] = Field(default=None, max_length=120)
    about_title: Optional[str] = Field(default=None, max_length=240)
    about_description: Optional[str] = Field(default=None, max_length=600)
    about_highlight: Optional[str] = Field(default=None, max_length=160)
    service_events_title: Optional[str] = Field(default=None, max_length=120)
    service_events_description: Optional[str] = Field(default=None, max_length=300)
    service_commercials_title: Optional[str] = Field(default=None, max_length=120)
    service_commercials_description: Optional[str] = Field(default=None, max_length=300)
    service_drone_title: Optional[str] = Field(default=None, max_length=120)
    service_drone_description: Optional[str] = Field(default=None, max_length=300)
    portfolio_label: Optional[str] = Field(default=None, max_length=120)
    portfolio_title: Optional[str] = Field(default=None, max_length=240)
    portfolio_description: Optional[str] = Field(default=None, max_length=300)
    gallery_label: Optional[str] = Field(default=None, max_length=120)
    gallery_title: Optional[str] = Field(default=None, max_length=240)
    gallery_description: Optional[str] = Field(default=None, max_length=300)
    contact_label: Optional[str] = Field(default=None, max_length=120)
    contact_title: Optional[str] = Field(default=None, max_length=240)
    contact_description: Optional[str] = Field(default=None, max_length=500)
    contact_button_label: Optional[str] = Field(default=None, max_length=120)


class MediaUpload(BaseModel):
    url: str
    filename: str
    size_bytes: int
    content_type: str


class PhotoBase(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=40)
    image_url: str = Field(min_length=1, max_length=2000)
    alt: str = Field(default="", max_length=180)


class PhotoCreate(PhotoBase):
    pin: str = Field(min_length=1, max_length=32)


class Photo(PhotoBase):
    id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Camera, ChevronRight, Clapperboard, LockKeyhole, Menu, MessageCircle, Play, X } from "lucide-react";

import { apiGet } from "@/lib/api";
import { DEFAULT_SITE_COPY } from "@/lib/siteCopy";
import type { BrandSettings, Photo, Video } from "@/lib/types";
import BrandLogo from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const WHATSAPP_URL = "https://wa.me/5512992431406?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20a%20Eleva%20Filmmaking.";
const HERO_IMAGE = "https://images.unsplash.com/photo-1612544409025-e1f6a56c1152?crop=entropy&cs=srgb&fm=jpg&w=2200&q=85";

const fetchVideos = () => apiGet<Video[]>("/videos");
const fetchSettings = () => apiGet<BrandSettings>("/settings");
const fetchPhotos = () => apiGet<Photo[]>("/photos");

function LogoSlot({ settingsLogo, compact = false }: { settingsLogo?: string | null; compact?: boolean }) {
  return <BrandLogo settingsLogo={settingsLogo} compact={compact} />;
}

function SectionLabel({ number, children }: { number: string; children: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.3em] text-zinc-500" data-testid={`section-label-${number}`}>
      <span className="text-[#e50914]">{number}</span>
      <span className="h-px w-8 bg-[#e50914]/60" />
      <span>{children}</span>
    </div>
  );
}

function WhatsAppButton({ floating = false }: { floating?: boolean }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className={floating ? "eleva-pulse fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-[#061b0d] shadow-2xl shadow-[#25D366]/20 transition-transform duration-300 hover:scale-110 focus-ring" : "focus-ring inline-flex items-center gap-2 rounded-sm bg-[#e50914] px-5 py-3 text-xs font-semibold uppercase tracking-[.16em] text-white transition-all duration-300 hover:bg-[#ff1e27] hover:shadow-xl hover:shadow-[#e50914]/20"}
      data-testid={floating ? "whatsapp-floating-button" : "whatsapp-header-button"}
      aria-label="Solicitar orçamento pelo WhatsApp"
    >
      <MessageCircle size={floating ? 24 : 16} strokeWidth={2.5} />
      {!floating && <span>Solicitar orçamento</span>}
      {floating && <span className="sr-only">Solicitar orçamento</span>}
    </a>
  );
}

function VideoCard({ video, onOpen }: { video: Video; onOpen: (video: Video) => void }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpen(video)}
      className="group relative w-full overflow-hidden rounded-sm border border-white/[.08] bg-[#121215] text-left focus-ring"
      data-testid={`portfolio-video-card-${video.id}`}
    >
      <div className="relative aspect-video overflow-hidden bg-[#1a1a1e]">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} loading="lazy" className="size-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-100" data-testid={`video-thumbnail-${video.id}`} />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-[#1a1a1e] to-[#0b0b0c]" data-testid={`video-thumbnail-placeholder-${video.id}`}><Camera className="text-zinc-700" size={32} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-transparent to-black/10" />
        <div className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-[#e50914] text-white shadow-lg shadow-[#e50914]/40"><Play size={17} fill="currentColor" /></span>
        </div>
        <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white">{video.duration}</span>
        {video.featured && <span className="absolute left-3 top-3 rounded-sm bg-[#e50914] px-2 py-1 font-mono text-[9px] uppercase tracking-[.18em] text-white">Destaque</span>}
      </div>
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Badge variant="outline" className="rounded-sm border-[#e50914]/50 bg-[#e50914]/5 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-[#ff1e27]">{video.category}</Badge>
          <ArrowUpRight size={16} className="text-zinc-600 transition duration-300 group-hover:text-[#ff1e27]" />
        </div>
        <h3 className="font-heading text-xl font-semibold leading-tight text-white">{video.title}</h3>
        <p className="mt-2 text-xs uppercase tracking-[.16em] text-zinc-500">{video.client}</p>
      </div>
    </motion.button>
  );
}

function PhotoCard({ photo, featured = false, onOpen }: { photo: Photo; featured?: boolean; onOpen: (photo: Photo) => void }) {
  return <motion.button type="button" whileHover={{ y: -5 }} transition={{ duration: 0.25 }} onClick={() => onOpen(photo)} className={`group relative overflow-hidden border border-white/[.08] bg-[#121215] text-left focus-ring ${featured ? "md:col-span-2 md:row-span-2" : ""}`} data-testid={`gallery-photo-card-${photo.id}`}><div className={`${featured ? "aspect-[4/3]" : "aspect-[4/3]"} overflow-hidden`}><img src={photo.image_url} alt={photo.alt || photo.title} loading="lazy" className="size-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" data-testid={`gallery-photo-image-${photo.id}`} /><div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5"><div><Badge className="rounded-sm bg-[#e50914] text-[9px] uppercase tracking-[.18em]">{photo.category}</Badge><h3 className="mt-2 font-heading text-lg font-semibold text-white sm:text-xl">{photo.title}</h3></div><ArrowUpRight size={18} className="text-white/60 transition group-hover:text-[#ff1e27]" /></div></div></motion.button>;
}

function AccentLines({ text, accentLine = 1 }: { text: string; accentLine?: number }) {
  return <>{text.split("\n").map((line, index) => <span key={`${line}-${index}`} className={`block ${index === accentLine ? "text-[#e50914]" : ""}`}>{line}</span>)}</>;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [category, setCategory] = useState("Todos");
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [photoCategory, setPhotoCategory] = useState("Todos");
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const videosQuery = useQuery({ queryKey: ["videos"], queryFn: fetchVideos, retry: 1 });
  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: fetchSettings, retry: 1 });
  const photosQuery = useQuery({ queryKey: ["photos"], queryFn: fetchPhotos, retry: 1 });
  const videos = videosQuery.data ?? [];
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(videos.map((video) => video.category)))], [videos]);
  const visibleVideos = category === "Todos" ? videos : videos.filter((video) => video.category === category);
  const photos = photosQuery.data ?? [];
  const photoCategories = useMemo(() => ["Todos", ...Array.from(new Set(photos.map((photo) => photo.category)))], [photos]);
  const visiblePhotos = photoCategory === "Todos" ? photos : photos.filter((photo) => photo.category === photoCategory);
  const copy = { ...DEFAULT_SITE_COPY, ...(settingsQuery.data ?? {}) };

  const closeMobile = () => setMobileMenuOpen(false);
  const scrollTo = (id: string) => {
    closeMobile();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0b0c] text-white" data-testid="public-portfolio-page">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/[.07] bg-[#0b0b0c]/75 backdrop-blur-xl" data-testid="site-header">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#inicio" onClick={closeMobile} className="focus-ring" data-testid="nav-logo"><LogoSlot settingsLogo={settingsQuery.data?.logo_url} /></a>
          <nav className="hidden items-center gap-8 lg:flex" data-testid="desktop-navigation">
            <button onClick={() => scrollTo("inicio")} className="focus-ring font-mono text-[10px] uppercase tracking-[.22em] text-zinc-400 transition hover:text-white" data-testid="nav-link-inicio">Início</button>
            <button onClick={() => scrollTo("sobre")} className="focus-ring font-mono text-[10px] uppercase tracking-[.22em] text-zinc-400 transition hover:text-white" data-testid="nav-link-sobre">Sobre</button>
            <button onClick={() => scrollTo("portfolio")} className="focus-ring font-mono text-[10px] uppercase tracking-[.22em] text-zinc-400 transition hover:text-white" data-testid="nav-link-portfolio">Portfólio</button>
            <button onClick={() => scrollTo("galeria")} className="focus-ring font-mono text-[10px] uppercase tracking-[.22em] text-zinc-400 transition hover:text-white" data-testid="nav-link-galeria">Fotos</button>
            <button onClick={() => scrollTo("contato")} className="focus-ring font-mono text-[10px] uppercase tracking-[.22em] text-zinc-400 transition hover:text-white" data-testid="nav-link-contato">Contato</button>
            <Link to="/admin" className="focus-ring inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-zinc-500 transition hover:text-[#ff1e27]" data-testid="nav-link-admin"><LockKeyhole size={12} /> Área restrita</Link>
          </nav>
          <div className="hidden items-center gap-4 sm:flex">
            <WhatsAppButton />
          </div>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="grid size-10 place-items-center border border-white/10 text-zinc-300 sm:hidden focus-ring" data-testid="mobile-menu-button" aria-label="Abrir menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenuOpen && <div className="border-t border-white/[.07] bg-[#0b0b0c] px-5 py-5 sm:hidden" data-testid="mobile-navigation">
          <div className="flex flex-col gap-5">
            <button onClick={() => scrollTo("inicio")} className="text-left font-mono text-xs uppercase tracking-[.2em] text-zinc-400" data-testid="mobile-nav-link-inicio">Início</button>
            <button onClick={() => scrollTo("sobre")} className="text-left font-mono text-xs uppercase tracking-[.2em] text-zinc-400" data-testid="mobile-nav-link-sobre">Sobre</button>
            <button onClick={() => scrollTo("portfolio")} className="text-left font-mono text-xs uppercase tracking-[.2em] text-zinc-400" data-testid="mobile-nav-link-portfolio">Portfólio</button>
            <button onClick={() => scrollTo("galeria")} className="text-left font-mono text-xs uppercase tracking-[.2em] text-zinc-400" data-testid="mobile-nav-link-galeria">Fotos</button>
            <button onClick={() => scrollTo("contato")} className="text-left font-mono text-xs uppercase tracking-[.2em] text-zinc-400" data-testid="mobile-nav-link-contato">Contato</button>
            <Link to="/admin" onClick={closeMobile} className="font-mono text-xs uppercase tracking-[.2em] text-[#ff1e27]" data-testid="mobile-nav-link-admin">Área restrita</Link>
            <WhatsAppButton />
          </div>
        </div>}
      </header>

      <main>
        <section id="inicio" className="relative flex min-h-[720px] items-end overflow-hidden pb-20 pt-36 sm:min-h-[860px] sm:pb-28 lg:pb-32" data-testid="hero-section">
          <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(${HERO_IMAGE})` }} data-testid="hero-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0c] via-[#0b0b0c]/75 to-[#0b0b0c]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-transparent to-[#0b0b0c]/20" />
          <div className="grain absolute inset-0 opacity-[.16]" />
          <div className="absolute left-[52%] top-[28%] hidden h-72 w-px bg-gradient-to-b from-transparent via-[#e50914]/70 to-transparent lg:block eleva-scan" />
          <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="max-w-4xl">
              <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.32em] text-[#ff1e27]" data-testid="hero-eyebrow"><span className="h-px w-10 bg-[#e50914]" /> {copy.hero_eyebrow}</div>
              <h1 className="font-heading text-5xl font-extrabold uppercase leading-[.9] tracking-[-.055em] text-white sm:text-7xl lg:text-[7.7rem]" data-testid="hero-title"><AccentLines text={copy.hero_title} /></h1>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
                <button onClick={() => scrollTo("portfolio")} className="focus-ring inline-flex w-fit items-center gap-3 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[.2em] text-[#0b0b0c] transition duration-300 hover:bg-[#ff1e27] hover:text-white" data-testid="hero-cta-portfolio">Explorar portfólio <ArrowDown size={16} /></button>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="focus-ring inline-flex w-fit items-center gap-3 text-xs font-semibold uppercase tracking-[.2em] text-white transition hover:text-[#ff1e27]" data-testid="hero-cta-quote">Pedir um orçamento <ArrowUpRight size={16} /></a>
              </div>
            </motion.div>
            <div className="mt-20 flex items-end justify-between border-t border-white/10 pt-5 sm:mt-28" data-testid="hero-footer-note">
              <p className="max-w-[240px] text-xs leading-relaxed text-zinc-400" data-testid="hero-footer-copy">{copy.hero_footer}</p>
              <p className="hidden font-mono text-[10px] uppercase tracking-[.25em] text-zinc-500 sm:block">Scroll to explore <ChevronRight className="ml-2 inline rotate-90" size={13} /></p>
            </div>
          </div>
        </section>

        <section id="sobre" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-12" data-testid="about-section">
          <SectionLabel number="01">{copy.about_label}</SectionLabel>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
            <div>
              <h2 className="max-w-3xl font-heading text-4xl font-bold uppercase leading-[.95] tracking-[-.045em] sm:text-6xl" data-testid="about-title"><AccentLines text={copy.about_title} /></h2>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg" data-testid="about-description">{copy.about_description}</p>
              <div className="mt-10 flex items-center gap-4"><span className="grid size-11 place-items-center rounded-full border border-[#e50914]/40 text-[#ff1e27]"><Clapperboard size={18} /></span><span className="font-mono text-[10px] uppercase tracking-[.22em] text-zinc-500" data-testid="about-highlight">{copy.about_highlight}</span></div>
            </div>
            <div className="grid gap-px self-end border border-white/[.08] bg-white/[.08]" data-testid="about-services">
              <div className="bg-[#121215] p-6 sm:p-8" data-testid="service-events"><span className="font-mono text-[10px] text-[#e50914]">01 /</span><h3 className="mt-4 font-heading text-2xl font-semibold uppercase text-white">{copy.service_events_title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy.service_events_description}</p></div>
              <div className="bg-[#121215] p-6 sm:p-8" data-testid="service-commercials"><span className="font-mono text-[10px] text-[#e50914]">02 /</span><h3 className="mt-4 font-heading text-2xl font-semibold uppercase text-white">{copy.service_commercials_title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy.service_commercials_description}</p></div>
              <div className="bg-[#121215] p-6 sm:p-8" data-testid="service-drone"><span className="font-mono text-[10px] text-[#e50914]">03 /</span><h3 className="mt-4 font-heading text-2xl font-semibold uppercase text-white">{copy.service_drone_title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy.service_drone_description}</p></div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="border-y border-white/[.06] bg-[#0e0e10]" data-testid="portfolio-section">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><SectionLabel number="02">{copy.portfolio_label}</SectionLabel><h2 className="font-heading text-4xl font-bold uppercase leading-none tracking-[-.04em] sm:text-6xl" data-testid="portfolio-title"><AccentLines text={copy.portfolio_title} /></h2></div><p className="max-w-xs text-sm leading-relaxed text-zinc-500" data-testid="portfolio-description">{copy.portfolio_description}</p></div>
            <div className="mt-12 flex flex-wrap gap-2 border-b border-white/[.08] pb-4" data-testid="portfolio-filters">
              {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`focus-ring border px-4 py-2 font-mono text-[10px] uppercase tracking-[.16em] transition ${category === item ? "border-[#e50914] bg-[#e50914] text-white" : "border-white/10 text-zinc-500 hover:border-white/30 hover:text-white"}`} data-testid={`portfolio-filter-${item.toLowerCase().replaceAll(" ", "-")}`}>{item}</button>)}
            </div>
            {videosQuery.isError && <div className="border border-[#e50914]/30 bg-[#e50914]/5 p-6 text-sm text-zinc-300" data-testid="portfolio-error">Não foi possível atualizar os filmes agora. O restante do site continua disponível.</div>}
            <div className="mt-8 grid gap-5 md:grid-cols-2" data-testid="portfolio-grid">
              {visibleVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={setActiveVideo} />)}
              {!videosQuery.isPending && visibleVideos.length === 0 && <div className="col-span-full border border-dashed border-white/10 py-20 text-center text-sm text-zinc-500" data-testid="portfolio-empty">Novos filmes chegando em breve.</div>}
              {videosQuery.isPending && [1, 2].map((item) => <div key={item} className="aspect-video animate-pulse bg-[#121215]" data-testid={`portfolio-loading-${item}`} />)}
            </div>
          </div>
        </section>

        <section id="galeria" className="border-b border-white/[.06] bg-[#0b0b0c]" data-testid="gallery-section">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-12"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><SectionLabel number="03">{copy.gallery_label}</SectionLabel><h2 className="font-heading text-4xl font-bold uppercase leading-none tracking-[-.04em] sm:text-6xl" data-testid="gallery-title"><AccentLines text={copy.gallery_title} /></h2></div><p className="max-w-xs text-sm leading-relaxed text-zinc-500" data-testid="gallery-description">{copy.gallery_description}</p></div><div className="mt-10 flex flex-wrap gap-2 border-b border-white/[.08] pb-4" data-testid="gallery-filters">{photoCategories.map((item) => <button key={item} onClick={() => setPhotoCategory(item)} className={`focus-ring border px-4 py-2 font-mono text-[10px] uppercase tracking-[.16em] transition ${photoCategory === item ? "border-[#e50914] bg-[#e50914] text-white" : "border-white/10 text-zinc-500 hover:border-white/30 hover:text-white"}`} data-testid={`gallery-filter-${item.toLowerCase().replaceAll(" ", "-")}`}>{item}</button>)}</div><div className="mt-8 grid gap-4 md:grid-cols-3" data-testid="gallery-grid">{visiblePhotos.map((photo, index) => <PhotoCard key={photo.id} photo={photo} featured={index === 0} onOpen={setActivePhoto} />)}{photosQuery.isPending && [1, 2, 3].map((item) => <div key={item} className="aspect-[4/3] animate-pulse bg-[#121215]" data-testid={`gallery-loading-${item}`} />)}{!photosQuery.isPending && visiblePhotos.length === 0 && <div className="col-span-full border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500" data-testid="gallery-empty">Novas fotos chegando em breve.</div>}</div></div>
        </section>

        <section id="contato" className="relative overflow-hidden" data-testid="contact-section">
          <div className="absolute right-[-12%] top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,.18),transparent_65%)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-12"><SectionLabel number="04">{copy.contact_label}</SectionLabel><div className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><h2 className="max-w-3xl font-heading text-5xl font-bold uppercase leading-[.9] tracking-[-.05em] sm:text-7xl" data-testid="contact-title"><AccentLines text={copy.contact_title} /></h2><p className="mt-8 max-w-md text-base leading-relaxed text-zinc-400" data-testid="contact-description">{copy.contact_description}</p></div><div className="lg:justify-self-end"><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="focus-ring group inline-flex items-center gap-5 border border-[#e50914] px-6 py-5 text-xs font-semibold uppercase tracking-[.18em] text-white transition duration-300 hover:bg-[#e50914]" data-testid="contact-whatsapp-button"><span className="grid size-9 place-items-center rounded-full bg-[#25D366] text-[#061b0d]"><MessageCircle size={18} /></span><span>{copy.contact_button_label}</span><ArrowUpRight size={18} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" /></a></div></div></div>
        </section>
      </main>

      <footer className="border-t border-white/[.08]" data-testid="site-footer"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><Link to="/" className="focus-ring" data-testid="footer-logo"><LogoSlot settingsLogo={settingsQuery.data?.logo_url} compact /></Link><p className="font-mono text-[9px] uppercase tracking-[.2em] text-zinc-600" data-testid="footer-copyright">© {new Date().getFullYear()} Eleva Filmmaking · São Paulo / Vale do Paraíba</p><div className="flex items-center gap-5"><Link to="/admin" className="focus-ring font-mono text-[9px] uppercase tracking-[.2em] text-zinc-500 transition hover:text-[#ff1e27]" data-testid="footer-admin-link">Área restrita</Link><a href="#inicio" className="focus-ring grid size-8 place-items-center border border-white/10 text-zinc-400 transition hover:border-[#e50914] hover:text-white" data-testid="footer-back-to-top" aria-label="Voltar ao topo"><ArrowDown size={14} className="rotate-180" /></a></div></div></footer>
      <WhatsAppButton floating />

      <Dialog open={Boolean(activePhoto)} onOpenChange={(open) => !open && setActivePhoto(null)}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#0b0b0c] p-0 text-white" data-testid="photo-modal">{activePhoto && <><img src={activePhoto.image_url} alt={activePhoto.alt || activePhoto.title} className="max-h-[76vh] w-full object-contain" data-testid="photo-modal-image" /><div className="flex items-center justify-between gap-4 p-6"><div><Badge className="rounded-sm bg-[#e50914] text-[9px] uppercase tracking-[.2em]">{activePhoto.category}</Badge><DialogTitle className="mt-3 font-heading text-2xl uppercase text-white" data-testid="photo-modal-title">{activePhoto.title}</DialogTitle></div><DialogDescription className="sr-only">{activePhoto.alt || activePhoto.title}</DialogDescription></div></>}</DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeVideo)} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#0b0b0c] p-0 text-white" data-testid="video-modal">
          {activeVideo && <><div className="aspect-video w-full bg-black"><video src={activeVideo.video_url} poster={activeVideo.thumbnail_url} controls autoPlay playsInline className="size-full" data-testid="video-modal-player" /></div><div className="p-6 sm:p-8"><DialogHeader><div className="mb-3 flex items-center gap-3"><Badge className="rounded-sm bg-[#e50914] text-[9px] uppercase tracking-[.2em]">{activeVideo.category}</Badge><span className="font-mono text-[10px] text-zinc-500">{activeVideo.client}</span></div><DialogTitle className="font-heading text-3xl uppercase tracking-[-.03em] text-white" data-testid="video-modal-title">{activeVideo.title}</DialogTitle><DialogDescription className="max-w-2xl pt-3 text-sm leading-relaxed text-zinc-400" data-testid="video-modal-description">{activeVideo.description}</DialogDescription></DialogHeader><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="focus-ring mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#ff1e27] transition hover:text-white" data-testid="video-modal-quote-button">Quero um filme assim <ArrowUpRight size={15} /></a></div></>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
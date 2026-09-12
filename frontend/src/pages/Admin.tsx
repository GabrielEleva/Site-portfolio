import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Film, ImagePlus, LogOut, Pencil, Plus, Save, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { apiGet, apiPost, apiPut, apiUpload } from "@/lib/api";
import type { AuthResponse, BrandSettings, MediaUpload, Video, VideoInput } from "@/lib/types";
import BrandLogo from "@/components/BrandLogo";
import AdminPhotoManager from "@/components/AdminPhotoManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyForm: Omit<VideoInput, "pin"> = {
  title: "",
  category: "Comerciais",
  client: "",
  duration: "01:30",
  description: "",
  thumbnail_url: "",
  video_url: "",
  featured: false,
  aspect_ratio: "16 / 9",
};
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 10 * 1024 * 1024;

function Field({ label, name, value, onChange, placeholder, type = "text" }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <div className="space-y-2"><Label htmlFor={name} className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">{label}</Label><Input id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} className="h-11 rounded-sm border-white/10 bg-[#0b0b0c] text-sm text-white placeholder:text-zinc-700 focus-visible:ring-[#e50914]" data-testid={`admin-${name}-input`} /></div>;
}

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("eleva-admin") === "1");
  const [pin, setPin] = useState(() => sessionStorage.getItem("eleva-pin") ?? "");
  const [authPin, setAuthPin] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const videosQuery = useQuery({ queryKey: ["videos"], queryFn: () => apiGet<Video[]>("/videos"), enabled: authenticated });
  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: () => apiGet<BrandSettings>("/settings"), enabled: authenticated });

  const authMutation = useMutation({
    mutationFn: (value: string) => apiPost<AuthResponse>("/admin/auth", { pin: value }),
    onSuccess: (result, value) => {
      if (result.authenticated) {
        setPin(value);
        setAuthenticated(true);
        sessionStorage.setItem("eleva-admin", "1");
        sessionStorage.setItem("eleva-pin", value);
        setAuthMessage("");
      } else setAuthMessage(result.message);
    },
    onError: () => setAuthMessage("Não foi possível validar o PIN agora."),
  });

  const videoMutation = useMutation({
    mutationFn: (payload: VideoInput) => editingId ? apiPut<Video>(`/admin/videos/${editingId}`, payload) : apiPost<Video>("/admin/videos", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setForm(emptyForm);
      setEditingId(null);
      setThumbnailPreview(null);
      setThumbnailUploadProgress(null);
      toast.success(editingId ? "Filme atualizado." : "Filme adicionado ao portfólio.");
    },
    onError: () => toast.error("Não foi possível salvar. Verifique o PIN e os campos."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiPost<AuthResponse>(`/admin/videos/${id}/delete`, { pin }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["videos"] }); toast.success("Filme removido."); },
    onError: () => toast.error("Não foi possível remover este filme."),
  });

  const settingsMutation = useMutation({
    mutationFn: (logo_url: string | null) => apiPut<BrandSettings>("/admin/settings", { pin, logo_url }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Logo atualizada."); },
    onError: () => toast.error("Não foi possível atualizar a logo."),
  });

  const categories = useMemo(() => ["Eventos", "Comerciais", "Drone", "Institucional", "Videoclipes"], []);
  const updateForm = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const handleAuth = (event: FormEvent) => { event.preventDefault(); if (authPin.trim()) authMutation.mutate(authPin.trim()); };
  const handleVideo = (event: FormEvent) => { event.preventDefault(); videoMutation.mutate({ ...form, pin }); };
  const handleLogoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const result = String(reader.result); setLogoPreview(result); settingsMutation.mutate(result); };
    reader.readAsDataURL(file);
  };
  const handleVideoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".mp4")) {
      toast.error("Escolha um arquivo MP4.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("O MP4 deve ter no máximo 500 MB.");
      event.target.value = "";
      return;
    }
    const payload = new FormData();
    payload.append("pin", pin);
    payload.append("file", file);
    setUploadingVideo(true);
    setUploadProgress(0);
    void apiUpload<MediaUpload>("/admin/media/video", payload, setUploadProgress)
      .then((uploaded) => {
        updateForm("video_url", uploaded.url);
        setUploadProgress(100);
        toast.success("MP4 armazenado. O link já foi preenchido no filme.");
      })
      .catch(() => {
        setUploadProgress(null);
        toast.error("Não foi possível armazenar este MP4.");
      })
      .finally(() => setUploadingVideo(false));
  };
  const handleThumbnailFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const suffix = file.name.toLowerCase();
    if (!(suffix.endsWith(".jpg") || suffix.endsWith(".jpeg") || suffix.endsWith(".png"))) {
      toast.error("Escolha uma capa JPG ou PNG.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      toast.error("A thumbnail deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }
    setThumbnailPreview(URL.createObjectURL(file));
    const payload = new FormData();
    payload.append("pin", pin);
    payload.append("file", file);
    setUploadingThumbnail(true);
    setThumbnailUploadProgress(0);
    void apiUpload<MediaUpload>("/admin/media/thumbnail", payload, setThumbnailUploadProgress)
      .then((uploaded) => {
        updateForm("thumbnail_url", uploaded.url);
        setThumbnailPreview(uploaded.url);
        setThumbnailUploadProgress(100);
        toast.success("Thumbnail armazenada e pronta para salvar.");
      })
      .catch(() => {
        setThumbnailPreview(null);
        setThumbnailUploadProgress(null);
        toast.error("Não foi possível armazenar esta thumbnail.");
      })
      .finally(() => setUploadingThumbnail(false));
  };
  const editVideo = (video: Video) => {
    setEditingId(video.id);
    setForm({ title: video.title, category: video.category, client: video.client, duration: video.duration, description: video.description, thumbnail_url: video.thumbnail_url, video_url: video.video_url, featured: video.featured, aspect_ratio: video.aspect_ratio });
    setThumbnailPreview(video.thumbnail_url || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const signOut = () => { sessionStorage.removeItem("eleva-admin"); sessionStorage.removeItem("eleva-pin"); setAuthenticated(false); setPin(""); navigate("/"); };

  if (!authenticated) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0b0b0c] px-5 text-white" data-testid="admin-login-page"><div className="grain fixed inset-0 opacity-[.12]" /><div className="relative w-full max-w-md border border-white/[.09] bg-[#121215] p-7 sm:p-10" data-testid="admin-login-card"><Link to="/" className="focus-ring mb-12 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-zinc-500 hover:text-white" data-testid="admin-back-home-link"><ArrowLeft size={14} /> Voltar ao site</Link><div className="mb-8 grid size-14 place-items-center rounded-full border border-[#e50914]/50 bg-[#e50914]/10 text-[#ff1e27]"><ShieldCheck size={24} /></div><p className="font-mono text-[10px] uppercase tracking-[.3em] text-[#ff1e27]">Eleva / portfólio</p><h1 className="mt-3 font-heading text-4xl font-bold uppercase leading-none tracking-[-.04em]" data-testid="admin-login-title">Gerenciar trabalhos</h1><p className="mt-4 text-sm leading-relaxed text-zinc-500">Digite o PIN para adicionar, editar ou remover trabalhos do seu portfólio.</p><form onSubmit={handleAuth} className="mt-8 space-y-4" data-testid="admin-login-form"><Label htmlFor="admin-pin" className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">PIN de acesso</Label><Input id="admin-pin" type="password" inputMode="numeric" value={authPin} onChange={(event) => setAuthPin(event.target.value)} placeholder="••••" className="h-12 rounded-sm border-white/10 bg-[#0b0b0c] text-lg tracking-[.3em] text-white focus-visible:ring-[#e50914]" data-testid="admin-pin-input" />{authMessage && <p className="text-xs text-[#ff1e27]" data-testid="admin-pin-error">{authMessage}</p>}<Button type="submit" disabled={authMutation.isPending} className="h-12 w-full rounded-sm bg-[#e50914] text-xs font-semibold uppercase tracking-[.18em] hover:bg-[#ff1e27]" data-testid="admin-pin-submit">{authMutation.isPending ? "Validando..." : "Entrar no portfólio"}</Button></form><p className="mt-8 border-t border-white/[.07] pt-5 font-mono text-[9px] uppercase tracking-[.16em] text-zinc-600" data-testid="admin-demo-hint">PIN de demonstração: 2001</p></div></div>;
  }

  return <div className="min-h-screen bg-[#0b0b0c] text-white" data-testid="admin-dashboard-page"><header className="sticky top-0 z-20 border-b border-white/[.08] bg-[#0b0b0c]/90 backdrop-blur-xl" data-testid="admin-header"><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"><Link to="/" className="focus-ring" data-testid="admin-brand-link"><BrandLogo settingsLogo={settingsQuery.data?.logo_url ?? logoPreview} /></Link><div className="flex items-center gap-4"><span className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-zinc-500 sm:flex" data-testid="admin-status"><span className="size-1.5 rounded-full bg-[#25D366]" /> Sessão ativa</span><button onClick={signOut} className="focus-ring inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-zinc-500 transition hover:text-[#ff1e27]" data-testid="admin-logout-button"><LogOut size={14} /> Sair</button></div></div></header><main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12"><div className="mb-12 flex flex-col justify-between gap-5 border-b border-white/[.08] pb-8 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.3em] text-[#ff1e27]">Conteúdo do portfólio</p><h1 className="mt-3 font-heading text-5xl font-bold uppercase leading-none tracking-[-.05em] sm:text-6xl" data-testid="admin-dashboard-title">Meus trabalhos<span className="text-[#e50914]">.</span></h1></div><p className="max-w-sm text-sm leading-relaxed text-zinc-500">Adicione e organize os filmes e fotos que representam seu olhar como filmmaker.</p></div><div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
    <section className="border border-white/[.08] bg-[#121215] p-6 sm:p-8" data-testid="admin-video-form-section"><div className="mb-8 flex items-center justify-between gap-4"><div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-[#e50914]/10 text-[#ff1e27]"><Film size={17} /></span><h2 className="font-heading text-2xl font-semibold uppercase" data-testid="admin-video-form-title">{editingId ? "Editar filme" : "Adicionar filme"}</h2></div><p className="mt-2 text-xs text-zinc-500">Envie um MP4 de até 500 MB ou use um link público.</p></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setThumbnailPreview(null); setThumbnailUploadProgress(null); }} className="focus-ring text-zinc-500 hover:text-white" data-testid="admin-cancel-edit-button" aria-label="Cancelar edição"><X size={18} /></button>}</div><form onSubmit={handleVideo} className="space-y-5" data-testid="admin-video-form"><div className="grid gap-5 sm:grid-cols-2"><Field label="Título do filme" name="video-title" value={form.title} onChange={(value) => updateForm("title", value)} placeholder="Nome do projeto" /><Field label="Cliente" name="video-client" value={form.client} onChange={(value) => updateForm("client", value)} placeholder="Marca ou pessoa" /></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="video-category" className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">Categoria</Label><select id="video-category" value={form.category} onChange={(event) => updateForm("category", event.target.value)} className="h-11 w-full rounded-sm border border-white/10 bg-[#0b0b0c] px-3 text-sm text-white outline-none focus:border-[#e50914]" data-testid="admin-video-category-input">{categories.map((category) => <option key={category}>{category}</option>)}</select></div><Field label="Duração" name="video-duration" value={form.duration} onChange={(value) => updateForm("duration", value)} placeholder="01:30" /></div><div className="space-y-3 rounded-sm border border-dashed border-white/10 bg-[#0b0b0c] p-4" data-testid="admin-thumbnail-upload-section"><div className="flex items-start gap-4"><div className="size-24 shrink-0 overflow-hidden border border-white/10 bg-[#121215]" data-testid="admin-thumbnail-preview">{thumbnailPreview ? <img src={thumbnailPreview} alt="Prévia da thumbnail" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-zinc-700"><ImagePlus size={20} /></div>}</div><div className="min-w-0 flex-1"><Label htmlFor="admin-thumbnail-file-input" className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-zinc-200" data-testid="admin-thumbnail-file-label"><Upload size={15} className="text-[#ff1e27]" /> Enviar capa</Label><p className="mt-2 text-[10px] text-zinc-500" data-testid="admin-thumbnail-upload-hint">JPG ou PNG · máximo 10 MB · preview imediato</p><input id="admin-thumbnail-file-input" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={handleThumbnailFile} disabled={uploadingThumbnail} className="sr-only" data-testid="admin-thumbnail-file-input" /></div></div>{thumbnailUploadProgress !== null && <div className="space-y-2" data-testid="admin-thumbnail-upload-progress"><div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={thumbnailUploadProgress} data-testid="admin-thumbnail-upload-progress-bar"><div className="h-full bg-[#e50914] transition-[width] duration-200" style={{ width: `${thumbnailUploadProgress}%` }} /></div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-zinc-500" data-testid="admin-thumbnail-upload-status">{uploadingThumbnail ? `Enviando ${thumbnailUploadProgress}%` : "Capa armazenada localmente e pronta para salvar"}</p></div>}</div><Field label="URL da thumbnail" name="video-thumbnail-url" value={form.thumbnail_url} onChange={(value) => { updateForm("thumbnail_url", value); setThumbnailPreview(value || null); }} placeholder="https://...jpg" /><Field label="URL do vídeo" name="video-url" value={form.video_url} onChange={(value) => updateForm("video_url", value)} placeholder="https://...mp4" /><div className="space-y-3 rounded-sm border border-dashed border-[#e50914]/40 bg-[#e50914]/[.04] p-4" data-testid="admin-video-upload-section"><div className="flex items-center justify-between gap-3"><div><Label htmlFor="admin-video-file-input" className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-zinc-200"><Upload size={15} className="text-[#ff1e27]" /> Enviar MP4</Label><p className="mt-2 text-[10px] text-zinc-500">Somente .mp4 · máximo 500 MB · armazenamento local</p></div><input id="admin-video-file-input" type="file" accept="video/mp4,.mp4" onChange={handleVideoFile} disabled={uploadingVideo} className="sr-only" data-testid="admin-video-file-input" /></div>{uploadProgress !== null && <div className="space-y-2" data-testid="admin-video-upload-progress"><div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress} data-testid="admin-video-upload-progress-bar"><div className="h-full bg-[#e50914] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} /></div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-zinc-500" data-testid="admin-video-upload-status">{uploadingVideo ? `Enviando ${uploadProgress}%` : "MP4 armazenado localmente e pronto para salvar"}</p></div>}</div><div className="space-y-2"><Label htmlFor="video-description" className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">Descrição</Label><Textarea id="video-description" value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Qual é a história por trás deste filme?" className="min-h-24 resize-none rounded-sm border-white/10 bg-[#0b0b0c] text-sm text-white placeholder:text-zinc-700 focus-visible:ring-[#e50914]" data-testid="admin-video-description-input" /></div><label className="flex cursor-pointer items-center gap-3 text-xs text-zinc-400" data-testid="admin-featured-toggle"><input type="checkbox" checked={form.featured} onChange={(event) => updateForm("featured", event.target.checked)} className="size-4 accent-[#e50914]" /> Marcar como destaque</label><Button type="submit" disabled={videoMutation.isPending || uploadingVideo || uploadingThumbnail} className="h-12 w-full rounded-sm bg-[#e50914] text-xs font-semibold uppercase tracking-[.18em] hover:bg-[#ff1e27]" data-testid="admin-save-video-button">{videoMutation.isPending ? "Salvando..." : editingId ? <><Save size={15} /> Salvar alterações</> : <><Plus size={15} /> Adicionar ao portfólio</>}</Button></form></section>
    <div className="space-y-8"><section className="border border-white/[.08] bg-[#121215] p-6 sm:p-8" data-testid="admin-logo-section"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-[#e50914]/10 text-[#ff1e27]"><ImagePlus size={17} /></span><h2 className="font-heading text-2xl font-semibold uppercase" data-testid="admin-logo-title">Logo da marca</h2></div><p className="mt-3 text-xs leading-relaxed text-zinc-500">Envie PNG, SVG ou WebP com fundo transparente para atualizar header e footer.</p><div className="mt-6 flex min-h-24 items-center justify-center border border-dashed border-white/10 bg-[#0b0b0c] p-4" data-testid="admin-logo-preview"><BrandLogo settingsLogo={logoPreview ?? settingsQuery.data?.logo_url} /></div><label htmlFor="admin-upload-logo" className="mt-4 flex h-11 cursor-pointer items-center justify-center gap-2 border border-white/10 text-xs font-semibold uppercase tracking-[.15em] text-zinc-300 transition hover:border-[#e50914] hover:text-white" data-testid="admin-upload-logo-button"><Upload size={15} /> Escolher arquivo</label><input id="admin-upload-logo" type="file" accept="image/png,image/svg+xml,image/webp" onChange={handleLogoFile} className="sr-only" data-testid="admin-upload-logo-input" /><div className="mt-3 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.16em] text-zinc-600">PDF recebido como referência</span><a href="https://customer-assets-m6fa6gv7.emergentagent.net/job_eleva-portfolio/artifacts/zupo7kme_Sem%20ti%CC%81tulo-1.pdf" target="_blank" rel="noreferrer" className="focus-ring font-mono text-[9px] uppercase tracking-[.16em] text-[#ff1e27]" data-testid="admin-logo-pdf-link">Ver logo original</a></div></section><section className="border border-[#e50914]/20 bg-[#e50914]/5 p-6" data-testid="admin-tip-card"><div className="flex items-start gap-3"><Check size={17} className="mt-0.5 text-[#25D366]" /><div><p className="text-sm font-semibold text-white">Pronto para receber arquivos</p><p className="mt-2 text-xs leading-relaxed text-zinc-400">Enquanto os vídeos finais não chegam, os exemplos do portfólio podem ser substituídos por links MP4 próprios a qualquer momento.</p></div></div></section></div></div><section className="mt-12" data-testid="admin-video-list-section"><div className="mb-5 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.3em] text-zinc-500">Conteúdo publicado</p><h2 className="mt-2 font-heading text-3xl font-semibold uppercase" data-testid="admin-video-list-title">Filmes no ar <span className="text-[#e50914]">({videosQuery.data?.length ?? 0})</span></h2></div></div><div className="grid gap-px border border-white/[.08] bg-white/[.08] sm:grid-cols-2 lg:grid-cols-4" data-testid="admin-video-list">{(videosQuery.data ?? []).map((video) => <article key={video.id} className="group bg-[#121215] p-4" data-testid={`admin-video-row-${video.id}`}><div className="relative aspect-video overflow-hidden bg-[#0b0b0c]">{video.thumbnail_url ? <img src={video.thumbnail_url} alt="" className="size-full object-cover opacity-70" /> : <div className="grid size-full place-items-center text-zinc-700" data-testid={`admin-video-thumbnail-placeholder-${video.id}`}><Film size={24} /></div>}<Badge className="absolute left-2 top-2 rounded-sm bg-black/80 text-[9px] uppercase tracking-widest text-zinc-300">{video.category}</Badge></div><h3 className="mt-4 line-clamp-2 font-heading text-lg font-semibold leading-tight" data-testid={`admin-video-title-${video.id}`}>{video.title}</h3><p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600">{video.client}</p><div className="mt-4 flex gap-2 border-t border-white/[.07] pt-3"><button onClick={() => editVideo(video)} className="focus-ring inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white" data-testid={`admin-edit-video-${video.id}`}><Pencil size={13} /> Editar</button><button onClick={() => deleteMutation.mutate(video.id)} className="focus-ring ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-[#ff1e27]" data-testid={`admin-delete-video-${video.id}`}><Trash2 size={13} /> Remover</button></div></article>)}</div></section><AdminPhotoManager pin={pin} /></main></div>;
}
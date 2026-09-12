import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { apiGet, apiPost, apiUpload } from "@/lib/api";
import type { AuthResponse, MediaUpload, Photo, PhotoInput } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_CATEGORIES = ["Drone", "Stills", "Eventos", "Bastidores"];
const emptyPhoto: Omit<PhotoInput, "pin"> = { title: "", category: "Drone", image_url: "", alt: "" };

export default function AdminPhotoManager({ pin }: { pin: string }) {
  const queryClient = useQueryClient();
  const photosQuery = useQuery({ queryKey: ["photos"], queryFn: () => apiGet<Photo[]>("/photos") });
  const [form, setForm] = useState(emptyPhoto);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const photoMutation = useMutation({
    mutationFn: (payload: PhotoInput) => apiPost<Photo>("/admin/photos", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setForm(emptyPhoto);
      setPreview(null);
      setUploadProgress(null);
      toast.success("Foto adicionada à galeria.");
    },
    onError: () => toast.error("Preencha o título e envie uma imagem antes de salvar."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiPost<AuthResponse>(`/admin/photos/${id}/delete`, { pin }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["photos"] }); toast.success("Foto removida."); },
    onError: () => toast.error("Não foi possível remover esta foto."),
  });

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!(name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png"))) {
      toast.error("Escolha uma foto JPG ou PNG.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("A foto deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
    const payload = new FormData();
    payload.append("pin", pin);
    payload.append("file", file);
    setUploading(true);
    setUploadProgress(0);
    void apiUpload<MediaUpload>("/admin/media/photo", payload, setUploadProgress)
      .then((uploaded) => {
        update("image_url", uploaded.url);
        setPreview(uploaded.url);
        setUploadProgress(100);
        toast.success("Foto armazenada. Agora salve na galeria.");
      })
      .catch(() => { setPreview(null); setUploadProgress(null); toast.error("Não foi possível armazenar a foto."); })
      .finally(() => setUploading(false));
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.image_url) { toast.error("Envie uma foto e informe um título."); return; }
    photoMutation.mutate({ ...form, alt: form.alt || form.title, pin });
  };

  return <section className="mt-14 border-t border-white/[.08] pt-12" data-testid="admin-photo-manager"><div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.3em] text-[#ff1e27]">Galeria fotográfica</p><h2 className="mt-2 font-heading text-3xl font-semibold uppercase" data-testid="admin-photo-manager-title">Fotos aéreas e stills</h2></div><p className="max-w-sm text-xs leading-relaxed text-zinc-500">JPG ou PNG de até 10 MB para complementar seus filmes com imagens estáticas.</p></div><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><form onSubmit={handleSubmit} className="border border-white/[.08] bg-[#121215] p-6" data-testid="admin-photo-form"><div className="flex items-start gap-4"><div className="size-28 shrink-0 overflow-hidden border border-white/10 bg-[#0b0b0c]" data-testid="admin-photo-preview">{preview ? <img src={preview} alt="Prévia da foto" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-zinc-700"><ImagePlus size={24} /></div>}</div><div className="min-w-0 flex-1"><Label htmlFor="admin-photo-file-input" className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-zinc-200" data-testid="admin-photo-file-label"><Upload size={15} className="text-[#ff1e27]" /> Enviar foto</Label><p className="mt-2 text-[10px] text-zinc-500" data-testid="admin-photo-upload-hint">JPG ou PNG · máximo 10 MB</p><input id="admin-photo-file-input" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} className="sr-only" data-testid="admin-photo-file-input" /></div></div>{uploadProgress !== null && <div className="mt-4 space-y-2" data-testid="admin-photo-upload-progress"><div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress} data-testid="admin-photo-upload-progress-bar"><div className="h-full bg-[#e50914] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} /></div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-zinc-500" data-testid="admin-photo-upload-status">{uploading ? `Enviando ${uploadProgress}%` : "Foto armazenada localmente e pronta para salvar"}</p></div>}<div className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="admin-photo-title" className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">Título</Label><Input id="admin-photo-title" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Ex.: Vista aérea da serra" className="h-11 rounded-sm border-white/10 bg-[#0b0b0c] text-sm text-white placeholder:text-zinc-700" data-testid="admin-photo-title-input" /></div><div className="space-y-2"><Label htmlFor="admin-photo-category" className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">Categoria</Label><select id="admin-photo-category" value={form.category} onChange={(event) => update("category", event.target.value)} className="h-11 w-full rounded-sm border border-white/10 bg-[#0b0b0c] px-3 text-sm text-white outline-none focus:border-[#e50914]" data-testid="admin-photo-category-input">{PHOTO_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div><div className="space-y-2"><Label htmlFor="admin-photo-alt" className="font-mono text-[10px] uppercase tracking-[.17em] text-zinc-500">Descrição acessível (opcional)</Label><Input id="admin-photo-alt" value={form.alt} onChange={(event) => update("alt", event.target.value)} placeholder="Descreva a imagem" className="h-11 rounded-sm border-white/10 bg-[#0b0b0c] text-sm text-white placeholder:text-zinc-700" data-testid="admin-photo-alt-input" /></div><Button type="submit" disabled={uploading || photoMutation.isPending} className="h-11 w-full rounded-sm bg-[#e50914] text-xs font-semibold uppercase tracking-[.16em] hover:bg-[#ff1e27]" data-testid="admin-save-photo-button">{photoMutation.isPending ? "Salvando..." : "Adicionar à galeria"}</Button></div></form><div className="grid gap-3 sm:grid-cols-2" data-testid="admin-photo-list">{(photosQuery.data ?? []).map((photo) => <article key={photo.id} className="group relative overflow-hidden border border-white/[.08] bg-[#121215]" data-testid={`admin-photo-row-${photo.id}`}><div className="aspect-[4/3] overflow-hidden"><img src={photo.image_url} alt={photo.alt} className="size-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><Badge variant="outline" className="rounded-sm border-[#e50914]/50 text-[9px] uppercase tracking-[.16em] text-[#ff1e27]">{photo.category}</Badge><h3 className="mt-2 truncate font-heading text-base font-semibold">{photo.title}</h3></div><button type="button" onClick={() => deleteMutation.mutate(photo.id)} className="focus-ring shrink-0 text-zinc-600 transition hover:text-[#ff1e27]" data-testid={`admin-delete-photo-${photo.id}`} aria-label={`Remover ${photo.title}`}><Trash2 size={15} /></button></div></article>)}</div></div></section>;
}
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, Loader2, Image as ImageIcon, Video as VideoIcon, Play } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, GalleryPhoto } from "@shared/schema";

const CUSTOM_VOLUME = "__custom__";
const ALL_VOLUMES = "__all__";

function sortVolumes(volumes: string[]): string[] {
  return [...volumes].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, ""), 10);
    const nb = parseInt(b.replace(/\D/g, ""), 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
}

export default function AdminGalleryPage() {
  const { toast } = useToast();
  const [volume, setVolume] = useState("");
  const [useCustomVolume, setUseCustomVolume] = useState(false);
  const [showAllVolumes, setShowAllVolumes] = useState(false);
  const [alt, setAlt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const { data: allPhotos = [], isLoading } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/admin/gallery"],
    select: (data) => data.photos ?? [],
  });
  const photos = useMemo(() => allPhotos.filter((p) => (p.section ?? "aftr") === "aftr"), [allPhotos]);

  // The volume list is driven by real data — every event's Volume Tag field,
  // plus any volume already used on an existing photo — so a new event (e.g.
  // "AFTR VOL. 4") becomes selectable here automatically, no code change needed.
  const { data: eventsData } = useQuery<{ success: boolean; events: Event[] }>({
    queryKey: ["/api/events"],
  });

  const volumeOptions = useMemo(() => {
    const set = new Set<string>();
    (eventsData?.events ?? []).forEach((e) => { if (e.volume?.trim()) set.add(e.volume.trim()); });
    photos.forEach((p) => { if (p.volume?.trim()) set.add(p.volume.trim()); });
    return sortVolumes(Array.from(set));
  }, [eventsData, photos]);

  useEffect(() => {
    if (!volume && !useCustomVolume && !showAllVolumes && volumeOptions.length > 0) {
      setVolume(volumeOptions[volumeOptions.length - 1]);
    }
  }, [volumeOptions, volume, useCustomVolume, showAllVolumes]);

  // The same Volume selector doubles as the list filter below — picking a
  // volume shows only its photos, "All Volumes" shows everything.
  const filteredPhotos = useMemo(() => {
    if (showAllVolumes || useCustomVolume || !volume) return photos;
    return photos.filter((p) => p.volume === volume);
  }, [photos, volume, useCustomVolume, showAllVolumes]);

  const createMutation = useMutation({
    mutationFn: (data: { url: string; alt: string; volume: string; order: number; type: "image" | "video"; section: "aftr" }) =>
      apiRequest("POST", "/api/admin/gallery", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: mediaType === "video" ? "Video added to gallery" : "Photo added to gallery" });
      setAlt("");
    },
    onError: () => toast({ title: "Failed to add item", variant: "destructive" }),
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      apiRequest("PATCH", `/api/admin/gallery/${id}`, { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Photo removed" });
    },
    onError: () => toast({ title: "Failed to remove photo", variant: "destructive" }),
  });

  return (
    <AdminLayout title="Gallery">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1">
          Upload and manage event photos & videos
        </p>
        <p className="text-white/20 text-xs">
          Photos are automatically resized on upload; videos must be MP4. Both appear on the public Gallery page immediately.
        </p>
      </div>

      {/* Upload form */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 border border-white/10 flex items-center justify-center">
            {mediaType === "video" ? <VideoIcon className="w-3.5 h-3.5 text-[#c72d28]" /> : <ImageIcon className="w-3.5 h-3.5 text-[#c72d28]" />}
          </div>
          <h2 className="text-white text-sm font-semibold">Upload {mediaType === "video" ? "Video" : "Photo"}</h2>
          <div className="flex border border-white/15 ml-auto">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMediaType(t)}
                className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors ${
                  mediaType === t ? "bg-[#c72d28] text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {t === "video" ? "Video" : "Photo"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Volume</label>
            <select
              value={showAllVolumes ? ALL_VOLUMES : useCustomVolume ? CUSTOM_VOLUME : volume}
              onChange={(e) => {
                const v = e.target.value;
                if (v === CUSTOM_VOLUME) {
                  setShowAllVolumes(false);
                  setUseCustomVolume(true);
                  setVolume("");
                } else if (v === ALL_VOLUMES) {
                  setShowAllVolumes(true);
                  setUseCustomVolume(false);
                } else {
                  setShowAllVolumes(false);
                  setUseCustomVolume(false);
                  setVolume(v);
                }
              }}
              className="w-full bg-black border border-white/15 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white/40"
            >
              {volumeOptions.length > 0 && <option value={ALL_VOLUMES}>All Volumes</option>}
              {volumeOptions.length === 0 && <option value="">No volumes yet</option>}
              {volumeOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
              <option value={CUSTOM_VOLUME}>+ New volume…</option>
            </select>
            {useCustomVolume && (
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g. VOL. 4"
                autoFocus
                className="mt-2 w-full bg-black border border-white/15 text-white placeholder:text-white/20 text-sm px-3 py-2.5 focus:outline-none focus:border-white/40"
              />
            )}
            <p className="text-white/20 text-[10px] mt-1.5">
              Also filters the list below to just that volume's photos. Options are pulled from each event's Volume Tag.
            </p>
          </div>
          <div>
            <label className="block text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Alt Text (optional)</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="AFTR Vol. 3 — The Crowd"
              className="w-full bg-black border border-white/15 text-white placeholder:text-white/20 text-sm px-3 py-2.5 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        <ObjectUploader
          maxFileSize={mediaType === "video" ? 500 * 1024 * 1024 : 20 * 1024 * 1024}
          allowedFileTypes={mediaType === "video" ? ["video/mp4"] : ["image/*"]}
          onComplete={(url) => {
            const v = volume.trim();
            if (!v) {
              toast({ title: "Choose or enter a volume first", variant: "destructive" });
              return;
            }
            createMutation.mutate({ url, alt: alt || `AFTR ${v}`, volume: v, order: photos.length, type: mediaType, section: "aftr" });
          }}
          buttonClassName="gap-2"
        >
          {mediaType === "video" ? <VideoIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          Upload {mediaType === "video" ? "Video" : "Photo"}
        </ObjectUploader>
      </div>

      {/* Photo list — filtered to the selected volume above, unless "All Volumes" is picked */}
      <p className="text-white/20 text-xs mb-3">
        {showAllVolumes || !volume
          ? `${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? "s" : ""} · all volumes`
          : `${filteredPhotos.length} photo${filteredPhotos.length !== 1 ? "s" : ""} in ${volume}`}
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/20 text-sm">No photos yet. Upload your first one above.</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/20 text-sm">No photos in {volume} yet.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-colors">
              {photo.type === "video" ? (
                <div className="relative w-16 h-16 shrink-0 bg-black">
                  <video src={photo.url} className="w-16 h-16 object-cover" preload="metadata" muted />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img src={photo.url} alt={photo.alt} className="w-16 h-16 object-cover shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{photo.alt || "(no alt text)"}</p>
                <div className="flex items-center gap-3 text-white/30 text-xs mt-1">
                  <span className="text-[#c72d28]">{photo.volume}</span>
                  {photo.type === "video" && <span className="text-white/40 uppercase tracking-wider text-[9px]">Video</span>}
                  <span>Order:</span>
                  <input
                    type="number"
                    defaultValue={photo.order}
                    onBlur={(e) => {
                      const order = parseInt(e.target.value, 10);
                      if (!isNaN(order) && order !== photo.order) {
                        updateOrderMutation.mutate({ id: photo.id, order });
                      }
                    }}
                    className="w-16 bg-black border border-white/15 text-white text-xs px-2 py-1 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(photo.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

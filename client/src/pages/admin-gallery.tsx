import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GalleryPhoto } from "@shared/schema";

const VOLUMES = ["VOL. 1", "VOL. 2", "VOL. 3"];

export default function AdminGalleryPage() {
  const { toast } = useToast();
  const [volume, setVolume] = useState(VOLUMES[VOLUMES.length - 1]);
  const [alt, setAlt] = useState("");

  const { data: photos = [], isLoading } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/admin/gallery"],
    select: (data) => data.photos ?? [],
  });

  const createMutation = useMutation({
    mutationFn: (data: { url: string; alt: string; volume: string; order: number }) =>
      apiRequest("POST", "/api/admin/gallery", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Photo added to gallery" });
      setAlt("");
    },
    onError: () => toast({ title: "Failed to add photo", variant: "destructive" }),
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
          Upload and manage event photos
        </p>
        <p className="text-white/20 text-xs">
          Photos are automatically resized on upload and appear on the public Gallery page immediately.
        </p>
      </div>

      {/* Upload form */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 border border-white/10 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-[#c72d28]" />
          </div>
          <h2 className="text-white text-sm font-semibold">Upload Photo</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Volume</label>
            <select
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full bg-black border border-white/15 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-white/40"
            >
              {VOLUMES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
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
          maxFileSize={20 * 1024 * 1024}
          allowedFileTypes={["image/*"]}
          onComplete={(url) =>
            createMutation.mutate({ url, alt: alt || `AFTR ${volume}`, volume, order: photos.length })
          }
          buttonClassName="gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Upload Photo
        </ObjectUploader>
      </div>

      {/* Photo list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/20 text-sm">No photos yet. Upload your first one above.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-colors">
              <img src={photo.url} alt={photo.alt} className="w-16 h-16 object-cover shrink-0" loading="lazy" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{photo.alt || "(no alt text)"}</p>
                <div className="flex items-center gap-3 text-white/30 text-xs mt-1">
                  <span className="text-[#c72d28]">{photo.volume}</span>
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

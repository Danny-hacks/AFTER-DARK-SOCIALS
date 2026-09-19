import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, Loader2, Image as ImageIcon, Video as VideoIcon, Play } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GalleryPhoto } from "@shared/schema";

export default function AdminAccessGalleryPage() {
  const { toast } = useToast();
  const [alt, setAlt] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const { data: allPhotos = [], isLoading } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/admin/gallery"],
    select: (data) => data.photos ?? [],
  });
  const photos = useMemo(() => allPhotos.filter((p) => p.section === "access"), [allPhotos]);

  const createMutation = useMutation({
    mutationFn: (data: { url: string; alt: string; order: number; type: "image" | "video"; section: "access" }) =>
      apiRequest("POST", "/api/admin/gallery", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: mediaType === "video" ? "Video added to ACCESS gallery" : "Photo added to ACCESS gallery" });
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
      toast({ title: "Item removed" });
    },
    onError: () => toast({ title: "Failed to remove item", variant: "destructive" }),
  });

  return (
    <AdminLayout title="ACCESS Gallery">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1">
          Upload and manage ACCESS photos & videos
        </p>
        <p className="text-white/20 text-xs">
          Shown in the "Past Editions" section of the public ACCESS page. Photos are automatically resized; videos must be MP4.
        </p>
      </div>

      {/* Upload form */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-7 h-7 border border-white/10 flex items-center justify-center">
            {mediaType === "video" ? <VideoIcon className="w-3.5 h-3.5 text-[#c9962a]" /> : <ImageIcon className="w-3.5 h-3.5 text-[#c9962a]" />}
          </div>
          <h2 className="text-white text-sm font-semibold">Upload {mediaType === "video" ? "Video" : "Photo"}</h2>
          <div className="flex border border-white/15 ml-auto">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMediaType(t)}
                className={`px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors ${
                  mediaType === t ? "bg-[#c9962a] text-black" : "text-white/40 hover:text-white"
                }`}
              >
                {t === "video" ? "Video" : "Photo"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2">Alt Text (optional)</label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="ACCESS — The Crowd"
            className="w-full bg-black border border-white/15 text-white placeholder:text-white/20 text-sm px-3 py-2.5 focus:outline-none focus:border-white/40"
          />
        </div>

        <ObjectUploader
          maxFileSize={mediaType === "video" ? 500 * 1024 * 1024 : 20 * 1024 * 1024}
          allowedFileTypes={mediaType === "video" ? ["video/mp4"] : ["image/*"]}
          onComplete={(url) => {
            createMutation.mutate({ url, alt: alt || "ACCESS", order: photos.length, type: mediaType, section: "access" });
          }}
          buttonClassName="gap-2"
        >
          {mediaType === "video" ? <VideoIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          Upload {mediaType === "video" ? "Video" : "Photo"}
        </ObjectUploader>
      </div>

      {/* List */}
      <p className="text-white/20 text-xs mb-3">
        {photos.length} item{photos.length !== 1 ? "s" : ""} in the ACCESS gallery
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/20 text-sm">No photos or videos yet. Upload your first one above.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {photos.map((photo) => (
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

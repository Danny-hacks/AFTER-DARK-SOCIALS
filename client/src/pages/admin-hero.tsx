import { useQuery, useMutation } from "@tanstack/react-query";
import { Image as ImageIcon, Play, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HeroSlide } from "@shared/schema";

export default function AdminHeroPage() {
  const { toast } = useToast();

  const { data: slides = [], isLoading } = useQuery<{ success: boolean; slides: HeroSlide[] }, Error, HeroSlide[]>({
    queryKey: ["/api/admin/hero-slides"],
    select: (data) => data.slides ?? [],
  });

  const createMutation = useMutation({
    mutationFn: (data: { type: string; url: string; order: string }) => apiRequest("POST", "/api/admin/hero-slides", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] });
      toast({ title: "Slide added" });
    },
    onError: () => toast({ title: "Failed to add slide", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeroSlide> }) => apiRequest("PATCH", `/api/admin/hero-slides/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] });
    },
    onError: () => toast({ title: "Failed to update slide", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/hero-slides/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] });
      toast({ title: "Slide deleted" });
    },
    onError: () => toast({ title: "Failed to delete slide", variant: "destructive" }),
  });

  const sorted = [...slides].sort((a, b) => parseInt(a.order || "0") - parseInt(b.order || "0"));

  return (
    <AdminLayout title="Hero Slider">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1">
          Manage the homepage hero background
        </p>
        <p className="text-white/20 text-xs">
          Photos are automatically resized on upload. Videos must be MP4.
        </p>
      </div>

      {/* Upload */}
      <div className="bg-[#0a0a0a] border border-white/10 p-6 mb-8">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5">Add New Slide</p>
        <div className="flex flex-wrap gap-3">
          <ObjectUploader
            maxFileSize={20 * 1024 * 1024}
            allowedFileTypes={["image/*"]}
            onComplete={(url) => createMutation.mutate({ type: "image", url, order: String(sorted.length) })}
            buttonClassName="gap-2"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Upload Image
          </ObjectUploader>
          <ObjectUploader
            maxFileSize={500 * 1024 * 1024}
            allowedFileTypes={["video/mp4"]}
            onComplete={(url) => createMutation.mutate({ type: "video", url, order: String(sorted.length) })}
            buttonClassName="gap-2"
          >
            <Play className="w-3.5 h-3.5" /> Upload Video
          </ObjectUploader>
        </div>
      </div>

      {/* Slides */}
      <div className="border border-white/10">
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Current Slides</p>
        </div>
        {isLoading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-white/20 text-xs uppercase tracking-widest text-center">
            No slides yet. Upload your first image or video.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1">
            {sorted.map((slide, index) => (
              <div key={slide.id} className="relative overflow-hidden bg-black group aspect-video" data-testid={`hero-slide-${slide.id}`}>
                {slide.type === "video" ? (
                  <video
                    src={slide.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                ) : (
                  <img src={slide.url} alt={slide.title || "Hero slide"} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => updateMutation.mutate({ id: slide.id, data: { isActive: !slide.isActive } })}
                    className="flex items-center gap-1.5 border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-2 transition-colors"
                    data-testid={`toggle-slide-${slide.id}`}
                  >
                    {slide.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {slide.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this slide?")) deleteMutation.mutate(slide.id); }}
                    className="flex items-center gap-1.5 border border-red-500/40 hover:border-red-500 text-red-400 text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-2 transition-colors"
                    data-testid={`delete-slide-${slide.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="text-[8px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 bg-black/70 text-white/60 border border-white/10">
                    {slide.type}
                  </span>
                  {!slide.isActive && (
                    <span className="text-[8px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 bg-black/70 text-white/30 border border-white/10">
                      hidden
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="border border-white/20 text-white/40 text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 bg-black/50">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

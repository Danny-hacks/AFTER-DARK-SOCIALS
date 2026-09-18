import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Image as ImageIcon, Video as VideoIcon, X } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";

const schema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  volume: z.string().optional(),
  artistsInput: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isPast: z.boolean().default(false),
});
type FormData = z.infer<typeof schema>;

export default function AdminEventsNewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isPast: false },
  });

  const imageUrl = watch("imageUrl");
  const videoUrl = watch("videoUrl");

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const artists = (data.artistsInput ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const { artistsInput, ...rest } = data;
      return apiRequest("POST", "/api/admin/events", {
        ...rest,
        artists: artists.length > 0 ? JSON.stringify(artists) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/past"] });
      toast({ title: "Event created" });
      navigate("/admin/events");
    },
    onError: () => toast({ title: "Failed to create event", variant: "destructive" }),
  });

  const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";
  const labelCls = "block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2";

  return (
    <AdminLayout title="New Event">
      <div className="max-w-2xl">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Events
        </Link>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div>
            <label className={labelCls}>Event Name *</label>
            <input {...register("name")} placeholder="e.g. AFTR Vol. 4" className={inputCls} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Subtitle</label>
            <input {...register("subtitle")} placeholder="e.g. Full Capacity." className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Date *</label>
              <input {...register("date")} type="text" placeholder="e.g. 27 Jul 2026" className={inputCls} />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input {...register("time")} placeholder="e.g. 10PM — 4AM" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Venue</label>
            <input {...register("venue")} placeholder="e.g. Shotz, Flic en Flac" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea {...register("description")} rows={4} placeholder="Event description..." className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Volume Tag</label>
            <input {...register("volume")} placeholder="e.g. VOL. 4" className={inputCls} />
            <p className="text-white/20 text-[10px] mt-1.5">
              Links this event's gallery photos — must match a Volume used in Gallery uploads.
            </p>
          </div>

          <div>
            <label className={labelCls}>Lineup (comma-separated)</label>
            <input {...register("artistsInput")} placeholder="DJ Sweety, DJ Luvlesh" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Cover Image</label>
            <div className="flex items-center gap-4">
              {imageUrl && <img src={imageUrl} alt="" className="w-16 h-16 object-cover border border-white/10" />}
              <ObjectUploader
                maxFileSize={20 * 1024 * 1024}
                allowedFileTypes={["image/*"]}
                onComplete={(url) => setValue("imageUrl", url)}
                buttonClassName="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                {imageUrl ? "Replace Image" : "Upload Image"}
              </ObjectUploader>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setValue("imageUrl", "")}
                  className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>Event Video</label>
            <div className="flex items-center gap-4">
              {videoUrl && <span className="text-white/30 text-xs">Video attached</span>}
              <ObjectUploader
                maxFileSize={500 * 1024 * 1024}
                allowedFileTypes={["video/mp4"]}
                onComplete={(url) => setValue("videoUrl", url)}
                buttonClassName="gap-2"
              >
                <VideoIcon className="w-4 h-4" />
                {videoUrl ? "Replace Video" : "Upload Video"}
              </ObjectUploader>
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setValue("videoUrl", "")}
                  className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-white/20 text-[10px] mt-1.5">MP4 only — other formats often won't play in browsers.</p>
          </div>

          <div className="flex items-center gap-3">
            <input {...register("isPast")} type="checkbox" id="isPast" className="accent-[#c72d28] w-4 h-4" />
            <label htmlFor="isPast" className="text-white/40 text-xs uppercase tracking-[0.15em] cursor-pointer">
              Mark as past event
            </label>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#a82421] disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {mutation.isPending ? "Creating..." : "Create Event"}
            </button>
            <Link href="/admin/events" className="text-white/30 text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

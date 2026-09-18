import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Image as ImageIcon, X } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AccessEvent } from "@shared/schema";

const emptyForm = { name: "ACCESS", date: "", time: "", venue: "", description: "", posterUrl: "", bannerUrl: "" };

export default function AdminAccessEventsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);

  const { data: events = [], isLoading } = useQuery<{ success: boolean; events: AccessEvent[] }, Error, AccessEvent[]>({
    queryKey: ["/api/admin/access/events"],
    select: (data) => data.events ?? [],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/admin/access/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access/current"] });
      setForm(emptyForm);
      toast({ title: "ACCESS event created" });
    },
    onError: () => toast({ title: "Failed to create event", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/access/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access/current"] });
      toast({ title: "ACCESS event deleted" });
    },
    onError: () => toast({ title: "Failed to delete event", variant: "destructive" }),
  });

  const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";
  const labelCls = "block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2";

  return (
    <AdminLayout title="ACCESS Events">
      <div className="mb-8 max-w-2xl">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-1">Manage ACCESS editions</p>
        <p className="text-white/20 text-xs">
          The public ACCESS page always shows whichever edition below has the nearest upcoming date.
          Add a new one for each night — poster/banner upload automatically resizes.
        </p>
      </div>

      {/* Existing events */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="border border-white/10 p-10 text-center mb-10">
          <p className="text-white/20 text-sm">No ACCESS events yet — add one below.</p>
        </div>
      ) : (
        <div className="space-y-px mb-10">
          {events.map((ev) => (
            <div key={ev.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center gap-4">
              {ev.posterUrl ? (
                <img src={ev.posterUrl} alt="" className="w-12 h-16 object-cover border border-white/10 shrink-0" />
              ) : (
                <div className="w-12 h-16 border border-white/10 bg-black flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4 text-white/15" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{ev.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{[ev.date, ev.venue].filter(Boolean).join(" · ")}</p>
              </div>
              <button
                onClick={() => { if (confirm(`Delete "${ev.name}"?`)) deleteMutation.mutate(ev.id); }}
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

      {/* Create form */}
      <div className="max-w-2xl border border-white/10 p-6 space-y-6">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Add ACCESS Edition</p>

        <div>
          <label className={labelCls}>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelCls}>Date *</label>
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="e.g. Friday 3 July 2026" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Doors Open 8PM" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Venue</label>
          <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Club Sixty Nine" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className={labelCls}>Poster Image</label>
          <div className="flex items-center gap-4">
            {form.posterUrl && (
              <div className="relative">
                <img src={form.posterUrl} alt="" className="w-16 h-20 object-cover border border-white/10" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, posterUrl: "" })}
                  className="absolute -top-2 -right-2 bg-black border border-white/20 rounded-full p-1 text-white/60 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <ObjectUploader
              maxFileSize={20 * 1024 * 1024}
              allowedFileTypes={["image/*"]}
              onComplete={(url) => setForm((f) => ({ ...f, posterUrl: url }))}
              buttonClassName="gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              {form.posterUrl ? "Replace Poster" : "Upload Poster"}
            </ObjectUploader>
          </div>
        </div>

        <div>
          <label className={labelCls}>Banner Image</label>
          <div className="flex items-center gap-4">
            {form.bannerUrl && (
              <div className="relative">
                <img src={form.bannerUrl} alt="" className="w-24 h-14 object-cover border border-white/10" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, bannerUrl: "" })}
                  className="absolute -top-2 -right-2 bg-black border border-white/20 rounded-full p-1 text-white/60 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <ObjectUploader
              maxFileSize={20 * 1024 * 1024}
              allowedFileTypes={["image/*"]}
              onComplete={(url) => setForm((f) => ({ ...f, bannerUrl: url }))}
              buttonClassName="gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              {form.bannerUrl ? "Replace Banner" : "Upload Banner"}
            </ObjectUploader>
          </div>
        </div>

        <button
          onClick={() => {
            if (!form.date.trim()) {
              toast({ title: "Date is required", variant: "destructive" });
              return;
            }
            createMutation.mutate(form);
          }}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 bg-[#c9962a] text-black text-[10px] uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#b8860b] disabled:opacity-50 transition-colors"
        >
          {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Create Event
        </button>
      </div>
    </AdminLayout>
  );
}

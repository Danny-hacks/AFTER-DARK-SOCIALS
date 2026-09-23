import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Calendar, MapPin, Trash, Edit, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import type { Event } from "@shared/schema";

export default function AdminEventsPage() {
  const { toast } = useToast();
  const { data: events = [], isLoading } = useQuery<{ success: boolean; events: Event[] }, Error, Event[]>({
    queryKey: ["/api/events"],
    select: (data) => data.events ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/past"] });
      toast({ title: "Event deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const upcoming = events.filter((e) => !e.isPast);
  const past     = events.filter((e) =>  e.isPast);

  return (
    <AdminLayout title="Events">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
            {events.length} total event{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-5 py-3 hover:bg-[#a82421] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Event
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-10">
              <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.3em] mb-4">Upcoming</p>
              <div className="space-y-px">
                {upcoming.map((ev) => <EventRow key={ev.id} event={ev} onDelete={(id) => deleteMutation.mutate(id)} deleting={deleteMutation.isPending} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="text-white/25 text-[9px] uppercase tracking-[0.3em] mb-4">Past</p>
              <div className="space-y-px">
                {past.map((ev) => <EventRow key={ev.id} event={ev} onDelete={(id) => deleteMutation.mutate(id)} deleting={deleteMutation.isPending} />)}
              </div>
            </section>
          )}
          {events.length === 0 && (
            <div className="border border-white/10 p-12 text-center">
              <p className="text-white/20 text-sm mb-4">No events yet.</p>
              <Link href="/admin/events/new" className="text-[#c72d28] text-xs uppercase tracking-[0.2em] hover:underline">
                Create your first event
              </Link>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

function EventRow({ event, onDelete, deleting }: { event: Event; onDelete: (id: string) => void; deleting: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[#0a0a0a] border border-white/10 px-5 py-4 hover:border-white/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{event.name}</p>
        <div className="flex items-center gap-4 mt-1">
          {event.date  && <span className="flex items-center gap-1.5 text-white/30 text-xs"><Calendar className="w-3 h-3" />{event.date}</span>}
          {event.venue && <span className="flex items-center gap-1.5 text-white/30 text-xs"><MapPin className="w-3 h-3" />{event.venue}</span>}
          <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${event.isPast ? "border-white/10 text-white/20" : "border-[#c72d28]/30 text-[#c72d28]"}`}>
            {event.isPast ? "Past" : "Upcoming"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/admin/events/${event.id}`}
          className="flex items-center gap-1.5 border border-white/15 text-white/50 hover:border-white/40 hover:text-white text-[10px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
        >
          <Edit className="w-3 h-3" />
          Manage
        </Link>
        <button
          onClick={() => { if (confirm(`Delete "${event.name}"?`)) onDelete(event.id); }}
          disabled={deleting}
          className="border border-red-500/20 text-red-400/50 hover:border-red-500/50 hover:text-red-400 text-[10px] p-2 transition-colors disabled:opacity-30"
        >
          <Trash className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

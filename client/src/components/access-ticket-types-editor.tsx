import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Copy, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ACCESS_AREAS, ACCESS_AREA_LABELS, ACCESS_SOLO_AREA, type AccessArea } from "@shared/schema";
import type { AccessTicketTypeWithAvailability } from "@shared/accessTickets";

const inputCls =
  "w-full bg-black border border-white/15 px-2.5 py-2 text-white text-xs focus:outline-none focus:border-[#c9962a]";
const smallLabel = "block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1";

type Draft = {
  label: string;
  minGuests: string;
  maxGuests: string;
  pricingMode: "flat" | "per_person";
  price: string;
  capacity: string;
  manualUsed: string;
  description: string;
  availableUntil: string; // datetime-local value, "" = no deadline
};

type OptionArea = AccessArea | typeof ACCESS_SOLO_AREA;

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time
function toLocalInput(value: string | Date | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptySoloDraft = (): Draft => ({
  label: "",
  minGuests: "1",
  maxGuests: "1",
  pricingMode: "flat",
  price: "",
  capacity: "100",
  manualUsed: "",
  description: "",
  availableUntil: "",
});

const emptyDraft: Draft = {
  label: "",
  minGuests: "4",
  maxGuests: "4",
  pricingMode: "flat",
  price: "",
  capacity: "1",
  manualUsed: "",
  description: "",
  availableUntil: "",
};

function typeToDraft(t: AccessTicketTypeWithAvailability): Draft {
  return {
    label: t.label,
    minGuests: String(t.minGuests),
    maxGuests: String(t.maxGuests),
    pricingMode: t.pricingMode === "per_person" ? "per_person" : "flat",
    price: String(t.price),
    capacity: String(t.capacity),
    manualUsed: t.manualUsed === null ? "" : String(t.manualUsed),
    description: t.description ?? "",
    availableUntil: toLocalInput(t.availableUntil),
  };
}

function draftToPayload(d: Draft, area: OptionArea) {
  const solo = area === ACCESS_SOLO_AREA;
  return {
    area,
    label: d.label,
    minGuests: solo ? "1" : d.minGuests,
    maxGuests: solo ? "1" : d.maxGuests,
    pricingMode: solo ? "flat" : d.pricingMode,
    price: d.price,
    capacity: d.capacity,
    manualUsed: d.manualUsed.trim() === "" ? null : d.manualUsed,
    description: d.description,
    availableUntil: d.availableUntil ? new Date(d.availableUntil).toISOString() : null,
  };
}

function invalidateTicketTypes() {
  queryClient.invalidateQueries({ queryKey: ["/api/admin/access/ticket-types"] });
  queryClient.invalidateQueries({ queryKey: ["/api/access/ticket-types"] });
}

function DraftFields({ draft, setDraft, solo }: { draft: Draft; setDraft: (d: Draft) => void; solo?: boolean }) {
  const perPerson = draft.pricingMode === "per_person";
  if (solo) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <div className="col-span-2 sm:col-span-3">
          <label className={smallLabel}>Name</label>
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Early Bird — Bring Your Own Mask" className={inputCls} />
        </div>
        <div>
          <label className={smallLabel}>Rs / person</label>
          <input type="number" min={0} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={smallLabel}>Tickets available</label>
          <input type="number" min={0} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={smallLabel}>Used override</label>
          <input type="number" min={0} value={draft.manualUsed} onChange={(e) => setDraft({ ...draft, manualUsed: e.target.value })} placeholder="auto" className={inputCls} />
        </div>
        <div className="col-span-2 sm:col-span-4">
          <label className={smallLabel}>Description</label>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} placeholder="Shown under the option on the booking page" className={`${inputCls} resize-none`} />
        </div>
        <div className="col-span-2">
          <label className={smallLabel}>Available until (optional)</label>
          <input type="datetime-local" value={draft.availableUntil} onChange={(e) => setDraft({ ...draft, availableUntil: e.target.value })} className={inputCls} />
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
      <div className="col-span-2">
        <label className={smallLabel}>Name</label>
        <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Table for 4" className={inputCls} />
      </div>
      <div>
        <label className={smallLabel}>Min guests</label>
        <input type="number" min={1} value={draft.minGuests} onChange={(e) => setDraft({ ...draft, minGuests: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={smallLabel}>Max guests</label>
        <input type="number" min={1} value={draft.maxGuests} onChange={(e) => setDraft({ ...draft, maxGuests: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={smallLabel}>Pricing</label>
        <select
          value={draft.pricingMode}
          onChange={(e) => setDraft({ ...draft, pricingMode: e.target.value as Draft["pricingMode"] })}
          className={inputCls}
        >
          <option value="flat">Per table</option>
          <option value="per_person">Per person</option>
        </select>
      </div>
      <div>
        <label className={smallLabel}>{perPerson ? "Rs / person" : "Rs / table"}</label>
        <input type="number" min={0} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={smallLabel}>Tables available</label>
        <input type="number" min={0} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={smallLabel}>Used override</label>
        <input type="number" min={0} value={draft.manualUsed} onChange={(e) => setDraft({ ...draft, manualUsed: e.target.value })} placeholder="auto" className={inputCls} />
      </div>
      <div className="col-span-2 sm:col-span-4">
        <label className={smallLabel}>Description (optional)</label>
        <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Shown on the table card" className={inputCls} />
      </div>
      <div className="col-span-2">
        <label className={smallLabel}>Available until (optional)</label>
        <input type="datetime-local" value={draft.availableUntil} onChange={(e) => setDraft({ ...draft, availableUntil: e.target.value })} className={inputCls} />
      </div>
    </div>
  );
}

function TicketTypeRow({ type }: { type: AccessTicketTypeWithAvailability }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft>(() => typeToDraft(type));
  useEffect(() => setDraft(typeToDraft(type)), [type]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(typeToDraft(type));

  const save = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/admin/access/ticket-types/${type.id}`, draftToPayload(draft, type.area as OptionArea)),
    onSuccess: () => { invalidateTicketTypes(); toast({ title: "Table option saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/access/ticket-types/${type.id}`),
    onSuccess: () => { invalidateTicketTypes(); toast({ title: "Table option removed" }); },
    onError: () => toast({ title: "Failed to remove", variant: "destructive" }),
  });

  return (
    <div className="border border-white/10 p-3 space-y-2">
      <DraftFields draft={draft} setDraft={setDraft} solo={type.area === ACCESS_SOLO_AREA} />
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[10px] text-white/30 flex-1">
          {type.used}/{type.capacity} booked · {type.pending} pending · {type.available} left
          {type.availableUntil && new Date(type.availableUntil).getTime() < Date.now() && <span className="text-[#c72d28]"> · ended</span>}
          {type.manualUsed !== null && <span className="text-[#c9962a]"> · override on</span>}
        </p>
        {dirty && (
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="flex items-center gap-1.5 bg-[#c9962a] text-black text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-1.5 disabled:opacity-50"
          >
            {save.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save
          </button>
        )}
        <button
          onClick={() => {
            const booked = type.confirmed + type.pending;
            const msg = booked > 0
              ? `"${type.label}" has ${booked} booking(s). Remove it anyway? Existing bookings are kept.`
              : `Remove "${type.label}"?`;
            if (confirm(msg)) remove.mutate();
          }}
          disabled={remove.isPending}
          className="flex items-center gap-1 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-2.5 py-1.5"
        >
          <Trash2 className="w-3 h-3" />
          Remove
        </button>
      </div>
    </div>
  );
}

function AddTicketType({ eventId, area, nextOrder }: { eventId: string; area: OptionArea; nextOrder: number }) {
  const { toast } = useToast();
  const solo = area === ACCESS_SOLO_AREA;
  const fresh = () => (solo ? emptySoloDraft() : emptyDraft);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(fresh);
  const create = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/admin/access/events/${eventId}/ticket-types`, { ...draftToPayload(draft, area), order: nextOrder }),
    onSuccess: () => {
      invalidateTicketTypes();
      setDraft(fresh());
      setOpen(false);
      toast({ title: "Table option added" });
    },
    onError: () => toast({ title: "Failed to add", variant: "destructive" }),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em]"
      >
        <Plus className="w-3 h-3" />
        Add option
      </button>
    );
  }
  return (
    <div className="border border-dashed border-[#c9962a]/40 p-3 space-y-2">
      <DraftFields draft={draft} setDraft={setDraft} solo={solo} />
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!draft.price.trim()) {
              toast({ title: "Enter a price", variant: "destructive" });
              return;
            }
            create.mutate();
          }}
          disabled={create.isPending}
          className="flex items-center gap-1.5 bg-[#c9962a] text-black text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-1.5 disabled:opacity-50"
        >
          {create.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          Add
        </button>
        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Table options (ticket types) for one ACCESS edition, grouped by area. */
export function AccessTicketTypesEditor({ eventId }: { eventId: string }) {
  const { toast } = useToast();
  const { data: allTypes = [], isLoading } = useQuery<
    { success: boolean; ticketTypes: AccessTicketTypeWithAvailability[] },
    Error,
    AccessTicketTypeWithAvailability[]
  >({
    queryKey: ["/api/admin/access/ticket-types"],
    select: (d) => d.ticketTypes ?? [],
  });
  const types = allTypes.filter((t) => t.eventId === eventId);
  const nextOrder = types.reduce((m, t) => Math.max(m, t.order), -1) + 1;

  const copyLast = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/access/events/${eventId}/ticket-types/copy-last`);
      return res.json() as Promise<{ copied: number; from: string }>;
    },
    onSuccess: (d) => { invalidateTicketTypes(); toast({ title: `Copied ${d.copied} option(s) from ${d.from}` }); },
    onError: () => toast({ title: "Nothing to copy", description: "No other edition has table options yet.", variant: "destructive" }),
  });
  const standardSet = useMutation({
    mutationFn: () => apiRequest("POST", `/api/admin/access/events/${eventId}/ticket-types/standard-set`),
    onSuccess: () => { invalidateTicketTypes(); toast({ title: "Standard set added — check the prices" }); },
    onError: () => toast({ title: "Failed to add standard set", variant: "destructive" }),
  });

  if (isLoading) {
    return <Loader2 className="w-4 h-4 text-white/30 animate-spin" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] flex-1">
          Table options · {types.length}
        </p>
        <button
          onClick={() => {
            if (types.length > 0 && !confirm("This edition already has table options. Copy the last edition's on top?")) return;
            copyLast.mutate();
          }}
          disabled={copyLast.isPending}
          className="flex items-center gap-1.5 border border-white/15 text-white/50 hover:border-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-3 py-2 disabled:opacity-50"
        >
          {copyLast.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
          Copy from last edition
        </button>
        <button
          onClick={() => {
            if (types.length > 0 && !confirm("Add the standard set (4, 5 and 8–12 in each area) on top of what's here?")) return;
            standardSet.mutate();
          }}
          disabled={standardSet.isPending}
          className="flex items-center gap-1.5 border border-white/15 text-white/50 hover:border-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-3 py-2 disabled:opacity-50"
        >
          {standardSet.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Add standard set
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-white text-xs font-medium uppercase tracking-[0.15em]">Solo Entry options</p>
        <p className="text-white/20 text-[10px]">
          One person each. Leave empty to use the edition's early-bird / regular price instead.
        </p>
        {types.filter((t) => t.area === ACCESS_SOLO_AREA).map((t) => <TicketTypeRow key={t.id} type={t} />)}
        <AddTicketType eventId={eventId} area={ACCESS_SOLO_AREA} nextOrder={nextOrder} />
      </div>

      <p className="text-white/20 text-[10px]"> "Per table" options book the whole table;
        "Per person" lets guests pick how many (min–max). "Used override" replaces the booked count — leave blank for automatic.
      </p>

      {ACCESS_AREAS.map((area) => {
        const areaTypes = types.filter((t) => t.area === area);
        return (
          <div key={area} className="space-y-2">
            <p className="text-white text-xs font-medium uppercase tracking-[0.15em]">{ACCESS_AREA_LABELS[area]}</p>
            {areaTypes.length === 0 && <p className="text-white/20 text-[10px]">No options — not bookable in this area.</p>}
            {areaTypes.map((t) => <TicketTypeRow key={t.id} type={t} />)}
            <AddTicketType eventId={eventId} area={area} nextOrder={nextOrder} />
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, ExternalLink, Loader2, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import type { TicketPurchase } from "@shared/schema";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const { data: purchases = [], isLoading } = useQuery<{ success: boolean; purchases: TicketPurchase[] }, Error, TicketPurchase[]>({
    queryKey: ["/api/admin/purchases"],
    select: (data) => data.purchases ?? [],
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/purchases/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      toast({ title: "Purchase verified — ticket generated" });
    },
    onError: () => toast({ title: "Verification failed", variant: "destructive" }),
  });

  const filtered = purchases.filter((p) => {
    const matchesFilter = filter === "all" || p.status === filter;
    const s = search.toLowerCase();
    const matchesSearch = !s || p.customerName.toLowerCase().includes(s) || (p.customerPhone || "").includes(s) || (p.customerEmail || "").toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: purchases.length,
    pending: purchases.filter((p) => p.status === "pending").length,
    verified: purchases.filter((p) => p.status === "verified").length,
    rejected: purchases.filter((p) => p.status === "rejected").length,
  };

  return (
    <AdminLayout title="Orders">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(["all", "pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border p-4 text-left transition-colors ${filter === s ? "border-[#c72d28] bg-[#c72d28]/5" : "border-white/10 hover:border-white/20"}`}
          >
            <p className="text-white font-black text-2xl leading-none mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{counts[s]}</p>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.2em]">{s}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email..."
          className="w-full bg-[#0a0a0a] border border-white/15 text-white placeholder:text-white/20 text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-white/40 transition-colors max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/20 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {filtered.map((p) => (
            <div key={p.id} className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-white text-sm font-medium">{p.customerName}</p>
                  <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border shrink-0 ${
                    p.status === "verified" ? "border-green-500/30 text-green-400" :
                    p.status === "rejected" ? "border-red-500/30 text-red-400" :
                    "border-yellow-500/30 text-yellow-400"
                  }`}>{p.status}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-white/30 text-xs">
                  <span>{p.ticketType}</span>
                  <span>{p.paymentMethod}</span>
                  <span>{p.quantity}x ticket{p.quantity !== 1 ? "s" : ""}</span>
                  {p.customerPhone && <span>{p.customerPhone}</span>}
                </div>
                {p.createdAt && (
                  <p className="text-white/20 text-[10px] mt-1">
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.paymentProofUrl && (
                  <a
                    href={p.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Proof
                  </a>
                )}
                {p.status === "pending" && (
                  <button
                    onClick={() => verifyMutation.mutate(p.id)}
                    disabled={verifyMutation.isPending}
                    className="flex items-center gap-1.5 bg-green-700 text-white text-[9px] uppercase tracking-[0.15em] font-bold px-4 py-2 hover:bg-green-600 disabled:opacity-40 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, ShoppingBag, Crown, Image as ImageIcon, Film, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import type { Event, TicketPurchase } from "@shared/schema";

interface ReservationsResponse {
  success: boolean;
  reservations: { id: string; status: string }[];
}

export default function AdminDashboardPage() {
  const { data: events = [] } = useQuery<{ success: boolean; events: Event[] }, Error, Event[]>({
    queryKey: ["/api/events"],
    select: (d) => d.events ?? [],
  });
  const { data: purchases = [] } = useQuery<{ success: boolean; purchases: TicketPurchase[] }, Error, TicketPurchase[]>({
    queryKey: ["/api/admin/purchases"],
    select: (d) => d.purchases ?? [],
  });
  const { data: reservationsData } = useQuery<ReservationsResponse>({
    queryKey: ["/api/admin/access/reservations"],
  });

  const pendingPurchases = purchases.filter((p) => p.status === "pending").length;
  const pendingReservations = (reservationsData?.reservations ?? []).filter((r) => r.status === "pending_payment").length;
  const upcomingEvents = events.filter((e) => !e.isPast).length;

  const cards = [
    {
      label: "Events", href: "/admin/events", icon: Calendar,
      value: events.length, hint: `${upcomingEvents} upcoming`,
    },
    {
      label: "Orders", href: "/admin/orders", icon: ShoppingBag,
      value: purchases.length, hint: pendingPurchases > 0 ? `${pendingPurchases} pending` : "all clear",
      alert: pendingPurchases > 0,
    },
    {
      label: "ACCESS", href: "/admin/access", icon: Crown,
      value: reservationsData?.reservations.length ?? 0, hint: pendingReservations > 0 ? `${pendingReservations} pending` : "all clear",
      alert: pendingReservations > 0,
    },
    { label: "Gallery", href: "/admin/gallery", icon: ImageIcon, hint: "manage photos" },
    { label: "Hero Slider", href: "/admin/hero", icon: Film, hint: "manage homepage background" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
          Overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`bg-[#0a0a0a] border p-6 hover:border-white/30 transition-colors group ${
              c.alert ? "border-yellow-500/30" : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <c.icon className="w-5 h-5 text-[#c72d28]" />
              <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
            {typeof c.value === "number" && (
              <p className="text-white font-black text-3xl leading-none mb-2" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                {c.value}
              </p>
            )}
            <p className="text-white text-sm font-medium mb-1">{c.label}</p>
            <p className={`text-[9px] uppercase tracking-[0.2em] ${c.alert ? "text-yellow-400" : "text-white/30"}`}>
              {c.hint}
            </p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}

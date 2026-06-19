import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

interface TableInventoryItem {
  label: string;
  price: number;
  capacity: number;
  maxGuests: number;
  minGuests: number;
  used: number;
}

export default function AdminAccessPage() {
  const { data: inventory, isLoading } = useQuery<Record<string, TableInventoryItem>>({
    queryKey: ["/api/access/capacity"],
  });

  const labels: Record<string, string> = {
    table_4:      "Table for 4",
    table_5:      "Table for 5",
    section_8_12: "Section (8–12 guests)",
  };

  return (
    <AdminLayout title="ACCESS">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
          Live table inventory and reservation overview
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : inventory ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {Object.entries(inventory).map(([key, item]) => {
              const pct = item.capacity > 0 ? Math.round((item.used / item.capacity) * 100) : 0;
              const remaining = item.capacity - item.used;
              return (
                <div key={key} className="bg-[#0a0a0a] border border-white/10 p-6">
                  <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em] mb-1">
                    MUR {item.price.toLocaleString()}
                  </p>
                  <h3
                    className="text-white font-black leading-none mb-4"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "28px" }}
                  >
                    {item.label}
                  </h3>

                  {/* Progress bar */}
                  <div className="h-1 bg-white/10 mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${pct >= 100 ? "bg-[#c72d28]" : pct >= 75 ? "bg-yellow-500" : "bg-[#c9962a]"}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">{item.used} booked / {item.capacity} total</span>
                    <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${remaining <= 0 ? "text-[#c72d28]" : remaining <= 1 ? "text-yellow-400" : "text-green-400"}`}>
                      {remaining <= 0 ? "Sold Out" : `${remaining} left`}
                    </span>
                  </div>

                  <div className="border-t border-white/10 mt-4 pt-4 text-white/25 text-[9px] uppercase tracking-[0.2em]">
                    Up to {item.maxGuests} guests per booking
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-4">Summary</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Total Bookings",
                  value: Object.values(inventory).reduce((s, i) => s + i.used, 0),
                },
                {
                  label: "Tables Remaining",
                  value: Object.values(inventory).reduce((s, i) => s + Math.max(0, i.capacity - i.used), 0),
                },
                {
                  label: "Revenue Est.",
                  value: "MUR " + Object.values(inventory).reduce((s, i) => s + i.used * i.price, 0).toLocaleString(),
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0a0a0a] border border-white/10 p-5">
                  <p className="text-white font-black leading-none mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "32px" }}>
                    {stat.value}
                  </p>
                  <p className="text-white/25 text-[9px] uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-white/20 text-sm">Failed to load inventory.</p>
      )}
    </AdminLayout>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LayoutDashboard, Calendar, ShoppingBag, Crown, Image, LogOut,
  Menu, X, Loader2, Film, QrCode, Search, Ticket as TicketIcon, ShieldCheck,
} from "lucide-react";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

// ─── Login form ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
type LoginData = z.infer<typeof loginSchema>;

function LoginScreen() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: LoginData) => apiRequest("POST", "/api/admin/login", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] }),
    onError: () => toast({ title: "Invalid credentials", variant: "destructive" }),
  });

  const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <img src={logoImage} alt="AFTR" className="h-10 w-auto mb-12 opacity-60" />
        <p className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em] mb-2">Admin</p>
        <h1
          className="font-black text-white leading-none mb-10"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "48px" }}
        >
          SIGN IN.
        </h1>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          <div>
            <input {...register("username")} placeholder="Username" className={inputCls} autoComplete="username" />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <input {...register("password")} type="password" placeholder="Password" className={inputCls} autoComplete="current-password" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] font-bold py-4 hover:bg-[#a82421] disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const sideLinks = [
  { label: "Dashboard",  href: "/admin",          icon: LayoutDashboard },
  { label: "Events",     href: "/admin/events",    icon: Calendar },
  { label: "Orders",     href: "/admin/orders",    icon: ShoppingBag },
  { label: "QR Scanner", href: "/admin/scan",      icon: QrCode },
  { label: "ACCESS",     href: "/admin/access",    icon: Crown },
  { label: "ACCESS Events", href: "/admin/access/events", icon: Calendar },
  { label: "ACCESS Gallery", href: "/admin/access/gallery", icon: Image },
  { label: "Gallery",    href: "/admin/gallery",   icon: Image },
  { label: "Hero",       href: "/admin/hero",      icon: Film },
];

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/check"] }),
    onError: () => toast({ title: "Logout failed", variant: "destructive" }),
  });

  return (
    <aside className="w-56 bg-[#0a0a0a] border-r border-white/10 flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/10">
        <img src={logoImage} alt="AFTR Admin" className="h-9 w-auto opacity-70" />
      </div>
      <nav className="flex-1 py-4">
        {sideLinks.map((link) => {
          const active = link.href === "/admin" ? location === "/admin" : location.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                active ? "text-white bg-white/5 border-r-2 border-[#c72d28]" : "text-white/35 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <link.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-white/10">
        <button
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-2 text-white/25 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Global search ──────────────────────────────────────────────────────────
interface SearchPurchase {
  id: string; eventId: string | null; customerName: string; customerPhone: string;
  ticketType: string; status: string; eventName: string | null;
}
interface SearchTicket {
  id: string; eventId: string | null; customerName: string; customerPhone: string | null;
  referenceCode: string; isUsed: boolean; eventName: string | null;
}
interface SearchReservation {
  id: string; tableType: string; tableLabel: string; status: string;
  matchedGuests: { name: string; phone?: string; passId: string }[];
}
interface SearchResponse {
  success: boolean;
  purchases: SearchPurchase[];
  tickets: SearchTicket[];
  accessReservations: SearchReservation[];
}

function GlobalSearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const { data, isFetching } = useQuery<SearchResponse>({
    queryKey: ["/api/admin/search", debounced],
    queryFn: () => fetch(`/api/admin/search?q=${encodeURIComponent(debounced)}`, { credentials: "include" }).then((r) => r.json()),
    enabled: debounced.length >= 2,
  });

  const purchases = data?.purchases ?? [];
  const tickets = data?.tickets ?? [];
  const accessReservations = data?.accessReservations ?? [];
  const hasResults = purchases.length + tickets.length + accessReservations.length > 0;

  function go(path: string) {
    navigate(path);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search orders, tickets, ACCESS..."
        className="w-full bg-[#0a0a0a] border border-white/15 text-white placeholder:text-white/20 text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-white/40 transition-colors"
      />

      {open && debounced.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/15 shadow-2xl max-h-[70vh] overflow-y-auto z-50">
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
            </div>
          ) : !hasResults ? (
            <p className="text-white/20 text-xs text-center py-8">No matches for "{debounced}"</p>
          ) : (
            <>
              {purchases.length > 0 && (
                <div className="py-2">
                  <p className="text-white/25 text-[9px] uppercase tracking-[0.2em] px-4 pb-1.5">Ticket Orders</p>
                  {purchases.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go(p.eventId ? `/admin/events/${p.eventId}?tab=orders&q=${encodeURIComponent(p.customerName)}` : `/admin/orders?q=${encodeURIComponent(p.customerName)}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs truncate">{p.customerName}</p>
                        <p className="text-white/30 text-[10px] truncate">{p.customerPhone} · {p.ticketType} · {p.eventName ?? "Unknown event"}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 border shrink-0 ${
                        p.status === "verified" ? "border-green-500/30 text-green-400" : p.status === "rejected" ? "border-red-500/30 text-red-400" : "border-yellow-500/30 text-yellow-400"
                      }`}>{p.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {tickets.length > 0 && (
                <div className="py-2 border-t border-white/10">
                  <p className="text-white/25 text-[9px] uppercase tracking-[0.2em] px-4 pb-1.5">Tickets</p>
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => go(t.eventId ? `/admin/events/${t.eventId}?tab=tickets&q=${encodeURIComponent(t.referenceCode)}` : `/admin/orders?q=${encodeURIComponent(t.customerName)}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <TicketIcon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs truncate">{t.customerName} <span className="text-white/30 font-mono">· {t.referenceCode}</span></p>
                        <p className="text-white/30 text-[10px] truncate">{t.customerPhone} · {t.eventName ?? "Unknown event"}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 border shrink-0 ${t.isUsed ? "border-white/10 text-white/20" : "border-green-500/30 text-green-400"}`}>
                        {t.isUsed ? "Used" : "Valid"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {accessReservations.length > 0 && (
                <div className="py-2 border-t border-white/10">
                  <p className="text-white/25 text-[9px] uppercase tracking-[0.2em] px-4 pb-1.5">ACCESS</p>
                  {accessReservations.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => go(`/admin/access?q=${encodeURIComponent(r.matchedGuests[0]?.name ?? r.tableLabel)}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs truncate">
                          {r.matchedGuests.length > 0 ? r.matchedGuests.map((g) => g.name).join(", ") : r.tableLabel}
                        </p>
                        <p className="text-white/30 text-[10px] truncate">{r.tableLabel}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-[0.15em] px-1.5 py-0.5 border shrink-0 ${
                        r.status === "approved" ? "border-green-500/30 text-green-400" : r.status === "rejected" ? "border-red-500/30 text-red-400" : "border-yellow-500/30 text-yellow-400"
                      }`}>{r.status.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  usePageTitle(title ? `Admin · ${title}` : "Admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: authData, isLoading } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!authData?.isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-white font-black text-lg tracking-wide shrink-0"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          >
            {title || "Admin"}
          </h1>
          <div className="flex-1 min-w-[200px] sm:max-w-sm sm:ml-auto">
            <GlobalSearch />
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

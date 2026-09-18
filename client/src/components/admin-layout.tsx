import { useState } from "react";
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
  Menu, X, Loader2, Film,
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
  { label: "ACCESS",     href: "/admin/access",    icon: Crown },
  { label: "ACCESS Events", href: "/admin/access/events", icon: Calendar },
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
        <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-white font-black text-lg tracking-wide"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          >
            {title || "Admin"}
          </h1>
        </div>

        {/* Page body */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

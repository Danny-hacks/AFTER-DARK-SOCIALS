import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Ticket, LogIn, LogOut, Plus, Users, CheckCircle, Eye, QrCode,
  Search, Trash, Calendar, Video, Upload, Music, MapPin, Clock,
  LayoutDashboard, PartyPopper, Edit, X, Image, Play, CreditCard,
  Mail, Phone, XCircle, ExternalLink, Loader2, ChevronDown, ChevronUp, Menu
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Ticket as TicketType, Event as EventType, HeroSlide as HeroSlideType, TicketPurchase as TicketPurchaseType } from "@shared/schema";
import { TicketGenerator } from "@/components/ticket-generator";
import { QRScanner } from "@/components/qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ObjectUploader } from "@/components/ObjectUploader";

// ─── Schemas ────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  isPast: z.boolean().default(false),
});

const ticketSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  referenceCode: z.string().min(1, "Reference code is required").regex(/^AFTR-/, "Reference code must start with 'AFTR-'"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, { message: "Please enter a valid email address" }),
  customerPhone: z.string().optional().refine((val) => !val || /^[\d\s\+\-\(\)]+$/.test(val), { message: "Please enter a valid phone number" }),
  ticketType: z.string().default("Early Bird"),
  price: z.string().default("Rs 350"),
  paymentMethod: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type EventFormData = z.infer<typeof eventSchema>;
type TicketFormData = z.infer<typeof ticketSchema>;

// ─── Shared style primitives ─────────────────────────────────────────────────
const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors rounded-none";
const labelCls = "block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2";

function Btn({ children, onClick, disabled, variant = "primary", size = "md", className = "", type = "button", ...rest }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "green" | "whatsapp";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  [key: string]: any;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "text-[10px] px-3 py-2", md: "text-xs px-5 py-3" };
  const variants = {
    primary: "bg-[#c72d28] text-white hover:bg-[#a82421]",
    secondary: "border border-white/20 text-white/60 hover:border-white/50 hover:text-white",
    ghost: "text-white/30 hover:text-white",
    danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
    green: "bg-green-700 text-white hover:bg-green-600",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#1da851]",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

function StatBox({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="border border-white/10 p-6 hover:border-white/20 transition-colors">
      <div className={`text-3xl font-black mb-1 ${accent ? 'text-[#c72d28]' : 'text-white'}`} style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-center gap-4 mb-3">
        <span className="block w-6 h-px bg-[#c72d28]" />
        <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">{label}</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-black text-white leading-none" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{title}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "border-orange-500/40 text-orange-400",
    verified: "border-green-500/40 text-green-400",
    rejected: "border-red-500/40 text-red-400",
    used: "border-green-500/40 text-green-400",
    available: "border-white/20 text-white/40",
    sent: "border-green-500/40 text-green-400",
    "not sent": "border-orange-500/40 text-orange-400",
    past: "border-white/20 text-white/30",
    upcoming: "border-[#c72d28]/40 text-[#c72d28]",
    video: "border-blue-500/40 text-blue-400",
    hidden: "border-yellow-500/40 text-yellow-400",
  };
  const cls = map[status.toLowerCase()] ?? "border-white/20 text-white/40";
  return <span className={`border text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 font-bold ${cls}`}>{status}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<TicketType | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchases' | 'events' | 'tickets' | 'hero'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'available'>('all');
  const [filterEventId, setFilterEventId] = useState<string>('all');
  const [vol3SearchQuery, setVol3SearchQuery] = useState('');
  const [vol3FilterStatus, setVol3FilterStatus] = useState<'all' | 'used' | 'available'>('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [purchasesSubTab, setPurchasesSubTab] = useState<'all' | 'ready' | 'vol3'>('all');
  const [allPurchasesSearch, setAllPurchasesSearch] = useState('');
  const [allPurchasesFilter, setAllPurchasesFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [readyToDeliverSearch, setReadyToDeliverSearch] = useState('');
  const [readyToDeliverFilter, setReadyToDeliverFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/check');
        const data = await response.json();
        setIsAuthenticated(data?.isAuthenticated || false);
      } catch { setIsAuthenticated(false); }
      finally { setIsLoading(false); }
    };
    checkAuth();
  }, []);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "" } });
  const eventForm = useForm<EventFormData>({ resolver: zodResolver(eventSchema), defaultValues: { name: "", date: "", time: "", venue: "", description: "", isPast: false } });
  const ticketForm = useForm<TicketFormData>({ resolver: zodResolver(ticketSchema), defaultValues: { eventId: "", referenceCode: "AFTR-", customerName: "", customerEmail: "", customerPhone: "", ticketType: "Early Bird", price: "Rs 350", paymentMethod: "" } });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => apiRequest('POST', '/api/admin/login', data),
    onSuccess: () => { setIsAuthenticated(true); toast({ title: "Welcome back!", description: "Logged in to AFTR Brand Manager" }); },
    onError: (error) => toast({ title: "Login Failed", description: error.message, variant: "destructive" }),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/logout'),
    onSuccess: () => { setIsAuthenticated(false); toast({ title: "Signed out" }); },
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ events: EventType[] }>({ queryKey: ['/api/events'], enabled: isAuthenticated });
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery<{ tickets: TicketType[] }>({ queryKey: ['/api/admin/tickets'], enabled: isAuthenticated });
  const { data: heroSlidesData, isLoading: heroSlidesLoading } = useQuery<{ slides: HeroSlideType[] }>({ queryKey: ['/api/admin/hero-slides'], enabled: isAuthenticated });
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery<{ purchases: TicketPurchaseType[] }>({ queryKey: ['/api/admin/purchases'], enabled: isAuthenticated });

  const allEvents: EventType[] = Array.isArray(eventsData?.events) ? eventsData.events : [];
  const allTickets: TicketType[] = Array.isArray(ticketsData?.tickets) ? ticketsData.tickets : [];
  const allHeroSlides: HeroSlideType[] = Array.isArray(heroSlidesData?.slides) ? heroSlidesData.slides : [];
  const allPurchases: TicketPurchaseType[] = Array.isArray(purchasesData?.purchases) ? purchasesData.purchases : [];
  const pendingPurchases = allPurchases.filter(p => p.status === 'pending');
  const pastEvents = allEvents.filter(e => e.isPast);
  const vol2Tickets = allTickets.filter(t => t.referenceCode.startsWith('VOL3-'));
  const vol2UsedTickets = vol2Tickets.filter(t => t.isUsed);
  const vol2AvailableTickets = vol2Tickets.filter(t => !t.isUsed);
  const legacyTickets = allTickets.filter(t => !t.referenceCode.startsWith('VOL2-') && !t.referenceCode.startsWith('VOL3-'));

  const filteredVol2Tickets = vol2Tickets.filter(ticket => {
    const s = vol3SearchQuery.toLowerCase();
    return (vol3SearchQuery === '' || ticket.customerName.toLowerCase().includes(s) || ticket.referenceCode.toLowerCase().includes(s) || (ticket.customerEmail ?? '').toLowerCase().includes(s) || (ticket.customerPhone ?? '').toLowerCase().includes(s)) &&
      (vol3FilterStatus === 'all' || (vol3FilterStatus === 'used' && ticket.isUsed) || (vol3FilterStatus === 'available' && !ticket.isUsed));
  });

  const readyToDeliverTickets = allTickets.filter(ticket => {
    const purchase = allPurchases.find(p => p.id === ticket.purchaseId);
    return purchase && purchase.status === 'verified';
  });

  const filteredAllPurchases = allPurchases.filter(purchase => {
    const s = allPurchasesSearch.toLowerCase();
    return (allPurchasesSearch === '' || purchase.customerName.toLowerCase().includes(s) || (purchase.customerEmail ?? '').toLowerCase().includes(s) || purchase.customerPhone.toLowerCase().includes(s)) &&
      (allPurchasesFilter === 'all' || purchase.status === allPurchasesFilter);
  });

  const filteredReadyToDeliver = readyToDeliverTickets.filter(ticket => {
    const s = readyToDeliverSearch.toLowerCase();
    const isSent = ticket.isDelivered ?? false;
    return (readyToDeliverSearch === '' || ticket.customerName.toLowerCase().includes(s) || (ticket.customerEmail ?? '').toLowerCase().includes(s) || (ticket.customerPhone ?? '').toLowerCase().includes(s) || ticket.referenceCode.toLowerCase().includes(s)) &&
      (readyToDeliverFilter === 'all' || (readyToDeliverFilter === 'sent' && isSent) || (readyToDeliverFilter === 'pending' && !isSent));
  });

  const filteredTickets = legacyTickets.filter(ticket => {
    const s = searchQuery.toLowerCase();
    return (searchQuery === '' || ticket.customerName.toLowerCase().includes(s) || ticket.referenceCode.toLowerCase().includes(s) || (ticket.customerEmail ?? '').toLowerCase().includes(s)) &&
      (filterStatus === 'all' || (filterStatus === 'used' && ticket.isUsed) || (filterStatus === 'available' && !ticket.isUsed)) &&
      (filterEventId === 'all' || ticket.eventId === filterEventId);
  });

  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => apiRequest('POST', '/api/admin/events', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/events'] }); eventForm.reset(); setShowCreateEvent(false); toast({ title: "Event Created" }); },
    onError: (error) => toast({ title: "Failed to Create Event", description: error.message, variant: "destructive" }),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData & { videoUrl: string }> }) => apiRequest('PATCH', `/api/admin/events/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/events'] }); setEditingEvent(null); toast({ title: "Event Updated" }); },
    onError: (error) => toast({ title: "Failed to Update Event", description: error.message, variant: "destructive" }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/events/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/events'] }); toast({ title: "Event Deleted" }); },
    onError: () => toast({ title: "Failed to Delete Event", variant: "destructive" }),
  });

  const createTicketMutation = useMutation({
    mutationFn: (data: TicketFormData) => apiRequest('POST', '/api/admin/tickets', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] }); ticketForm.reset({ referenceCode: 'AFTR-', ticketType: 'Early Bird', price: 'Rs 350', eventId: '', customerName: '', customerEmail: '', customerPhone: '', paymentMethod: '' }); toast({ title: "Ticket Created" }); },
    onError: (error) => toast({ title: "Failed to Create Ticket", description: error.message, variant: "destructive" }),
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/tickets/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] }); toast({ title: "Ticket Deleted" }); },
    onError: () => toast({ title: "Failed to Delete Ticket", variant: "destructive" }),
  });

  const markUsedMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/api/admin/tickets/${id}/use`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] }); toast({ title: "Ticket Marked as Used" }); },
    onError: () => toast({ title: "Failed to Update Ticket", variant: "destructive" }),
  });

  const verifyPurchaseMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/admin/purchases/${id}/verify`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] }); queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] }); toast({ title: "Purchase Verified", description: "Ticket(s) created and ready to deliver." }); },
    onError: (error) => toast({ title: "Verification Failed", description: error.message, variant: "destructive" }),
  });

  const rejectPurchaseMutation = useMutation({
    mutationFn: ({ purchaseId, reason }: { purchaseId: string; reason: string }) => apiRequest('POST', `/api/admin/purchases/${purchaseId}/reject`, { reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] }); toast({ title: "Purchase Rejected" }); },
    onError: () => toast({ title: "Failed to Reject Purchase", variant: "destructive" }),
  });

  const markDeliveredMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/api/admin/tickets/${id}/deliver`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] }); toast({ title: "Ticket Marked as Delivered" }); },
    onError: () => toast({ title: "Failed to Update", variant: "destructive" }),
  });

  const createHeroSlideMutation = useMutation({
    mutationFn: (data: { type: string; url: string; order: string }) => apiRequest('POST', '/api/admin/hero-slides', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-slides'] }); toast({ title: "Slide Added" }); },
    onError: () => toast({ title: "Failed to Add Slide", variant: "destructive" }),
  });

  const updateHeroSlideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HeroSlideType> }) => apiRequest('PATCH', `/api/admin/hero-slides/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-slides'] }); toast({ title: "Slide Updated" }); },
    onError: () => toast({ title: "Failed to Update Slide", variant: "destructive" }),
  });

  const deleteHeroSlideMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/admin/hero-slides/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-slides'] }); toast({ title: "Slide Deleted" }); },
    onError: () => toast({ title: "Failed to Delete Slide", variant: "destructive" }),
  });

  const handleManualScan = async (code: string) => {
    try {
      const response = await apiRequest('GET', `/api/tickets/verify/${code}`);
      const data = await response.json();
      if (data.ticket) setScannedTicket(data.ticket);
      else toast({ title: "Ticket Not Found", description: "Could not find a ticket with that code", variant: "destructive" });
    } catch {
      toast({ title: "Ticket Not Found", description: "Could not find a ticket with that code", variant: "destructive" });
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c72d28] mx-auto mb-4" />
          <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Login ──────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-4 mb-10">
            <span className="block w-6 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Admin</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-none mb-12" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
            AFTR<br />BRAND<br />MANAGER
          </h1>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-5">
              <FormField control={loginForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Username</FormLabel>
                  <FormControl>
                    <input {...field} className={inputCls} placeholder="Username" data-testid="input-username" />
                  </FormControl>
                  <FormMessage className="text-[#c72d28] text-xs" />
                </FormItem>
              )} />
              <FormField control={loginForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Password</FormLabel>
                  <FormControl>
                    <input {...field} type="password" className={inputCls} placeholder="Password" data-testid="input-password" />
                  </FormControl>
                  <FormMessage className="text-[#c72d28] text-xs" />
                </FormItem>
              )} />
              <button type="submit" disabled={loginMutation.isPending}
                className="w-full bg-white text-black text-xs uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#c72d28] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                data-testid="button-login"
              >
                {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  // ─── Admin Layout ────────────────────────────────────────────────────────────
  const navItems = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, badge: null },
    { key: 'purchases' as const, label: 'Purchases', icon: <CreditCard className="w-4 h-4" />, badge: pendingPurchases.length > 0 ? pendingPurchases.length : null },
    { key: 'events' as const, label: 'Events', icon: <PartyPopper className="w-4 h-4" />, badge: allEvents.length },
    { key: 'tickets' as const, label: 'Legacy Tickets', icon: <Ticket className="w-4 h-4" />, badge: legacyTickets.length },
    { key: 'hero' as const, label: 'Hero Slider', icon: <Image className="w-4 h-4" />, badge: allHeroSlides.length },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      <div className="px-6 py-8 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-[#c72d28] uppercase tracking-[0.3em] mb-1">Brand Manager</p>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>AFTR</h1>
        </div>
        <button className="md:hidden text-white/30 hover:text-white transition-colors" onClick={closeSidebar}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => { setActiveTab(item.key); closeSidebar(); }}
            className={`w-full flex items-center gap-3 px-6 py-3.5 text-xs uppercase tracking-[0.15em] font-bold transition-colors relative ${
              activeTab === item.key
                ? 'text-white bg-white/5'
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
            }`}
            data-testid={`nav-${item.key}`}
          >
            {activeTab === item.key && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c72d28]" />}
            {item.icon}
            {item.label}
            {item.badge !== null && item.badge !== undefined && (
              <span className={`ml-auto text-[9px] px-2 py-0.5 font-bold border ${item.key === 'purchases' && pendingPurchases.length > 0 ? 'border-orange-500/50 text-orange-400' : 'border-white/15 text-white/30'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-3 text-white/30 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar — desktop: always visible, mobile: drawer */}
      <div className={`fixed left-0 top-0 h-full w-60 bg-black border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-black border-b border-white/10 flex items-center justify-between px-4 py-3">
        <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">{navItems.find(n => n.key === activeTab)?.label}</p>
        <div className="w-5" />
      </div>

      {/* Main Content */}
      <div className="md:ml-60 pt-12 md:pt-0 p-4 md:p-10 min-h-screen">

        {/* ── DASHBOARD ────────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div>
            <SectionHeading label="Overview" title="DASHBOARD" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-10">
              <StatBox label="Total Events" value={allEvents.length} />
              <StatBox label="Past Events" value={pastEvents.length} />
              <StatBox label="Total Tickets" value={allTickets.length} accent />
              <StatBox label="Pending Purchases" value={pendingPurchases.length} accent={pendingPurchases.length > 0} />
            </div>

            {/* Quick Actions */}
            <div className="border border-white/10 p-6 mb-8">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5">Quick Actions</p>
              <div className="flex flex-wrap gap-3">
                <Btn onClick={() => { setActiveTab('events'); setShowCreateEvent(true); }} data-testid="quick-add-event">
                  <Plus className="w-3 h-3" /> Add Event
                </Btn>
                <Btn variant="secondary" onClick={() => setActiveTab('tickets')} data-testid="quick-view-tickets">
                  <Ticket className="w-3 h-3" /> View Tickets
                </Btn>
                <Btn variant="secondary" onClick={() => setShowQRScanner(true)} data-testid="quick-scan-qr">
                  <QrCode className="w-3 h-3" /> Scan QR
                </Btn>
              </div>
            </div>

            {/* Recent Events */}
            <div className="border border-white/10">
              <div className="px-6 py-4 border-b border-white/10">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Recent Events</p>
              </div>
              <div className="divide-y divide-white/5">
                {eventsLoading ? (
                  <div className="px-6 py-8 text-white/20 text-xs uppercase tracking-widest">Loading...</div>
                ) : allEvents.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-white/20 text-xs uppercase tracking-widest mb-4">No events yet</p>
                    <Btn onClick={() => { setActiveTab('events'); setShowCreateEvent(true); }}>
                      <Plus className="w-3 h-3" /> Create Event
                    </Btn>
                  </div>
                ) : allEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-white text-sm font-medium">{event.name}</p>
                      <p className="text-white/30 text-xs mt-0.5">{event.date}{event.time ? ` · ${event.time}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.videoUrl && <StatusBadge status="video" />}
                      <StatusBadge status={event.isPast ? 'past' : 'upcoming'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PURCHASES ───────────────────────────────────────────────────── */}
        {activeTab === 'purchases' && (
          <div>
            <SectionHeading label="Finance" title="PURCHASES" />

            {/* Sub-tabs */}
            <div className="flex gap-0 border border-white/10 w-full overflow-x-auto mb-8">
              {[
                { key: 'all' as const, label: 'All', count: allPurchases.length },
                { key: 'ready' as const, label: 'Deliver', count: readyToDeliverTickets.length },
                { key: 'vol3' as const, label: 'Vol. 3', count: vol2Tickets.length },
              ].map(f => (
                <button key={f.key} onClick={() => setPurchasesSubTab(f.key)}
                  className={`flex-1 px-3 md:px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold border-r border-white/10 last:border-0 transition-colors whitespace-nowrap ${purchasesSubTab === f.key ? 'bg-[#c72d28] text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  data-testid={`purchases-subtab-${f.key}`}
                >
                  {f.label} <span className="ml-1 opacity-60">{f.count}</span>
                </button>
              ))}
            </div>

            {/* ALL PURCHASES */}
            {purchasesSubTab === 'all' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
                  <StatBox label="Pending" value={pendingPurchases.length} accent={pendingPurchases.length > 0} />
                  <StatBox label="Verified" value={allPurchases.filter(p => p.status === 'verified').length} />
                  <StatBox label="Rejected" value={allPurchases.filter(p => p.status === 'rejected').length} />
                  <StatBox label="Total" value={allPurchases.length} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input placeholder="Search by name, email, or phone..." value={allPurchasesSearch} onChange={(e) => setAllPurchasesSearch(e.target.value)}
                      className={`${inputCls} pl-10`} data-testid="input-search-all-purchases" />
                  </div>
                  <Select value={allPurchasesFilter} onValueChange={(v: 'all' | 'pending' | 'verified' | 'rejected') => setAllPurchasesFilter(v)}>
                    <SelectTrigger className="w-36 bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-filter-all-purchases">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border border-white/10 divide-y divide-white/5">
                  {purchasesLoading ? (
                    <div className="p-8 text-white/20 text-xs uppercase tracking-widest text-center">Loading...</div>
                  ) : filteredAllPurchases.length === 0 ? (
                    <div className="p-10 text-white/20 text-xs uppercase tracking-widest text-center">
                      {allPurchases.length === 0 ? "No purchases yet." : "No results found."}
                    </div>
                  ) : filteredAllPurchases.map((purchase) => (
                    <div key={purchase.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <span className="text-white font-semibold">{purchase.customerName}</span>
                            <StatusBadge status={purchase.status} />
                            {purchase.ticketType === 'Golden VIP' && (
                              <span className="text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 font-bold" style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}>★ Golden VIP</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-white/30 text-xs">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{purchase.customerPhone}</span>
                            {purchase.customerEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{purchase.customerEmail}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-white font-bold">{purchase.price}</div>
                          {(purchase.quantity ?? 1) > 1 && <div className="text-white/30 text-xs">{purchase.quantity} tickets</div>}
                          <div className="text-white/20 text-xs mt-1">{purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : ''}</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="border border-white/10 text-white/30 text-[9px] uppercase tracking-[0.15em] px-2 py-1">{purchase.paymentMethod}</span>
                          <span className="flex items-center gap-1 text-[#25D366] text-[9px] uppercase tracking-[0.15em]"><SiWhatsapp className="w-3 h-3" />WhatsApp</span>
                        </div>
                        {purchase.status === 'pending' && (
                          <div className="flex items-center gap-2 sm:ml-auto">
                            <Btn size="sm" variant="green" onClick={() => verifyPurchaseMutation.mutate(purchase.id)} disabled={verifyPurchaseMutation.isPending} data-testid={`verify-purchase-${purchase.id}`}>
                              {verifyPurchaseMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              Verify {(purchase.quantity ?? 1) > 1 ? `${purchase.quantity} Tickets` : ''}
                            </Btn>
                            <Btn size="sm" variant="danger" onClick={() => rejectPurchaseMutation.mutate({ purchaseId: purchase.id, reason: 'Payment not verified' })} disabled={rejectPurchaseMutation.isPending} data-testid={`reject-purchase-${purchase.id}`}>
                              <XCircle className="w-3 h-3" /> Reject
                            </Btn>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* READY TO DELIVER */}
            {purchasesSubTab === 'ready' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input placeholder="Search by name, phone, or reference..." value={readyToDeliverSearch} onChange={(e) => setReadyToDeliverSearch(e.target.value)}
                      className={`${inputCls} pl-10`} data-testid="input-search-ready-deliver" />
                  </div>
                  <Select value={readyToDeliverFilter} onValueChange={(v: 'all' | 'pending' | 'sent') => setReadyToDeliverFilter(v)}>
                    <SelectTrigger className="w-36 bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-filter-ready-deliver">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Not Sent</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border border-white/10 divide-y divide-white/5">
                  {filteredReadyToDeliver.length === 0 ? (
                    <div className="p-10 text-white/20 text-xs uppercase tracking-widest text-center">
                      {readyToDeliverTickets.length === 0 ? "No tickets ready. Verify purchases first." : "No results found."}
                    </div>
                  ) : filteredReadyToDeliver.map((ticket) => {
                    const isSent = ticket.isDelivered ?? false;
                    const waMsg = encodeURIComponent(`🎉 Your AFTR Vol. 3: Full Capacity Ticket is Ready! 🎉\n\n📧 Customer: ${ticket.customerName}\n🎫 Reference: ${ticket.referenceCode}\n💰 Price: ${ticket.price}\n📅 Date: 18th April 2026\n📍 Venue: Shotz, Flic en Flac\n🕙 Door opens: 10:00 PM\n\nSee you on the dance floor! 🎵🔥`);
                    return (
                      <div key={ticket.id} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-white font-semibold">{ticket.customerName}</span>
                            <StatusBadge status={isSent ? 'sent' : 'not sent'} />
                          </div>
                          <div className="text-white/30 text-xs font-mono">{ticket.referenceCode}</div>
                          <div className="text-white/20 text-xs mt-0.5">{ticket.customerPhone}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSent ? (
                            <Btn size="sm" variant="secondary" onClick={() => window.open(`https://wa.me/${(ticket.customerPhone ?? '').replace(/\D/g, '')}?text=${waMsg}`, '_blank')} data-testid={`resend-whatsapp-${ticket.id}`}>
                              <SiWhatsapp className="w-3 h-3" /> Resend
                            </Btn>
                          ) : (
                            <Btn size="sm" variant="whatsapp" onClick={() => { markDeliveredMutation.mutate(ticket.id); window.open(`https://wa.me/${(ticket.customerPhone ?? '').replace(/\D/g, '')}?text=${waMsg}`, '_blank'); }} disabled={markDeliveredMutation.isPending} data-testid={`send-whatsapp-${ticket.id}`}>
                              {markDeliveredMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <SiWhatsapp className="w-3 h-3" />}
                              Send Ticket
                            </Btn>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="border border-white/15 text-white/40 hover:text-white p-2 transition-colors" data-testid={`view-ticket-${ticket.id}`}>
                                <Eye className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/15 rounded-none">
                              <DialogHeader><DialogTitle className="text-white">Ticket — {ticket.referenceCode}</DialogTitle></DialogHeader>
                              <TicketGenerator ticket={ticket} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VOL 3 TICKETS */}
            {purchasesSubTab === 'vol3' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                  <StatBox label="Total Vol.3 Tickets" value={vol2Tickets.length} />
                  <StatBox label="Used" value={vol2UsedTickets.length} />
                  <StatBox label="Available" value={vol2AvailableTickets.length} accent />
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input placeholder="Search by name, email, phone, or reference..." value={vol3SearchQuery} onChange={(e) => setVol3SearchQuery(e.target.value)}
                      className={`${inputCls} pl-10`} data-testid="input-search-vol3-tickets" />
                  </div>
                  <Select value={vol3FilterStatus} onValueChange={(v: 'all' | 'used' | 'available') => setVol3FilterStatus(v)}>
                    <SelectTrigger className="w-36 bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-filter-vol3-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                      <SelectItem value="all">All Tickets</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border border-white/10 divide-y divide-white/5">
                  {ticketsLoading ? (
                    <div className="p-8 text-white/20 text-xs uppercase tracking-widest text-center">Loading...</div>
                  ) : filteredVol2Tickets.length === 0 ? (
                    <div className="p-10 text-white/20 text-xs uppercase tracking-widest text-center">
                      {vol2Tickets.length === 0 ? "No Vol.3 tickets yet. Verify purchases to create tickets." : "No results found."}
                    </div>
                  ) : filteredVol2Tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 ${ticket.isUsed ? 'bg-green-500' : 'bg-[#c72d28]'}`} />
                        <div>
                          <p className="text-white text-sm font-medium">{ticket.customerName}</p>
                          <p className="text-white/30 text-xs font-mono">{ticket.referenceCode}</p>
                          <div className="flex items-center gap-3 text-white/20 text-xs mt-0.5">
                            {ticket.customerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{ticket.customerPhone}</span>}
                            {ticket.customerEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{ticket.customerEmail}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs mr-2">{ticket.price}</span>
                        <StatusBadge status={ticket.isUsed ? 'used' : 'available'} />
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="border border-white/15 text-white/40 hover:text-white p-2 transition-colors" data-testid={`button-view-vol3-ticket-${ticket.id}`}>
                              <Eye className="w-4 h-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/15 rounded-none">
                            <DialogHeader><DialogTitle className="text-white">Ticket — {ticket.referenceCode}</DialogTitle></DialogHeader>
                            <TicketGenerator ticket={ticket} />
                          </DialogContent>
                        </Dialog>
                        {!ticket.isUsed && (
                          <button className="border border-white/15 text-white/40 hover:text-green-400 p-2 transition-colors" onClick={() => markUsedMutation.mutate(ticket.id)} disabled={markUsedMutation.isPending} data-testid={`button-mark-vol3-used-${ticket.id}`}>
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-white/20 hover:text-red-400 p-2 transition-colors" onClick={() => { if (confirm('Delete this ticket?')) deleteTicketMutation.mutate(ticket.id); }} data-testid={`button-delete-vol3-ticket-${ticket.id}`}>
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── EVENTS ───────────────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div>
            <div className="flex items-start justify-between mb-10">
              <SectionHeading label="Management" title="EVENTS" />
              <Btn onClick={() => setShowCreateEvent(true)} data-testid="button-create-event">
                <Plus className="w-3 h-3" /> Create Event
              </Btn>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
              <DialogContent className="max-w-lg bg-[#0a0a0a] border-white/15 rounded-none">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg font-black uppercase tracking-[0.1em]" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Create New Event</DialogTitle>
                </DialogHeader>
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit((data) => createEventMutation.mutate(data))} className="space-y-4 mt-4">
                    <FormField control={eventForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelCls}>Event Name</FormLabel>
                        <FormControl><input {...field} className={inputCls} placeholder="e.g., AFTR Vol. 4" data-testid="input-event-name" /></FormControl>
                        <FormMessage className="text-[#c72d28] text-xs" />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={eventForm.control} name="date" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelCls}>Date</FormLabel>
                          <FormControl><input {...field} className={inputCls} placeholder="e.g., April 18, 2026" data-testid="input-event-date" /></FormControl>
                          <FormMessage className="text-[#c72d28] text-xs" />
                        </FormItem>
                      )} />
                      <FormField control={eventForm.control} name="time" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelCls}>Time</FormLabel>
                          <FormControl><input {...field} className={inputCls} placeholder="e.g., 10PM" data-testid="input-event-time" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={eventForm.control} name="venue" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelCls}>Venue</FormLabel>
                        <FormControl><input {...field} className={inputCls} placeholder="e.g., Shotz, Flic en Flac" data-testid="input-event-venue" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={eventForm.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelCls}>Description</FormLabel>
                        <FormControl><Textarea {...field} className={`${inputCls} resize-none`} placeholder="Describe the event..." rows={3} data-testid="input-event-description" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={eventForm.control} name="isPast" render={({ field }) => (
                      <FormItem className="flex items-center justify-between border border-white/10 p-4">
                        <div>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-[0.15em]">Mark as Past Event</FormLabel>
                          <p className="text-white/25 text-xs mt-0.5">Enable if this event has already happened</p>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-is-past" /></FormControl>
                      </FormItem>
                    )} />
                    <div className="flex gap-3 pt-2">
                      <Btn variant="secondary" className="flex-1" onClick={() => setShowCreateEvent(false)}>Cancel</Btn>
                      <Btn type="submit" className="flex-1" disabled={createEventMutation.isPending} data-testid="button-submit-event">
                        {createEventMutation.isPending ? <><Loader2 className="w-3 h-3 animate-spin" />Creating...</> : <><Plus className="w-3 h-3" />Create Event</>}
                      </Btn>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {eventsLoading ? (
              <div className="py-12 text-white/20 text-xs uppercase tracking-widest text-center">Loading events...</div>
            ) : allEvents.length === 0 ? (
              <div className="border border-white/10 py-16 text-center">
                <p className="text-white/20 text-xs uppercase tracking-widest mb-6">No events yet</p>
                <Btn onClick={() => setShowCreateEvent(true)}><Plus className="w-3 h-3" />Create First Event</Btn>
              </div>
            ) : (
              <div className="space-y-1">
                {allEvents.map((event) => (
                  <AdminEventCard
                    key={event.id}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onDelete={() => { if (confirm(`Delete "${event.name}"?`)) deleteEventMutation.mutate(event.id); }}
                    onVideoUpload={(videoUrl) => updateEventMutation.mutate({ id: event.id, data: { videoUrl } })}
                  />
                ))}
              </div>
            )}

            {/* Edit Event Dialog */}
            {editingEvent && (
              <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
                <DialogContent className="max-w-lg bg-[#0a0a0a] border-white/15 rounded-none">
                  <DialogHeader>
                    <DialogTitle className="text-white text-lg font-black uppercase tracking-[0.1em]" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>Edit Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {[
                      { label: 'Event Name', key: 'name', placeholder: 'Event name', type: 'text' },
                      { label: 'Date', key: 'date', placeholder: 'e.g., April 18, 2026', type: 'text' },
                      { label: 'Time', key: 'time', placeholder: 'e.g., 10PM', type: 'text' },
                      { label: 'Venue', key: 'venue', placeholder: 'Venue', type: 'text' },
                    ].map(({ label, key, placeholder, type }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input type={type} defaultValue={(editingEvent as any)[key] ?? ''} className={inputCls} placeholder={placeholder}
                          onChange={(e) => setEditingEvent(prev => prev ? { ...prev, [key]: e.target.value } : null)} />
                      </div>
                    ))}
                    <div>
                      <label className={labelCls}>Description</label>
                      <Textarea defaultValue={editingEvent.description ?? ''} className={`${inputCls} resize-none`} rows={3}
                        onChange={(e) => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : null)} />
                    </div>
                    <div className="flex items-center justify-between border border-white/10 p-4">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-[0.15em]">Past Event</p>
                        <p className="text-white/25 text-xs mt-0.5">Has this event already happened?</p>
                      </div>
                      <Switch checked={editingEvent.isPast ?? false} onCheckedChange={(v) => setEditingEvent(prev => prev ? { ...prev, isPast: v } : null)} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Btn variant="secondary" className="flex-1" onClick={() => setEditingEvent(null)}>Cancel</Btn>
                      <Btn className="flex-1" onClick={() => updateEventMutation.mutate({ id: editingEvent.id, data: { name: editingEvent.name, date: editingEvent.date, time: editingEvent.time ?? '', venue: editingEvent.venue ?? '', description: editingEvent.description ?? '', isPast: editingEvent.isPast ?? false } })} disabled={updateEventMutation.isPending}>
                        {updateEventMutation.isPending ? <><Loader2 className="w-3 h-3 animate-spin" />Saving...</> : 'Save Changes'}
                      </Btn>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* ── LEGACY TICKETS ───────────────────────────────────────────────── */}
        {activeTab === 'tickets' && (
          <div>
            <div className="flex items-start justify-between mb-10">
              <SectionHeading label="Archive" title="LEGACY TICKETS" />
              <Btn variant="secondary" onClick={() => setShowQRScanner(!showQRScanner)} data-testid="button-qr-scanner">
                <QrCode className="w-3 h-3" /> {showQRScanner ? "Close Scanner" : "QR Scanner"}
              </Btn>
            </div>

            {showQRScanner && (
              <div className="border border-white/10 p-6 mb-6">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5 flex items-center gap-2"><QrCode className="w-3 h-3" />QR Code Scanner</p>
                <QRScanner onTicketFound={(ticket) => setScannedTicket(ticket)} onClose={() => setShowQRScanner(false)} />
                {scannedTicket && (
                  <div className="mt-5 border border-white/10 p-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3">Scanned Ticket</p>
                    <p className="text-white text-sm font-medium">{scannedTicket.customerName}</p>
                    <p className="text-white/40 text-xs font-mono">{scannedTicket.referenceCode}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <StatusBadge status={scannedTicket.isUsed ? 'used' : 'available'} />
                      {!scannedTicket.isUsed && (
                        <Btn size="sm" variant="green" onClick={() => markUsedMutation.mutate(scannedTicket.id)} disabled={markUsedMutation.isPending}>
                          <CheckCircle className="w-3 h-3" /> Confirm Entry
                        </Btn>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-8">
              <StatBox label="Legacy Tickets" value={legacyTickets.length} />
              <StatBox label="Used" value={legacyTickets.filter(t => t.isUsed).length} />
              <StatBox label="Available" value={legacyTickets.filter(t => !t.isUsed).length} accent />
            </div>

            {/* Create Ticket */}
            <div className="border border-white/10 p-6 mb-8">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Plus className="w-3 h-3" />Create New Ticket</p>
              <Form {...ticketForm}>
                <form onSubmit={ticketForm.handleSubmit((data) => createTicketMutation.mutate(data))} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <FormField control={ticketForm.control} name="eventId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelCls}>Event</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-ticket-event">
                              <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                            {allEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>{event.name} {event.isPast ? '(Past)' : '(Upcoming)'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#c72d28] text-xs" />
                      </FormItem>
                    )} />
                  </div>
                  {[
                    { name: 'referenceCode' as const, label: 'Reference Code', testId: 'input-ref-code', type: 'text' },
                    { name: 'customerName' as const, label: 'Customer Name', testId: 'input-customer-name', type: 'text' },
                    { name: 'customerEmail' as const, label: 'Email (Optional)', testId: 'input-customer-email', type: 'email' },
                    { name: 'customerPhone' as const, label: 'Phone (Optional)', testId: 'input-customer-phone', type: 'text' },
                    { name: 'price' as const, label: 'Price', testId: 'input-price', type: 'text' },
                  ].map(({ name, label, testId, type }) => (
                    <FormField key={name} control={ticketForm.control} name={name} render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelCls}>{label}</FormLabel>
                        <FormControl><input {...field} type={type} className={inputCls} data-testid={testId} /></FormControl>
                        <FormMessage className="text-[#c72d28] text-xs" />
                      </FormItem>
                    )} />
                  ))}
                  <FormField control={ticketForm.control} name="ticketType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelCls}>Ticket Type</FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); if (val === 'Golden VIP') ticketForm.setValue('price', 'Rs 700'); else if (val === 'Early Bird') ticketForm.setValue('price', 'Rs 350'); }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-ticket-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                          <SelectItem value="Early Bird">Early Bird</SelectItem>
                          <SelectItem value="Golden VIP">Golden VIP</SelectItem>
                          <SelectItem value="Phase 1">Phase 1 (Legacy)</SelectItem>
                          <SelectItem value="Phase 2">Phase 2 (Legacy)</SelectItem>
                          <SelectItem value="VIP">VIP (Legacy)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[#c72d28] text-xs" />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
                    <Btn type="submit" disabled={createTicketMutation.isPending} data-testid="button-create-ticket">
                      {createTicketMutation.isPending ? <><Loader2 className="w-3 h-3 animate-spin" />Creating...</> : <><Plus className="w-3 h-3" />Create Ticket</>}
                    </Btn>
                  </div>
                </form>
              </Form>
            </div>

            {/* Ticket List */}
            <div className="border border-white/10">
              <div className="px-6 py-4 border-b border-white/10 flex flex-wrap gap-3 items-center">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mr-4">All Tickets</p>
                <div className="flex-1 min-w-[180px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
                  <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputCls} pl-9 py-2 text-xs`} data-testid="input-search-tickets" />
                </div>
                <Select value={filterEventId} onValueChange={setFilterEventId}>
                  <SelectTrigger className="w-44 bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-filter-event">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                    <SelectItem value="all">All Events</SelectItem>
                    {allEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>{event.name}{event.isPast ? ' (Past)' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v: 'all' | 'used' | 'available') => setFilterStatus(v)}>
                  <SelectTrigger className="w-32 bg-transparent border-white/15 text-white text-xs rounded-none" data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/15 text-white rounded-none">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="divide-y divide-white/5">
                {ticketsLoading ? (
                  <div className="p-8 text-white/20 text-xs uppercase tracking-widest text-center">Loading...</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-10 text-white/20 text-xs uppercase tracking-widest text-center">No tickets found</div>
                ) : filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 ${ticket.isUsed ? 'bg-green-500' : 'bg-[#c72d28]'}`} />
                      <div>
                        <p className="text-white text-sm font-medium">{ticket.customerName}</p>
                        <p className="text-white/30 text-xs font-mono">{ticket.referenceCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-xs mr-2">{ticket.price} · {ticket.ticketType}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="border border-white/15 text-white/40 hover:text-white p-2 transition-colors" data-testid={`button-view-ticket-${ticket.id}`}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/15 rounded-none">
                          <DialogHeader><DialogTitle className="text-white">Ticket — {ticket.referenceCode}</DialogTitle></DialogHeader>
                          <TicketGenerator ticket={ticket} />
                        </DialogContent>
                      </Dialog>
                      {!ticket.isUsed && (
                        <button className="border border-white/15 text-white/40 hover:text-green-400 p-2 transition-colors" onClick={() => markUsedMutation.mutate(ticket.id)} disabled={markUsedMutation.isPending} data-testid={`button-mark-used-${ticket.id}`}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-white/20 hover:text-red-400 p-2 transition-colors" onClick={() => { if (confirm('Delete this ticket?')) deleteTicketMutation.mutate(ticket.id); }} data-testid={`button-delete-ticket-${ticket.id}`}>
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HERO SLIDER ──────────────────────────────────────────────────── */}
        {activeTab === 'hero' && (
          <div>
            <SectionHeading label="Homepage" title="HERO SLIDER" />

            <div className="border border-white/10 p-6 mb-8">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5">Add New Slide</p>
              <div className="flex flex-wrap gap-3">
                <ObjectUploader maxFileSize={100 * 1024 * 1024} allowedFileTypes={["image/*"]}
                  onComplete={(objectPath) => createHeroSlideMutation.mutate({ type: 'image', url: objectPath, order: String(allHeroSlides.length) })}
                  buttonClassName="gap-2"
                >
                  <Image className="w-3 h-3" /> Upload Image
                </ObjectUploader>
                <ObjectUploader maxFileSize={500 * 1024 * 1024} allowedFileTypes={["video/*"]}
                  onComplete={(objectPath) => createHeroSlideMutation.mutate({ type: 'video', url: objectPath, order: String(allHeroSlides.length) })}
                  buttonClassName="gap-2"
                >
                  <Play className="w-3 h-3" /> Upload Video
                </ObjectUploader>
              </div>
            </div>

            <div className="border border-white/10">
              <div className="px-6 py-4 border-b border-white/10">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Current Slides</p>
              </div>
              {heroSlidesLoading ? (
                <div className="p-8 text-white/20 text-xs uppercase tracking-widest text-center">Loading...</div>
              ) : allHeroSlides.length === 0 ? (
                <div className="p-10 text-white/20 text-xs uppercase tracking-widest text-center">No slides yet. Upload your first image or video.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1">
                  {allHeroSlides.sort((a, b) => parseInt(a.order || '0') - parseInt(b.order || '0')).map((slide, index) => (
                    <div key={slide.id} className="relative overflow-hidden bg-[#0a0a0a] group aspect-video" data-testid={`hero-slide-${slide.id}`}>
                      {slide.type === 'video' ? (
                        <video src={slide.url} className="w-full h-full object-cover" muted playsInline
                          onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                      ) : (
                        <img src={slide.url} alt={slide.title || 'Hero slide'} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Btn size="sm" variant="secondary" onClick={() => updateHeroSlideMutation.mutate({ id: slide.id, data: { isActive: !slide.isActive } })} data-testid={`toggle-slide-${slide.id}`}>
                          {slide.isActive ? 'Hide' : 'Show'}
                        </Btn>
                        <Btn size="sm" variant="danger" onClick={() => { if (confirm('Delete this slide?')) deleteHeroSlideMutation.mutate(slide.id); }} data-testid={`delete-slide-${slide.id}`}>
                          <Trash className="w-3 h-3" />
                        </Btn>
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <StatusBadge status={slide.type} />
                        {!slide.isActive && <StatusBadge status="hidden" />}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="border border-white/20 text-white/40 text-[9px] uppercase tracking-[0.15em] px-2 py-0.5">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Event Card ──────────────────────────────────────────────────────────────
function AdminEventCard({ event, onEdit, onDelete, onVideoUpload }: {
  event: EventType;
  onEdit: () => void;
  onDelete: () => void;
  onVideoUpload: (videoUrl: string) => void;
}) {
  return (
    <div className="border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-bold" data-testid={`event-title-${event.id}`}>{event.name}</h3>
                <StatusBadge status={event.isPast ? 'past' : 'upcoming'} />
                {event.videoUrl && <StatusBadge status="video" />}
              </div>
              <div className="flex items-center gap-4 text-white/30 text-xs">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
                {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>}
              </div>
            </div>
          </div>
          {event.description && <p className="text-white/30 text-sm mb-4">{event.description}</p>}
          <div className="flex items-center gap-3">
            <ObjectUploader maxFileSize={500 * 1024 * 1024} allowedFileTypes={["video/*"]} onComplete={onVideoUpload} buttonClassName="gap-1.5">
              <Upload className="w-3 h-3" />
              {event.videoUrl ? "Replace Video" : "Upload Video"}
            </ObjectUploader>
            <div className="ml-auto flex items-center gap-1">
              <button className="border border-white/15 text-white/40 hover:text-white p-2 transition-colors" onClick={onEdit} data-testid={`button-edit-event-${event.id}`}>
                <Edit className="w-4 h-4" />
              </button>
              <button className="text-white/20 hover:text-red-400 p-2 transition-colors" onClick={onDelete} data-testid={`button-delete-event-${event.id}`}>
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {event.videoUrl && (
          <div className="w-56 border-l border-white/10 bg-[#0a0a0a] flex items-center justify-center shrink-0">
            <video src={event.videoUrl} className="w-full h-full object-cover" controls preload="metadata" />
          </div>
        )}
      </div>
    </div>
  );
}

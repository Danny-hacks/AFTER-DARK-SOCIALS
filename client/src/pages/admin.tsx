import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Ticket, LogIn, LogOut, Plus, Users, CheckCircle, Eye, QrCode, 
  Search, Trash, Calendar, Video, Upload, Music, MapPin, Clock,
  LayoutDashboard, PartyPopper, Edit, X, Image, Play, CreditCard,
  Mail, Phone, XCircle, ExternalLink, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { Ticket as TicketType, Event as EventType, HeroSlide as HeroSlideType, TicketPurchase as TicketPurchaseType } from "@shared/schema";
import { TicketGenerator } from "@/components/ticket-generator";
import { QRScanner } from "@/components/qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ObjectUploader } from "@/components/ObjectUploader";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Event creation schema
const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  isPast: z.boolean().default(false),
});

// Ticket creation schema
const ticketSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  referenceCode: z.string().min(1, "Reference code is required").regex(/^AFTR-/, "Reference code must start with 'AFTR-'"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Please enter a valid email address"
  }),
  customerPhone: z.string().optional().refine((val) => !val || /^[\d\s\+\-\(\)]+$/.test(val), {
    message: "Please enter a valid phone number"
  }),
  ticketType: z.string().default("Phase 1"),
  price: z.string().default("Rs 350"),
  paymentMethod: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type EventFormData = z.infer<typeof eventSchema>;
type TicketFormData = z.infer<typeof ticketSchema>;

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<TicketType | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchases' | 'events' | 'tickets' | 'hero'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'available'>('all');
  const [filterEventId, setFilterEventId] = useState<string>('all');
  const [vol2SearchQuery, setVol2SearchQuery] = useState('');
  const [vol2FilterStatus, setVol2FilterStatus] = useState<'all' | 'used' | 'available'>('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  // Purchases sub-tab state
  const [purchasesSubTab, setPurchasesSubTab] = useState<'all' | 'ready' | 'vol2'>('all');
  // Search and filter for All Purchases tab
  const [allPurchasesSearch, setAllPurchasesSearch] = useState('');
  const [allPurchasesFilter, setAllPurchasesFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  // Search and filter for Ready to Deliver tab
  const [readyToDeliverSearch, setReadyToDeliverSearch] = useState('');
  const [readyToDeliverFilter, setReadyToDeliverFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/check');
        const data = await response.json();
        setIsAuthenticated(data?.isAuthenticated || false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Event creation form
  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      isPast: false,
    },
  });

  // Ticket creation form
  const ticketForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      eventId: "",
      referenceCode: "AFTR-",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      ticketType: "Phase 1",
      price: "Rs 350",
      paymentMethod: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return apiRequest('POST', '/api/admin/login', data);
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "You're now logged in to AFTR Brand Manager",
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/logout');
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    },
  });

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading } = useQuery<{events: EventType[]}>({
    queryKey: ['/api/events'],
    enabled: isAuthenticated,
  });

  // Fetch tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery<{tickets: TicketType[]}>({
    queryKey: ['/api/admin/tickets'],
    enabled: isAuthenticated,
  });

  // Fetch hero slides
  const { data: heroSlidesData, isLoading: heroSlidesLoading } = useQuery<{slides: HeroSlideType[]}>({
    queryKey: ['/api/admin/hero-slides'],
    enabled: isAuthenticated,
  });

  // Fetch ticket purchases
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery<{purchases: TicketPurchaseType[]}>({
    queryKey: ['/api/admin/purchases'],
    enabled: isAuthenticated,
  });

  // Process data
  const allEvents: EventType[] = Array.isArray(eventsData?.events) ? eventsData.events : [];
  const allTickets: TicketType[] = Array.isArray(ticketsData?.tickets) ? ticketsData.tickets : [];
  const allHeroSlides: HeroSlideType[] = Array.isArray(heroSlidesData?.slides) ? heroSlidesData.slides : [];
  const allPurchases: TicketPurchaseType[] = Array.isArray(purchasesData?.purchases) ? purchasesData.purchases : [];
  const pendingPurchases = allPurchases.filter(p => p.status === 'pending');
  const pastEvents = allEvents.filter(e => e.isPast);
  const upcomingEvents = allEvents.filter(e => !e.isPast);

  // Vol.2 tickets (those with VOL2- prefix)
  const vol2Tickets = allTickets.filter(t => t.referenceCode.startsWith('VOL2-'));
  const vol2UsedTickets = vol2Tickets.filter(t => t.isUsed);
  const vol2AvailableTickets = vol2Tickets.filter(t => !t.isUsed);
  
  // Filter Vol.2 tickets based on search and status
  const filteredVol2Tickets = vol2Tickets.filter(ticket => {
    const searchLower = vol2SearchQuery.toLowerCase();
    const matchesSearch = vol2SearchQuery === '' || 
      ticket.customerName.toLowerCase().includes(searchLower) ||
      ticket.referenceCode.toLowerCase().includes(searchLower) ||
      (ticket.customerEmail ?? '').toLowerCase().includes(searchLower) ||
      (ticket.customerPhone ?? '').toLowerCase().includes(searchLower);
    
    const matchesStatus = vol2FilterStatus === 'all' ||
      (vol2FilterStatus === 'used' && ticket.isUsed) ||
      (vol2FilterStatus === 'available' && !ticket.isUsed);
    
    return matchesSearch && matchesStatus;
  });

  // Ready to Deliver purchases (verified with ticket)
  const readyToDeliverPurchases = allPurchases.filter(p => p.status === 'verified' && p.ticketId);

  // Filter All Purchases based on search and status
  const filteredAllPurchases = allPurchases.filter(purchase => {
    const searchLower = allPurchasesSearch.toLowerCase();
    const matchesSearch = allPurchasesSearch === '' ||
      purchase.customerName.toLowerCase().includes(searchLower) ||
      (purchase.customerEmail ?? '').toLowerCase().includes(searchLower) ||
      purchase.customerPhone.toLowerCase().includes(searchLower);
    
    const matchesFilter = allPurchasesFilter === 'all' || purchase.status === allPurchasesFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Filter Ready to Deliver based on search and sent status
  const filteredReadyToDeliver = readyToDeliverPurchases.filter(purchase => {
    const ticket = allTickets.find(t => t.id === purchase.ticketId);
    const searchLower = readyToDeliverSearch.toLowerCase();
    const matchesSearch = readyToDeliverSearch === '' ||
      purchase.customerName.toLowerCase().includes(searchLower) ||
      (purchase.customerEmail ?? '').toLowerCase().includes(searchLower) ||
      purchase.customerPhone.toLowerCase().includes(searchLower) ||
      (ticket?.referenceCode ?? '').toLowerCase().includes(searchLower);
    
    const isSent = ticket?.isDelivered ?? false;
    const matchesFilter = readyToDeliverFilter === 'all' ||
      (readyToDeliverFilter === 'sent' && isSent) ||
      (readyToDeliverFilter === 'pending' && !isSent);
    
    return matchesSearch && matchesFilter;
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return apiRequest('POST', '/api/admin/events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      eventForm.reset();
      setShowCreateEvent(false);
      toast({
        title: "Event Created",
        description: "Your new event has been added",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormData & { videoUrl: string }> }) => {
      return apiRequest('PATCH', `/api/admin/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setEditingEvent(null);
      toast({
        title: "Event Updated",
        description: "Changes have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiRequest('DELETE', `/api/admin/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ticket mutations
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      return apiRequest('POST', '/api/admin/tickets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      ticketForm.reset({
        eventId: ticketForm.getValues('eventId'),
        referenceCode: "AFTR-",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        ticketType: "Phase 1",
        price: "Rs 350",
        paymentMethod: "",
      });
      toast({
        title: "Ticket Created",
        description: "New ticket has been added",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markUsedMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest('PATCH', `/api/admin/tickets/${ticketId}/use`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Ticket Marked Used",
        description: "Entry has been confirmed",
      });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest('DELETE', `/api/admin/tickets/${ticketId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Ticket Deleted",
      });
    },
  });

  // Hero slide mutations
  const createHeroSlideMutation = useMutation({
    mutationFn: async (data: { type: string; url: string; title?: string; order?: string }) => {
      return apiRequest('POST', '/api/admin/hero-slides', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
      toast({
        title: "Hero Slide Added",
        description: "Your new slide has been added to the hero section",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Slide",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteHeroSlideMutation = useMutation({
    mutationFn: async (slideId: string) => {
      return apiRequest('DELETE', `/api/admin/hero-slides/${slideId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
      toast({
        title: "Slide Deleted",
      });
    },
  });

  const updateHeroSlideMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HeroSlideType> }) => {
      return apiRequest('PATCH', `/api/admin/hero-slides/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
      toast({
        title: "Slide Updated",
      });
    },
  });

  // Verify purchase mutation
  const verifyPurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      return apiRequest('POST', `/api/admin/purchases/${purchaseId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Purchase Verified!",
        description: "Ticket has been created. Now send it to the customer.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject purchase mutation
  const rejectPurchaseMutation = useMutation({
    mutationFn: async ({ purchaseId, reason }: { purchaseId: string; reason: string }) => {
      return apiRequest('POST', `/api/admin/purchases/${purchaseId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
      toast({
        title: "Purchase Rejected",
      });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send email ticket mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest('POST', `/api/admin/tickets/${ticketId}/send-email`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Email Sent!",
        description: "Ticket has been delivered to the customer's email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark ticket as delivered (for WhatsApp tracking)
  const markDeliveredMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest('PATCH', `/api/admin/tickets/${ticketId}/deliver`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Marked as Sent",
        description: "Ticket delivery has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Legacy tickets (exclude Vol.2 which are managed in Purchases tab)
  const legacyTickets = allTickets.filter(t => !t.referenceCode.startsWith('VOL2-'));

  // Filter legacy tickets
  const filteredTickets = legacyTickets.filter((ticket) => {
    const ticketEventId = (ticket as TicketType & { eventId?: string | null }).eventId;
    const matchesSearch = 
      ticket.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.customerEmail && ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'used' ? ticket.isUsed :
      filterStatus === 'available' ? !ticket.isUsed : true;
    
    const matchesEvent = 
      filterEventId === 'all' ? true : ticketEventId === filterEventId;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  // QR Scanner handler
  const handleQRScan = async (referenceCode: string) => {
    try {
      const response = await apiRequest('GET', `/api/admin/tickets/lookup/${referenceCode}`);
      const data = await response.json();
      if (data.ticket) {
        setScannedTicket(data.ticket);
      }
    } catch (error) {
      toast({
        title: "Ticket Not Found",
        description: "Could not find a ticket with that code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AFTR Brand Manager...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">AFTR Brand Manager</CardTitle>
            <CardDescription>Manage your events, media, and tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" data-testid="input-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AFTR</h1>
            <p className="text-xs text-muted-foreground">Brand Manager</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'purchases'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            data-testid="nav-purchases"
          >
            <CreditCard className="w-4 h-4" />
            Purchases
            {pendingPurchases.length > 0 && (
              <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">{pendingPurchases.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            data-testid="nav-events"
          >
            <PartyPopper className="w-4 h-4" />
            Events
            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">{allEvents.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            data-testid="nav-tickets"
          >
            <Ticket className="w-4 h-4" />
            Legacy Tickets
            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">{legacyTickets.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'hero'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            data-testid="nav-hero"
          >
            <Image className="w-4 h-4" />
            Hero Slider
            <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">{allHeroSlides.length}</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-border">
          <Button 
            onClick={() => logoutMutation.mutate()}
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
              <p className="text-muted-foreground">Overview of your AFTR brand</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-3xl font-bold">{allEvents.length}</p>
                    </div>
                    <PartyPopper className="h-8 w-8 text-primary opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Past Events</p>
                      <p className="text-3xl font-bold">{pastEvents.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tickets</p>
                      <p className="text-3xl font-bold">{allTickets.length}</p>
                    </div>
                    <Ticket className="h-8 w-8 text-primary opacity-80" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Videos Uploaded</p>
                      <p className="text-3xl font-bold">{allEvents.filter(e => e.videoUrl).length}</p>
                    </div>
                    <Video className="h-8 w-8 text-green-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button onClick={() => { setActiveTab('events'); setShowCreateEvent(true); }} data-testid="quick-add-event">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('tickets')} data-testid="quick-view-tickets">
                  <Ticket className="w-4 h-4 mr-2" />
                  View Tickets
                </Button>
                <Button variant="outline" onClick={() => setShowQRScanner(true)} data-testid="quick-scan-qr">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your latest events and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading events...</p>
                ) : allEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <PartyPopper className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No events yet. Create your first event!</p>
                    <Button className="mt-4" onClick={() => { setActiveTab('events'); setShowCreateEvent(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.isPast ? 'bg-muted' : 'bg-primary/10'}`}>
                            <Calendar className={`w-5 h-5 ${event.isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{event.name}</p>
                            <p className="text-sm text-muted-foreground">{event.date} {event.time && `at ${event.time}`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.videoUrl && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${event.isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                            {event.isPast ? 'Past' : 'Upcoming'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Ticket Purchases</h2>
              <p className="text-muted-foreground">Review and verify customer payments</p>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => setPurchasesSubTab('all')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  purchasesSubTab === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                data-testid="purchases-subtab-all"
              >
                All Purchases
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">{allPurchases.length}</span>
              </button>
              <button
                onClick={() => setPurchasesSubTab('ready')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  purchasesSubTab === 'ready'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                data-testid="purchases-subtab-ready"
              >
                Ready to Deliver
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{readyToDeliverPurchases.length}</span>
              </button>
              <button
                onClick={() => setPurchasesSubTab('vol2')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  purchasesSubTab === 'vol2'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                data-testid="purchases-subtab-vol2"
              >
                Vol.2 Tickets
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{vol2Tickets.length}</span>
              </button>
            </div>

            {/* ALL PURCHASES SUB-TAB */}
            {purchasesSubTab === 'all' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-500">{pendingPurchases.length}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-500">{allPurchases.filter(p => p.status === 'verified').length}</div>
                      <div className="text-sm text-muted-foreground">Verified</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-500">{allPurchases.filter(p => p.status === 'rejected').length}</div>
                      <div className="text-sm text-muted-foreground">Rejected</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{allPurchases.length}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={allPurchasesSearch}
                      onChange={(e) => setAllPurchasesSearch(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-all-purchases"
                    />
                  </div>
                  <Select value={allPurchasesFilter} onValueChange={(v: 'all' | 'pending' | 'verified' | 'rejected') => setAllPurchasesFilter(v)}>
                    <SelectTrigger className="w-40" data-testid="select-filter-all-purchases">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Purchases List */}
                <Card>
                  <CardContent className="p-4">
                    {purchasesLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading purchases...</div>
                    ) : filteredAllPurchases.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {allPurchases.length === 0 
                          ? "No purchases yet. Customers can buy tickets from the event page."
                          : "No purchases match your search criteria."}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAllPurchases.map((purchase) => (
                          <div key={purchase.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    purchase.status === 'pending' ? 'bg-orange-500' :
                                    purchase.status === 'verified' ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  <span className="font-semibold">{purchase.customerName}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {purchase.customerPhone}
                                  </span>
                                  {purchase.customerEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" /> {purchase.customerEmail}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{purchase.price}</div>
                                {(purchase.quantity ?? 1) > 1 && (
                                  <div className="text-xs text-muted-foreground">{purchase.quantity} tickets</div>
                                )}
                                <div className={`text-xs px-2 py-0.5 rounded inline-block ${
                                  purchase.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                  purchase.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {purchase.status}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="bg-muted px-2 py-1 rounded">{purchase.paymentMethod}</span>
                              <span className="flex items-center gap-1">
                                {purchase.deliveryMethod === 'whatsapp' ? (
                                  <><SiWhatsapp className="w-3 h-3 text-green-500" /> WhatsApp</>
                                ) : (
                                  <><Mail className="w-3 h-3" /> Email</>
                                )}
                              </span>
                              <span className="text-muted-foreground">
                                {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : ''}
                              </span>
                            </div>

                            {purchase.status === 'pending' && (
                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Button 
                                  onClick={() => verifyPurchaseMutation.mutate(purchase.id)}
                                  disabled={verifyPurchaseMutation.isPending}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  data-testid={`verify-purchase-${purchase.id}`}
                                >
                                  {verifyPurchaseMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Verify & Create {(purchase.quantity ?? 1) > 1 ? `${purchase.quantity} Tickets` : 'Ticket'}
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => rejectPurchaseMutation.mutate({ purchaseId: purchase.id, reason: 'Payment not verified' })}
                                  disabled={rejectPurchaseMutation.isPending}
                                  className="text-red-500 border-red-500 hover:bg-red-500/10"
                                  data-testid={`reject-purchase-${purchase.id}`}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* READY TO DELIVER SUB-TAB */}
            {purchasesSubTab === 'ready' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, phone, or reference..."
                      value={readyToDeliverSearch}
                      onChange={(e) => setReadyToDeliverSearch(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-ready-deliver"
                    />
                  </div>
                  <Select value={readyToDeliverFilter} onValueChange={(v: 'all' | 'pending' | 'sent') => setReadyToDeliverFilter(v)}>
                    <SelectTrigger className="w-40" data-testid="select-filter-ready-deliver">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Not Sent</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ready to Deliver List */}
                <Card>
                  <CardContent className="p-4">
                    {filteredReadyToDeliver.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {readyToDeliverPurchases.length === 0
                          ? "No tickets ready to deliver. Verify purchases first."
                          : "No tickets match your search criteria."}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredReadyToDeliver.map((purchase) => {
                          const ticket = allTickets.find(t => t.id === purchase.ticketId);
                          const isSent = ticket?.isDelivered ?? false;
                          return (
                            <div key={purchase.id} className={`border rounded-lg p-4 ${isSent ? 'bg-green-50/30 border-green-200' : 'bg-orange-50/30 border-orange-200'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold">{purchase.customerName}</div>
                                    {isSent && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Sent
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground font-mono">{ticket?.referenceCode}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {purchase.customerPhone}
                                    {purchase.customerEmail && ` • ${purchase.customerEmail}`}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {purchase.deliveryMethod === 'email' && ticket && (
                                    <Button
                                      onClick={() => sendEmailMutation.mutate(ticket.id)}
                                      disabled={sendEmailMutation.isPending}
                                      size="sm"
                                      className={isSent ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}
                                      data-testid={`send-email-${ticket.id}`}
                                    >
                                      {sendEmailMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      ) : (
                                        <Mail className="w-4 h-4 mr-1" />
                                      )}
                                      {isSent ? 'Resend Email' : 'Send Email'}
                                    </Button>
                                  )}
                                  {purchase.deliveryMethod === 'whatsapp' && ticket && (
                                    <>
                                      {isSent ? (
                                        <Button
                                          onClick={() => {
                                            const whatsappUrl = `https://wa.me/${purchase.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`🎉 Your AFTR Rave Ticket is Ready! 🎉\n\n📧 Customer: ${purchase.customerName}\n🎫 Reference: ${ticket?.referenceCode || ''}\n💰 Price: ${purchase.price}\n📅 Date: January 30, 2026\n📍 Venue: Shotz, Flic en Flac\n🕙 Door opens: 10PM\n\nYour digital ticket PDF will be downloaded automatically.\n\nSee you on the dance floor! 🎵🔥`)}`;
                                            window.open(whatsappUrl, '_blank');
                                          }}
                                          size="sm"
                                          className="bg-gray-500 hover:bg-gray-600"
                                          data-testid={`resend-whatsapp-${purchase.id}`}
                                        >
                                          <SiWhatsapp className="w-4 h-4 mr-1" />
                                          Resend
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() => {
                                            markDeliveredMutation.mutate(ticket.id);
                                            const whatsappUrl = `https://wa.me/${purchase.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`🎉 Your AFTR Rave Ticket is Ready! 🎉\n\n📧 Customer: ${purchase.customerName}\n🎫 Reference: ${ticket?.referenceCode || ''}\n💰 Price: ${purchase.price}\n📅 Date: January 30, 2026\n📍 Venue: Shotz, Flic en Flac\n🕙 Door opens: 10PM\n\nYour digital ticket PDF will be downloaded automatically.\n\nSee you on the dance floor! 🎵🔥`)}`;
                                            window.open(whatsappUrl, '_blank');
                                          }}
                                          disabled={markDeliveredMutation.isPending}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          data-testid={`send-whatsapp-${purchase.id}`}
                                        >
                                          {markDeliveredMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                          ) : (
                                            <SiWhatsapp className="w-4 h-4 mr-1" />
                                          )}
                                          Send WhatsApp
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="ghost" data-testid={`view-ticket-${ticket?.id}`}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Ticket - {ticket?.referenceCode}</DialogTitle>
                                      </DialogHeader>
                                      {ticket && <TicketGenerator ticket={ticket} />}
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* VOL.2 TICKETS SUB-TAB */}
            {purchasesSubTab === 'vol2' && (
              <div className="space-y-6">
                {/* Vol.2 Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Vol.2 Tickets</p>
                          <p className="text-2xl font-bold">{vol2Tickets.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Used</p>
                          <p className="text-2xl font-bold text-green-500">{vol2UsedTickets.length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Available</p>
                          <p className="text-2xl font-bold text-primary">{vol2AvailableTickets.length}</p>
                        </div>
                        <Ticket className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vol.2 Search and Filter */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, phone, or reference..."
                      value={vol2SearchQuery}
                      onChange={(e) => setVol2SearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-vol2-tickets"
                    />
                  </div>
                  <Select value={vol2FilterStatus} onValueChange={(v: 'all' | 'used' | 'available') => setVol2FilterStatus(v)}>
                    <SelectTrigger className="w-40" data-testid="select-filter-vol2-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tickets</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vol.2 Tickets List */}
                <Card>
                  <CardContent className="p-4">
                    {ticketsLoading ? (
                      <p className="text-center py-8 text-muted-foreground">Loading tickets...</p>
                    ) : filteredVol2Tickets.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        {vol2Tickets.length === 0 
                          ? "No Vol.2 tickets yet. Verify purchases to create tickets." 
                          : "No tickets match your search criteria"}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredVol2Tickets.map((ticket) => (
                          <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${ticket.isUsed ? 'bg-green-500' : 'bg-primary'}`} />
                              <div>
                                <p className="font-medium">{ticket.customerName}</p>
                                <p className="text-sm text-muted-foreground font-mono">{ticket.referenceCode}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  {ticket.customerPhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {ticket.customerPhone}
                                    </span>
                                  )}
                                  {ticket.customerEmail && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {ticket.customerEmail}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-2">
                                <span className="text-sm font-medium">{ticket.price}</span>
                                <div className={`text-xs px-2 py-0.5 rounded ${ticket.isUsed ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                  {ticket.isUsed ? 'Used' : 'Available'}
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" data-testid={`button-view-vol2-ticket-${ticket.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Ticket - {ticket.referenceCode}</DialogTitle>
                                  </DialogHeader>
                                  <TicketGenerator ticket={ticket} />
                                </DialogContent>
                              </Dialog>
                              {!ticket.isUsed && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => markUsedMutation.mutate(ticket.id)}
                                  disabled={markUsedMutation.isPending}
                                  data-testid={`button-mark-vol2-used-${ticket.id}`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Delete this ticket?')) {
                                    deleteTicketMutation.mutate(ticket.id);
                                  }
                                }}
                                data-testid={`button-delete-vol2-ticket-${ticket.id}`}
                              >
                                <Trash className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Events</h2>
                <p className="text-muted-foreground">Manage your AFTR events and upload videos</p>
              </div>
              <Button onClick={() => setShowCreateEvent(true)} data-testid="button-create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit((data) => createEventMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={eventForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Summer Rave 2025" data-testid="input-event-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., September 27, 2025" data-testid="input-event-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={eventForm.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 8:00 PM" data-testid="input-event-time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={eventForm.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Secret Location, City" data-testid="input-event-venue" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Describe your event..." rows={3} data-testid="input-event-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={eventForm.control}
                      name="isPast"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <FormLabel>Mark as Past Event</FormLabel>
                            <p className="text-sm text-muted-foreground">Enable if this event has already happened</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-is-past" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateEvent(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1" disabled={createEventMutation.isPending} data-testid="button-submit-event">
                        {createEventMutation.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Events List */}
            {eventsLoading ? (
              <div className="text-center py-12">
                <Music className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : allEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <PartyPopper className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your event history by creating your first event.</p>
                  <Button onClick={() => setShowCreateEvent(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {allEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onEdit={() => setEditingEvent(event)}
                    onDelete={() => {
                      if (confirm(`Delete "${event.name}"? This cannot be undone.`)) {
                        deleteEventMutation.mutate(event.id);
                      }
                    }}
                    onVideoUpload={(videoUrl) => {
                      updateEventMutation.mutate({ id: event.id, data: { videoUrl } });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Legacy Tickets</h2>
                <p className="text-muted-foreground">Tickets from previous editions (Vol.2 tickets are managed in Purchases tab)</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowQRScanner(!showQRScanner)} data-testid="button-qr-scanner">
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRScanner ? "Close Scanner" : "QR Scanner"}
                </Button>
              </div>
            </div>

            {/* QR Scanner */}
            {showQRScanner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QRScanner 
                    onTicketFound={(ticket) => setScannedTicket(ticket)} 
                    onClose={() => setShowQRScanner(false)} 
                  />
                  {scannedTicket && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Scanned Ticket</h4>
                      <p><strong>Reference:</strong> {scannedTicket.referenceCode}</p>
                      <p><strong>Name:</strong> {scannedTicket.customerName}</p>
                      <p><strong>Status:</strong> {scannedTicket.isUsed ? 'Already Used' : 'Valid'}</p>
                      {!scannedTicket.isUsed && (
                        <Button 
                          className="mt-2" 
                          onClick={() => markUsedMutation.mutate(scannedTicket.id)}
                          disabled={markUsedMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Entry
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Legacy Tickets</p>
                      <p className="text-2xl font-bold">{legacyTickets.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Used</p>
                      <p className="text-2xl font-bold">{legacyTickets.filter(t => t.isUsed).length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold">{legacyTickets.filter(t => !t.isUsed).length}</p>
                    </div>
                    <Ticket className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Ticket Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...ticketForm}>
                  <form onSubmit={ticketForm.handleSubmit((data) => createTicketMutation.mutate(data))} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={ticketForm.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-3">
                          <FormLabel>Event</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ticket-event">
                                <SelectValue placeholder="Select an event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allEvents.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.name} {event.isPast ? '(Past)' : '(Upcoming)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="referenceCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Code</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-ref-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-customer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-customer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="ticketType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ticket-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Phase 1">Phase 1</SelectItem>
                              <SelectItem value="Phase 2">Phase 2</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                      <Button type="submit" disabled={createTicketMutation.isPending} data-testid="button-create-ticket">
                        <Plus className="w-4 h-4 mr-2" />
                        {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>All Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-tickets"
                    />
                  </div>
                  <Select value={filterEventId} onValueChange={setFilterEventId}>
                    <SelectTrigger className="w-48" data-testid="select-filter-event">
                      <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      {allEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} {event.isPast ? '(Past)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={(v: 'all' | 'used' | 'available') => setFilterStatus(v)}>
                    <SelectTrigger className="w-40" data-testid="select-filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tickets</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {ticketsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading tickets...</p>
                ) : filteredTickets.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No tickets found</p>
                ) : (
                  <div className="space-y-2">
                    {filteredTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${ticket.isUsed ? 'bg-green-500' : 'bg-primary'}`} />
                          <div>
                            <p className="font-medium">{ticket.customerName}</p>
                            <p className="text-sm text-muted-foreground">{ticket.referenceCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{ticket.price}</span>
                          <span className="text-xs text-muted-foreground">{ticket.ticketType}</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" data-testid={`button-view-ticket-${ticket.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Ticket - {ticket.referenceCode}</DialogTitle>
                              </DialogHeader>
                              <TicketGenerator ticket={ticket} />
                            </DialogContent>
                          </Dialog>
                          {!ticket.isUsed && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markUsedMutation.mutate(ticket.id)}
                              disabled={markUsedMutation.isPending}
                              data-testid={`button-mark-used-${ticket.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Delete this ticket?')) {
                                deleteTicketMutation.mutate(ticket.id);
                              }
                            }}
                            data-testid={`button-delete-ticket-${ticket.id}`}
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hero Slider Tab */}
        {activeTab === 'hero' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Hero Slider</h2>
                <p className="text-muted-foreground">Manage images and videos that appear in the hero section</p>
              </div>
            </div>

            {/* Upload New Slide */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Slide</CardTitle>
                <CardDescription>Upload an image or video to display in the hero section carousel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <ObjectUploader
                    maxFileSize={100 * 1024 * 1024}
                    allowedFileTypes={["image/*"]}
                    onComplete={(objectPath) => {
                      createHeroSlideMutation.mutate({
                        type: 'image',
                        url: objectPath,
                        order: String(allHeroSlides.length),
                      });
                    }}
                    buttonClassName="gap-2"
                  >
                    <Image className="w-4 h-4" />
                    Upload Image
                  </ObjectUploader>
                  <ObjectUploader
                    maxFileSize={500 * 1024 * 1024}
                    allowedFileTypes={["video/*"]}
                    onComplete={(objectPath) => {
                      createHeroSlideMutation.mutate({
                        type: 'video',
                        url: objectPath,
                        order: String(allHeroSlides.length),
                      });
                    }}
                    buttonClassName="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Upload Video
                  </ObjectUploader>
                </div>
              </CardContent>
            </Card>

            {/* Slides List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Slides</CardTitle>
                <CardDescription>Slides are displayed in order on the homepage hero section</CardDescription>
              </CardHeader>
              <CardContent>
                {heroSlidesLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading slides...</p>
                ) : allHeroSlides.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No slides yet. Upload your first image or video!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allHeroSlides
                      .sort((a, b) => parseInt(a.order || '0') - parseInt(b.order || '0'))
                      .map((slide, index) => (
                        <div 
                          key={slide.id} 
                          className="relative border rounded-lg overflow-hidden group"
                          data-testid={`hero-slide-${slide.id}`}
                        >
                          {slide.type === 'video' ? (
                            <video 
                              src={slide.url} 
                              className="w-full h-48 object-cover"
                              muted
                              playsInline
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                          ) : (
                            <img 
                              src={slide.url} 
                              alt={slide.title || 'Hero slide'} 
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateHeroSlideMutation.mutate({ 
                                id: slide.id, 
                                data: { isActive: !slide.isActive } 
                              })}
                              data-testid={`toggle-slide-${slide.id}`}
                            >
                              {slide.isActive ? 'Hide' : 'Show'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Delete this slide?')) {
                                  deleteHeroSlideMutation.mutate(slide.id);
                                }
                              }}
                              data-testid={`delete-slide-${slide.id}`}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className={`text-xs px-2 py-1 rounded ${slide.type === 'video' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                              {slide.type === 'video' ? <Play className="w-3 h-3 inline mr-1" /> : <Image className="w-3 h-3 inline mr-1" />}
                              {slide.type}
                            </span>
                            {!slide.isActive && (
                              <span className="text-xs px-2 py-1 rounded bg-yellow-500 text-white">Hidden</span>
                            )}
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <span className="text-xs px-2 py-1 rounded bg-black/70 text-white">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ 
  event, 
  onEdit, 
  onDelete, 
  onVideoUpload 
}: { 
  event: EventType; 
  onEdit: () => void;
  onDelete: () => void;
  onVideoUpload: (videoUrl: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = (objectPath: string) => {
    onVideoUpload(objectPath);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex">
          {/* Event Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1" data-testid={`event-title-${event.id}`}>{event.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  {event.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                  )}
                  {event.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.venue}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${event.isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                {event.isPast ? 'Past Event' : 'Upcoming'}
              </span>
            </div>

            {event.description && (
              <p className="text-muted-foreground mb-4">{event.description}</p>
            )}

            <div className="flex items-center gap-3">
              <ObjectUploader
                maxFileSize={500 * 1024 * 1024}
                allowedFileTypes={["video/*"]}
                onComplete={handleVideoUpload}
                buttonClassName="gap-2"
              >
                <Upload className="w-4 h-4" />
                {event.videoUrl ? "Replace Video" : "Upload Video"}
              </ObjectUploader>

              {event.videoUrl && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Video uploaded
                </span>
              )}

              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`button-edit-event-${event.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete} data-testid={`button-delete-event-${event.id}`}>
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          {event.videoUrl && (
            <div className="w-64 bg-muted flex items-center justify-center border-l">
              <video 
                src={event.videoUrl} 
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

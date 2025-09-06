import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Ticket, LogIn, LogOut, Plus, Download, Users, CheckCircle, XCircle, Eye, QrCode } from "lucide-react";
import type { Ticket as TicketType } from "@shared/schema";
import { TicketGenerator } from "@/components/ticket-generator";
import { QRScanner } from "@/components/qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Ticket creation schema
const ticketSchema = z.object({
  referenceCode: z.string().min(1, "Reference code is required").regex(/^AFTR-/, "Reference code must start with 'AFTR-'"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email required").optional(),
  customerPhone: z.string().optional(),
  ticketType: z.string().default("Phase 1"),
  price: z.string().default("Rs 350"),
  paymentMethod: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type TicketFormData = z.infer<typeof ticketSchema>;

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<TicketType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/check') as { isAuthenticated: boolean };
        setIsAuthenticated(response.isAuthenticated);
      } catch (error) {
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

  // Ticket creation form
  const ticketForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
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
        title: "Success",
        description: "Logged in successfully",
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
        title: "Success",
        description: "Logged out successfully",
      });
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      return apiRequest('POST', '/api/admin/tickets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      ticketForm.reset({
        referenceCode: "AFTR-",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        ticketType: "Phase 1",
        price: "Rs 350",
        paymentMethod: "",
      });
      toast({
        title: "Success",
        description: "Ticket created successfully",
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

  // Fetch tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/admin/tickets'],
    enabled: isAuthenticated,
  });

  // Mark ticket as used mutation
  const markUsedMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest('PATCH', `/api/admin/tickets/${ticketId}/use`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      toast({
        title: "Success",
        description: "Ticket marked as used",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Mark Ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-8 w-8 animate-spin gradient-text mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 gradient-text">
              <Ticket className="h-6 w-6" />
              AFTR Admin Panel
            </CardTitle>
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
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tickets: TicketType[] = (ticketsData as { tickets?: TicketType[] })?.tickets || [];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Ticket className="h-8 w-8" />
            AFTR Ticket Manager
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowQRScanner(!showQRScanner)}
              variant={showQRScanner ? "default" : "outline"}
              data-testid="button-qr-scanner"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQRScanner ? "Close Scanner" : "QR Scanner"}
            </Button>
            <Button 
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Used Tickets</p>
                  <p className="text-2xl font-bold">{tickets.filter(t => t.isUsed).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Tickets</p>
                  <p className="text-2xl font-bold">{tickets.filter(t => !t.isUsed).length}</p>
                </div>
                <XCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Scanner Section */}
        {showQRScanner && (
          <div className="mb-8">
            <QRScanner
              onTicketFound={(ticket) => {
                setScannedTicket(ticket);
                if (ticket) {
                  setShowQRScanner(false);
                }
              }}
              onClose={() => {
                setShowQRScanner(false);
                setScannedTicket(null);
              }}
            />
          </div>
        )}

        {/* Scanned Ticket Display */}
        {scannedTicket && (
          <Card className="mb-8 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Scanned Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-mono font-bold">{scannedTicket.referenceCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{scannedTicket.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-semibold">{scannedTicket.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {scannedTicket.isUsed ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Used
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Valid
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-view-scanned-ticket">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Ticket Details - {scannedTicket.referenceCode}</DialogTitle>
                    </DialogHeader>
                    <TicketGenerator ticket={scannedTicket} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScannedTicket(null)}
                  data-testid="button-clear-scanned-ticket"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <form onSubmit={ticketForm.handleSubmit((data) => createTicketMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={ticketForm.control}
                    name="referenceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="AFTR-JOHN" data-testid="input-reference-code" />
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
                          <Input {...field} placeholder="John Doe" data-testid="input-customer-name" />
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
                          <Input {...field} type="email" placeholder="john@example.com" data-testid="input-customer-email" />
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
                          <Input {...field} placeholder="58205220" data-testid="input-customer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ticketForm.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MCB Bank">MCB Bank</SelectItem>
                            <SelectItem value="Juice Mobile">Juice Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createTicketMutation.isPending}
                    data-testid="button-create-ticket"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ticketsLoading ? (
                  <p className="text-muted-foreground">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                  <p className="text-muted-foreground">No tickets created yet.</p>
                ) : (
                  tickets.slice(0, 10).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`ticket-item-${ticket.id}`}>
                      <div>
                        <p className="font-medium">{ticket.referenceCode}</p>
                        <p className="text-sm text-muted-foreground">{ticket.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              data-testid={`button-view-ticket-${ticket.id}`}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Digital Ticket - {ticket.referenceCode}</DialogTitle>
                            </DialogHeader>
                            <TicketGenerator ticket={ticket} />
                          </DialogContent>
                        </Dialog>
                        {ticket.isUsed ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Used</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markUsedMutation.mutate(ticket.id)}
                            disabled={markUsedMutation.isPending}
                            data-testid={`button-mark-used-${ticket.id}`}
                          >
                            Mark Used
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
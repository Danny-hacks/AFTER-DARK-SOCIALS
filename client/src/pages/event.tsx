import { Calendar, MapPin, Clock, Users, CheckCircle, ArrowLeft, Music, Sparkles, Volume2, Navigation, Menu, X, Camera, Video, CreditCard, Ticket, Crown, Check, Loader2, Mail, Phone, User } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import comingSoonImage from "@assets/AFTR_black_white_1766249732057.jpg";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

const eventNavLinks = [
  { name: "Details", href: "#details" },
  { name: "Tickets", href: "#tickets" },
  { name: "Venue", href: "#venue" },
];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 sm:gap-8" data-testid="countdown-timer">
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-days">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-hours">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-minutes">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Mins</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-seconds">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Secs</span>
      </div>
    </div>
  );
}

function TicketPurchaseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    countryCode: '+230',
    customerPhone: '',
    paymentMethod: 'MCB Bank',
    deliveryMethod: 'email',
    quantity: 1,
  });
  const [step, setStep] = useState(1);

  const purchaseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/tickets/purchase', {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: `${data.countryCode}${data.customerPhone}`,
        paymentMethod: data.paymentMethod,
        deliveryMethod: data.deliveryMethod,
        quantity: data.quantity,
        eventId: 'aftr-vol-2',
        ticketType: 'Early Bird',
        price: 'Rs 350',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Request Submitted!",
        description: "Please complete payment and send proof via WhatsApp. Your ticket will be sent within 24 hours after verification.",
      });
      setStep(3);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit purchase request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.customerName || !formData.customerPhone) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      if (formData.deliveryMethod === 'email' && !formData.customerEmail) {
        toast({ title: "Error", description: "Email is required for email delivery", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      purchaseMutation.mutate(formData);
    }
  };

  const resetAndClose = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      countryCode: '+230',
      customerPhone: '',
      paymentMethod: 'MCB Bank',
      deliveryMethod: 'email',
      quantity: 1,
    });
    setStep(1);
    onClose();
  };

  const fullPhoneNumber = `${formData.countryCode}${formData.customerPhone}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={resetAndClose}>
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Buy Ticket</h2>
            <button onClick={resetAndClose} className="text-muted-foreground hover:text-white" data-testid="close-purchase-modal">
              <X className="w-6 h-6" />
            </button>
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">AFTR Early Bird</span>
                  <span className="text-primary font-bold text-xl">Rs 350</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="Enter your full name"
                    required
                    data-testid="input-customer-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="bg-background border border-border rounded-lg py-3 px-3 text-white focus:outline-none focus:border-primary w-[110px]"
                    data-testid="select-country-code"
                  >
                    <option value="+230">+230 MU</option>
                    <option value="+33">+33 FR</option>
                    <option value="+44">+44 UK</option>
                    <option value="+1">+1 US</option>
                    <option value="+27">+27 ZA</option>
                    <option value="+91">+91 IN</option>
                    <option value="+86">+86 CN</option>
                    <option value="+61">+61 AU</option>
                    <option value="+971">+971 AE</option>
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value.replace(/\D/g, '') }))}
                      className="w-full bg-background border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                      placeholder="58205220"
                      required
                      data-testid="input-customer-phone"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email {formData.deliveryMethod === 'email' ? '*' : '(optional)'}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="your@email.com"
                    required={formData.deliveryMethod === 'email'}
                    data-testid="input-customer-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['MCB Bank', 'Juice', 'Cash'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.paymentMethod === method
                          ? 'bg-primary text-white'
                          : 'bg-background border border-border text-muted-foreground hover:border-primary'
                      }`}
                      data-testid={`payment-method-${method.toLowerCase().replace(' ', '-')}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ticket Delivery</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'email' }))}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.deliveryMethod === 'email'
                        ? 'bg-primary text-white'
                        : 'bg-background border border-border text-muted-foreground hover:border-primary'
                    }`}
                    data-testid="delivery-email"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'whatsapp' }))}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.deliveryMethod === 'whatsapp'
                        ? 'bg-[#25D366] text-white'
                        : 'bg-background border border-border text-muted-foreground hover:border-[#25D366]'
                    }`}
                    data-testid="delivery-whatsapp"
                  >
                    <SiWhatsapp className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full gradient-bg text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity mt-6"
                data-testid="continue-to-payment"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-muted rounded-xl p-4">
                <h3 className="font-bold text-white mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-white">{formData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-white">{fullPhoneNumber}</span>
                  </div>
                  {formData.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-white">{formData.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="text-white">{formData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery:</span>
                    <span className="text-white capitalize">{formData.deliveryMethod}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-primary">Rs 350</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-bold text-white mb-3">Payment Details</h4>
                {formData.paymentMethod === 'MCB Bank' && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Bank Account:</div>
                    <div className="font-mono text-lg font-bold text-primary bg-background p-3 rounded-lg">000453915337</div>
                    <div className="text-xs text-muted-foreground">MCB - AFTR Account</div>
                  </div>
                )}
                {formData.paymentMethod === 'Juice' && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Juice Number:</div>
                    <div className="font-mono text-lg font-bold text-primary bg-background p-3 rounded-lg">58205220</div>
                  </div>
                )}
                {formData.paymentMethod === 'Cash' && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Contact for Cash Pickup:</div>
                    <div className="font-mono text-lg font-bold text-primary bg-background p-3 rounded-lg">58205220</div>
                  </div>
                )}
                <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="text-sm text-primary font-medium">Reference: AFTR-2-{formData.customerName.toUpperCase().replace(/\s+/g, '-')}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-background border border-border text-white font-semibold py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={purchaseMutation.isPending}
                  className="flex-1 gradient-bg text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="confirm-purchase"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Purchase'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Purchase Request Submitted!</h3>
                <p className="text-muted-foreground">
                  Please complete your payment and send proof via WhatsApp. Your ticket will be sent within 24 hours after we verify your payment.
                </p>
              </div>
              
              <a
                href={`https://wa.me/23058205220?text=${encodeURIComponent(`Hi! I just submitted a purchase for AFTR Volume 2.\n\nName: ${formData.customerName}\nPhone: ${fullPhoneNumber}\nPayment Method: ${formData.paymentMethod}\n\nI will send my payment proof now.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#1da851] transition-colors w-full"
                data-testid="send-whatsapp-proof"
              >
                <SiWhatsapp className="w-5 h-5" />
                Send Payment Proof via WhatsApp
              </a>

              <button
                onClick={resetAndClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventPage() {
  const eventDate = new Date('2026-01-30T22:00:00+04:00');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/70 backdrop-blur-sm' : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src={logoImage} alt="After Dark Socials" className="h-14 sm:h-16 w-auto" />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm uppercase tracking-wider font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              {eventNavLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-white/80 hover:text-white transition-colors text-sm uppercase tracking-wider font-medium relative py-1"
                  data-testid={`nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </button>
              ))}
              <a 
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-[#c72d28] text-white text-sm uppercase tracking-wider font-medium rounded-full hover:bg-[#a82421] transition-colors"
              >
                Join Us
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10 py-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wider"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              {eventNavLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wider"
                  data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </button>
              ))}
              <a 
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
                target="_blank"
                rel="noopener noreferrer"
                className="block mx-4 mt-4 px-5 py-3 bg-[#c72d28] text-white text-sm uppercase tracking-wider font-medium rounded-full text-center hover:bg-[#a82421] transition-colors"
              >
                Join Us
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative h-[60vh] sm:h-[70vh]">
          <img 
            src={comingSoonImage} 
            alt="AFTR Volume 2" 
            className="w-full h-full object-cover"
            data-testid="event-hero-image"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <span className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm font-bold mb-6" data-testid="event-badge">
                30 JANUARY 2026
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black gradient-text mb-4" data-testid="event-title">
                AFTR Volume 2
              </h1>
              <p className="text-xl sm:text-2xl text-white/80 mb-8">The Rave That Keeps The City Awake</p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Countdown to the Rave</h2>
          <CountdownTimer targetDate={eventDate} />
        </div>
      </section>

      {/* Event Details */}
      <section id="details" className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-12" data-testid="event-details-title">
            Event Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-date-card">
              <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Date</h3>
              <p className="text-muted-foreground">Friday, 30th January 2026</p>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-time-card">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Time</h3>
              <p className="text-muted-foreground">10PM - 4AM</p>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-venue-card">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Venue</h3>
              <p className="text-muted-foreground">Shotz, Flic en Flac</p>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-duration-card">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Duration</h3>
              <p className="text-muted-foreground">6 Hours Non-Stop</p>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8" data-testid="event-description">
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              The rave returns — bigger, louder, unstoppable. AFTR Volume 2 promises to be an unforgettable night 
              of music and energy, bringing together the best DJs for 6 hours of non-stop vibes. 
              Get ready for the next edition of the rave that keeps the city awake.
            </p>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-12" data-testid="expect-title">
            What to Expect
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Music className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Top DJs</h3>
                <p className="text-muted-foreground">World-class DJs performing back-to-back sets all night long</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Volume2 className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Premium Sound</h3>
                <p className="text-muted-foreground">State-of-the-art sound system for crystal clear audio</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Sparkles className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Epic Lighting</h3>
                <p className="text-muted-foreground">Immersive lighting effects and visual production</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Camera className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Photo Booth</h3>
                <p className="text-muted-foreground">Capture the moment with our professional photo booth</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Video className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">360° Video Booth</h3>
                <p className="text-muted-foreground">Get immersive 360-degree videos to share with friends</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Safe Environment</h3>
                <p className="text-muted-foreground">Professional security and organized event management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section id="tickets" className="py-20 bg-gradient-to-br from-card via-background to-card relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="tickets-title">
            Get Your Digital Tickets
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Secure your spot at AFTR Volume 2 - The rave that keeps the city awake!
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Phase 1 */}
            <div className="bg-card border-2 border-primary rounded-2xl p-8 transition-all hover:scale-105 relative overflow-hidden" data-testid="phase-1-ticket">
              <div className="absolute top-0 right-0 px-3 py-1 text-sm font-bold bg-primary text-white">
                EARLY BIRD - ACTIVE
              </div>
              <div className="text-center mb-6">
                <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-black gradient-text tracking-wider uppercase">AFTR Early Bird</h3>
                <p className="text-muted-foreground">Phase 1 Pricing</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-black gradient-text">Rs 350</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>6 hours of non-stop energy</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>Top DJs lineup</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>Photo Booth & 360° Video</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>Bar & refreshments available</span>
                </li>
              </ul>
              <div className="text-center">
                <button 
                  onClick={() => setPurchaseModalOpen(true)}
                  className="w-full gradient-bg text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity mb-3"
                  data-testid="buy-early-bird-btn"
                >
                  Buy Now
                </button>
                <div className="text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-lg">
                  5th Jan - 25th Jan 2026
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 transition-all hover:scale-105 relative overflow-hidden opacity-80" data-testid="phase-2-ticket">
              <div className="absolute top-0 right-0 px-3 py-1 text-sm font-bold bg-muted text-muted-foreground">
                PHASE 2 - COMING SOON
              </div>
              <div className="text-center mb-6">
                <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-black gradient-text tracking-wider uppercase">AFTR Standard</h3>
                <p className="text-muted-foreground">Phase 2 Pricing</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-black gradient-text">Coming Soon</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>6 hours of non-stop energy</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>Top DJs lineup</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>Photo Booth & 360° Video</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-primary w-5 h-5 flex-shrink-0" />
                  <span>Bar & refreshments available</span>
                </li>
              </ul>
              <div className="text-center">
                <div className="text-sm text-muted-foreground font-semibold bg-muted/50 px-4 py-2 rounded-lg">
                  26th Jan - 30th Jan 2026
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div id="payment-instructions" className="bg-muted rounded-2xl p-8 border-l-4 border-primary text-left mb-8" data-testid="payment-instructions">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CreditCard className="mr-3 text-primary" />
              How to Purchase Your Ticket
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Payment Account Details</h4>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Bank Transfer</label>
                      <div className="text-xl font-mono font-bold text-white bg-background px-4 py-2 rounded mt-1">
                        000453915337
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">MCB - AFTR Account</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Juice Mobile</label>
                      <div className="text-xl font-mono font-bold text-white bg-background px-4 py-2 rounded mt-1">
                        58205220
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Use reference: AFTR-2-[YOUR NAME]</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Cash Payment</label>
                      <div className="text-xl font-mono font-bold text-white bg-background px-4 py-2 rounded mt-1">
                        58205220
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Text or call with your location for cash pickup</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Simple 3-Step Process</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                    <div>
                      <div className="font-semibold text-white">Send Payment</div>
                      <div className="text-sm text-muted-foreground">Transfer the ticket amount with reference AFTR-2-[YOUR NAME]</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                    <div>
                      <div className="font-semibold text-white">Send Proof</div>
                      <div className="text-sm text-muted-foreground">WhatsApp your receipt to 58205220 with name & email</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                    <div>
                      <div className="font-semibold text-white">Receive Ticket</div>
                      <div className="text-sm text-muted-foreground">Get your digital ticket within 24 hours</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/23058205220?text=Hi!%20I'd%20like%20to%20purchase%20tickets%20for%20AFTR%20Volume%202%20on%20January%2030th.%20I%20have%20sent%20the%20payment%20and%20will%20share%20the%20proof%20now."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-colors"
                data-testid="whatsapp-payment-button"
              >
                <SiWhatsapp className="text-xl mr-3" />
                WhatsApp Payment Proof
              </a>
              <a 
                href="mailto:afterdarksocials@gmail.com?subject=AFTR%20Volume%202%20-%20Payment%20Proof&body=Hi%2C%0A%0AI%20have%20made%20payment%20for%20AFTR%20Volume%202%20tickets.%20Please%20find%20the%20payment%20proof%20attached.%0A%0AFull%20Name%3A%20%0AEmail%3A%20%0ANumber%20of%20Tickets%3A%20%0A%0AThank%20you!"
                className="flex-1 border border-border bg-card text-white hover:bg-muted font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-colors"
                data-testid="email-payment-button"
              >
                <CreditCard className="text-xl mr-3" />
                Email Payment Proof
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section id="venue" className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-12" data-testid="venue-title">
            Venue
          </h2>
          
          <div className="bg-muted rounded-xl overflow-hidden">
            {/* Google Map Embed */}
            <div className="w-full h-64 sm:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.8!2d57.36539!3d-20.28325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDE2JzU5LjciUyA1N8KwMjEnNTUuNCJF!5e0!3m2!1sen!2smu!4v1600000000000!5m2!1sen!2smu"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shotz Flic en Flac Location"
                data-testid="venue-map"
              />
            </div>
            
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Shotz</h3>
              <p className="text-lg text-muted-foreground mb-4">Flic en Flac, Mauritius</p>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Located in the heart of Flic en Flac, Shotz provides the perfect setting for an epic night of music and dancing. 
                Easy to find and accessible from all parts of the island.
              </p>
              
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=-20.28325,57.36539&destination_place_id=Shotz+Flic+en+Flac"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
                data-testid="get-directions-button"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img src={logoImage} alt="After Dark Socials" className="h-20 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            &copy; 2026 AFTR. All rights reserved. The rave that keeps the city awake.
          </p>
        </div>
      </footer>

      {/* Purchase Modal */}
      <TicketPurchaseModal 
        isOpen={purchaseModalOpen} 
        onClose={() => setPurchaseModalOpen(false)} 
      />
    </div>
  );
}

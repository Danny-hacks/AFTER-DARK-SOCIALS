import { Calendar, MapPin, Clock, Users, CheckCircle, ArrowLeft, Music, Sparkles, Volume2, Navigation, Menu, X, Camera, Video, CreditCard, Ticket, Crown, Check, Loader2, Mail, Phone, User } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

const eventNavLinks = [
  { name: "Details", href: "#details" },
  { name: "Tickets", href: "#tickets" },
  { name: "Venue", href: "#venue" },
];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const calculate = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    };
    calculate();
    timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-6" data-testid="countdown-timer">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="border border-white/20 px-4 sm:px-7 py-4 sm:py-6 min-w-[64px] sm:min-w-[96px] text-center">
            <span
              className="text-4xl sm:text-6xl font-black text-white block leading-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              data-testid={`countdown-${label.toLowerCase()}`}
            >
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] text-white/30 uppercase tracking-[0.25em] mt-2">{label}</span>
        </div>
      ))}
    </div>
  );
}

function TicketPurchaseModal({ isOpen, onClose, ticketType = 'Early Bird' }: { isOpen: boolean; onClose: () => void; ticketType?: 'Early Bird' | 'Golden VIP' }) {
  const { toast } = useToast();
  const isGoldenVIP = ticketType === 'Golden VIP';
  const pricePerTicket = isGoldenVIP ? 700 : 350;
  const gold = '#C9A84C';
  const accentColor = isGoldenVIP ? gold : '#c72d28';

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    countryCode: '+230',
    customerPhone: '',
    paymentMethod: 'MCB Bank',
    deliveryMethod: 'whatsapp',
    quantity: 1,
  });
  const [step, setStep] = useState(1);

  const purchaseMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const totalPrice = pricePerTicket * data.quantity;
      const response = await apiRequest('POST', '/api/tickets/purchase', {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: `${data.countryCode}${data.customerPhone}`,
        paymentMethod: data.paymentMethod,
        deliveryMethod: data.deliveryMethod,
        quantity: data.quantity,
        eventId: 'aftr-vol-3',
        ticketType: ticketType,
        price: `Rs ${totalPrice}`,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Request Submitted!",
        description: "Please complete payment and send proof via WhatsApp. Your ticket will be sent within 24 hours.",
      });
      setStep(3);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.customerName || !formData.customerPhone) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      purchaseMutation.mutate(formData);
    }
  };

  const resetAndClose = () => {
    setFormData({ customerName: '', customerEmail: '', countryCode: '+230', customerPhone: '', paymentMethod: 'MCB Bank', deliveryMethod: 'whatsapp', quantity: 1 });
    setStep(1);
    onClose();
  };

  const accentStyle = { color: accentColor };
  const accentBorder = { borderColor: accentColor };
  const accentBg = { backgroundColor: accentColor };

  const fullPhoneNumber = `${formData.countryCode}${formData.customerPhone}`;

  if (!isOpen) return null;

  const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";
  const labelCls = "block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={resetAndClose}>
      <div className="bg-[#0a0a0a] border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          {/* Modal header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={accentStyle}>Vol. 3 — Full Capacity</p>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                {step === 3 ? "ORDER CONFIRMED" : isGoldenVIP ? "GET GOLDEN VIP" : "BUY TICKET"}
              </h2>
            </div>
            <button onClick={resetAndClose} className="text-white/30 hover:text-white transition-colors" data-testid="close-purchase-modal">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border transition-colors ${step >= s ? 'text-white' : 'border-white/20 text-white/30'}`}
                    style={step >= s ? { ...accentBorder, ...accentBg } : {}}>
                    {s}
                  </div>
                  {s < 2 && <div className="flex-1 h-px w-8" style={{ backgroundColor: step > s ? accentColor : 'rgba(255,255,255,0.15)' }} />}
                </div>
              ))}
              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] ml-2">
                {step === 1 ? 'Your details' : 'Payment'}
              </span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Ticket summary */}
              <div className="border p-4 mb-6" style={accentBorder}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/50 uppercase tracking-[0.15em]">
                    {isGoldenVIP ? 'AFTR Golden VIP' : 'AFTR Early Bird'}
                  </span>
                  <span className="font-bold" style={accentStyle}>Rs {pricePerTicket} each</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-xs text-white/30 uppercase tracking-[0.15em]">Quantity</span>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-7 h-7 border border-white/20 flex items-center justify-center text-white transition-colors hover:text-white" style={{ '--hover-border': accentColor } as any} onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')} data-testid="btn-decrease-quantity">−</button>
                    <span className="text-white font-bold w-4 text-center" data-testid="quantity-display">{formData.quantity}</span>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, quantity: Math.min(10, prev.quantity + 1) }))} className="w-7 h-7 border border-white/20 flex items-center justify-center text-white transition-colors" onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')} data-testid="btn-increase-quantity">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-white/30 uppercase tracking-[0.15em]">Total</span>
                  <span className="font-bold text-xl" style={accentStyle} data-testid="total-price">Rs {pricePerTicket * formData.quantity}</span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={formData.customerName} onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))} className={inputCls} placeholder="Enter your full name" required data-testid="input-customer-name" />
              </div>

              <div>
                <label className={labelCls}>Phone Number *</label>
                <div className="flex gap-2">
                  <select value={formData.countryCode} onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))} className="bg-transparent border border-white/15 text-white text-sm py-3 px-3 focus:outline-none focus:border-white/40 w-[130px]" data-testid="select-country-code">
                    <optgroup label="── Default ──">
                      <option value="+230">+230 Mauritius</option>
                    </optgroup>
                    <optgroup label="── Africa ──">
                      <option value="+213">+213 Algeria</option>
                      <option value="+267">+267 Botswana</option>
                      <option value="+237">+237 Cameroon</option>
                      <option value="+269">+269 Comoros</option>
                      <option value="+20">+20 Egypt</option>
                      <option value="+251">+251 Ethiopia</option>
                      <option value="+233">+233 Ghana</option>
                      <option value="+254">+254 Kenya</option>
                      <option value="+261">+261 Madagascar</option>
                      <option value="+212">+212 Morocco</option>
                      <option value="+258">+258 Mozambique</option>
                      <option value="+234">+234 Nigeria</option>
                      <option value="+262">+262 Réunion</option>
                      <option value="+250">+250 Rwanda</option>
                      <option value="+248">+248 Seychelles</option>
                      <option value="+27">+27 South Africa</option>
                      <option value="+255">+255 Tanzania</option>
                      <option value="+256">+256 Uganda</option>
                      <option value="+260">+260 Zambia</option>
                      <option value="+263">+263 Zimbabwe</option>
                    </optgroup>
                    <optgroup label="── Other ──">
                      <option value="+61">+61 Australia</option>
                      <option value="+33">+33 France</option>
                      <option value="+49">+49 Germany</option>
                      <option value="+91">+91 India</option>
                      <option value="+39">+39 Italy</option>
                      <option value="+41">+41 Switzerland</option>
                      <option value="+971">+971 UAE</option>
                      <option value="+44">+44 UK</option>
                    </optgroup>
                  </select>
                  <input type="tel" value={formData.customerPhone} onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value.replace(/\D/g, '') }))} className={`flex-1 ${inputCls}`} placeholder="58205220" required data-testid="input-customer-phone" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email (optional)</label>
                <input type="email" value={formData.customerEmail} onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))} className={inputCls} placeholder="your@email.com" data-testid="input-customer-email" />
              </div>

              <div>
                <label className={labelCls}>Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['MCB Bank', 'Juice', 'Cash'].map((method) => (
                    <button key={method} type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                      className={`py-3 text-xs uppercase tracking-[0.1em] font-bold border transition-colors ${formData.paymentMethod === method ? 'text-white' : 'border-white/15 text-white/40 hover:border-white/40'}`}
                      style={formData.paymentMethod === method ? { ...accentBorder, ...accentBg } : {}}
                      data-testid={`payment-method-${method.toLowerCase().replace(' ', '-')}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-[#25D366]/30 p-4 flex items-center gap-3">
                <SiWhatsapp className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                <span className="text-white/60 text-xs">Your ticket will be delivered via WhatsApp</span>
              </div>

              <button type="submit" className="w-full text-xs uppercase tracking-[0.2em] font-bold py-4 transition-colors mt-2 text-white"
                style={accentBg}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                data-testid="continue-to-payment">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Order summary */}
              <div className="border border-white/10 p-5">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">Order Summary</p>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Name', value: formData.customerName },
                    { label: 'Phone', value: fullPhoneNumber },
                    ...(formData.customerEmail ? [{ label: 'Email', value: formData.customerEmail }] : []),
                    { label: 'Payment', value: formData.paymentMethod },
                    { label: 'Qty', value: `${formData.quantity} ticket${formData.quantity > 1 ? 's' : ''}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-white/30">{label}</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
                    <span className="text-white/50 text-xs uppercase tracking-[0.15em]">Total</span>
                    <span className="text-lg" style={accentStyle}>Rs {pricePerTicket * formData.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Payment details */}
              <div className="border border-white/10 p-5">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">Send Payment To</p>
                {formData.paymentMethod === 'MCB Bank' && (
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-2">MCB Bank Account</div>
                    <div className="font-mono text-2xl font-black text-white tracking-widest">000453915337</div>
                    <div className="text-[10px] text-white/20 mt-1">MCB — AFTR Account</div>
                  </div>
                )}
                {formData.paymentMethod === 'Juice' && (
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-2">Juice Mobile</div>
                    <div className="font-mono text-2xl font-black text-white tracking-widest">58205220</div>
                  </div>
                )}
                {formData.paymentMethod === 'Cash' && (
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-2">Contact for Cash Pickup</div>
                    <div className="font-mono text-2xl font-black text-white tracking-widest">58205220</div>
                  </div>
                )}
                <div className="mt-4 border border-[#c72d28]/30 p-3">
                  <div className="text-[10px] text-[#c72d28] uppercase tracking-[0.15em]">Reference: AFTR-3-{formData.customerName.toUpperCase().replace(/\s+/g, '-')}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-white/15 text-white/60 text-xs uppercase tracking-[0.15em] font-bold py-4 hover:border-white/40 hover:text-white transition-colors">
                  Back
                </button>
                <button type="button" onClick={handleSubmit} disabled={purchaseMutation.isPending}
                  className="flex-1 text-white text-xs uppercase tracking-[0.15em] font-bold py-4 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={accentBg}
                  data-testid="confirm-purchase"
                >
                  {purchaseMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 py-4">
              <div className="w-16 h-16 border border-[#25D366] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>REQUEST SUBMITTED</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Complete your payment and send proof via WhatsApp. Your ticket will be sent within 24 hours after verification.
                </p>
              </div>
              <a
                href={`https://wa.me/23058205220?text=${encodeURIComponent(`Hi! I just submitted a purchase for AFTR Vol. 3: Full Capacity.\n\nName: ${formData.customerName}\nPhone: ${fullPhoneNumber}\nPayment Method: ${formData.paymentMethod}\n\nSending payment proof now.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white text-xs uppercase tracking-[0.2em] font-bold py-4 px-6 hover:bg-[#1da851] transition-colors w-full"
                data-testid="send-whatsapp-proof"
              >
                <SiWhatsapp className="w-4 h-4" />
                Send Payment Proof via WhatsApp
              </a>
              <button onClick={resetAndClose} className="text-white/30 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">
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
  const eventDate = new Date('2026-04-18T22:00:00+04:00');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<'Early Bird' | 'Golden VIP'>('Early Bird');
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const openModal = (type: 'Early Bird' | 'Golden VIP' = 'Early Bird') => {
    setSelectedTicketType(type);
    setPurchaseModalOpen(true);
  };


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <TicketPurchaseModal isOpen={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} ticketType={selectedTicketType} />

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <img src={logoImage} alt="After Dark Socials" className="h-12 w-auto" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[11px] uppercase tracking-[0.2em]">
                <ArrowLeft className="w-3 h-3" />
                Home
              </Link>
              {eventNavLinks.map((link) => (
                <button key={link.name} onClick={() => scrollToSection(link.href)}
                  className="text-white/40 hover:text-white transition-colors text-[11px] uppercase tracking-[0.2em]"
                  data-testid={`nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => openModal('Early Bird')}
                className="bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 hover:bg-[#a82421] transition-colors"
              >
                Buy Tickets
              </button>
            </nav>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white" data-testid="mobile-menu-toggle">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black border-t border-white/10 py-4">
              <Link href="/" className="flex items-center gap-3 px-0 py-3 text-white/40 hover:text-white transition-colors text-[11px] uppercase tracking-[0.2em]" onClick={() => setMobileMenuOpen(false)}>
                <ArrowLeft className="w-3 h-3" />
                Back to Home
              </Link>
              {eventNavLinks.map((link) => (
                <button key={link.name} onClick={() => scrollToSection(link.href)}
                  className="block w-full text-left py-3 text-white/40 hover:text-white transition-colors text-[11px] uppercase tracking-[0.2em]"
                  data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => { openModal('Early Bird'); setMobileMenuOpen(false); }}
                className="mt-4 w-full bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#a82421] transition-colors"
              >
                Buy Tickets
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] bg-black">
        <div className="h-full flex flex-col justify-end pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="section-line" />
              <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">18 April 2026 — Shotz, Flic en Flac</span>
            </div>
            <h1
              className="text-[clamp(4rem,15vw,10rem)] font-black text-white leading-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              data-testid="event-title"
            >
              AFTR<br />VOL. 3
            </h1>
            <p className="text-white/50 text-sm uppercase tracking-[0.4em] mt-3 mb-8" data-testid="event-subtitle">Full Capacity</p>
            <button
              onClick={() => openModal('Early Bird')}
              className="inline-flex items-center gap-4 bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#a82421] transition-colors"
              data-testid="hero-buy-tickets"
            >
              Buy Tickets
              <span className="w-6 h-px bg-white/60" />
            </button>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="bg-black border-b border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className="section-line" />
            <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">Countdown</span>
            <span className="section-line" />
          </div>
          <p
            className="text-3xl sm:text-5xl font-black text-white mb-10"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          >
            THE NIGHT BEGINS IN
          </p>
          <CountdownTimer targetDate={eventDate} />
        </div>
      </section>

      {/* Event Details */}
      <section id="details" className="bg-black py-24 sm:py-32 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <span className="section-line" />
            <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">Event Details</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2
                className="text-6xl sm:text-8xl font-black text-white leading-none mb-8"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                data-testid="event-details-title"
              >
                THE<br />BIGGEST<br />NIGHT.
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                AFTR Vol. 3: Full Capacity. Every corner packed, every moment electric. We're turning it up to maximum and not stopping until the city wakes up around us.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {[
                { icon: <Calendar className="w-5 h-5 text-[#c72d28]" />, label: "Date", value: "Saturday, 18 April 2026" },
                { icon: <Clock className="w-5 h-5 text-[#c72d28]" />, label: "Time", value: "10PM — 4AM" },
                { icon: <MapPin className="w-5 h-5 text-[#c72d28]" />, label: "Venue", value: "Shotz, Flic en Flac" },
                { icon: <Users className="w-5 h-5 text-[#c72d28]" />, label: "Duration", value: "6 Hours Non-Stop" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="border border-white/10 p-6 hover:border-white/20 transition-colors" data-testid={`event-${label.toLowerCase()}-card`}>
                  <div className="mb-3">{icon}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">{label}</div>
                  <div className="text-white text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What to expect */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-0 border border-white/10" data-testid="expect-title">
            {[
              { icon: <Music className="w-5 h-5" />, title: "Top DJs", desc: "Back-to-back sets all night" },
              { icon: <Volume2 className="w-5 h-5" />, title: "Premium Sound", desc: "State-of-the-art system" },
              { icon: <Sparkles className="w-5 h-5" />, title: "Epic Lighting", desc: "Immersive visual production" },
              { icon: <Camera className="w-5 h-5" />, title: "Photo Booth", desc: "Professional photography" },
              { icon: <Video className="w-5 h-5" />, title: "360° Video", desc: "Share the moment" },
              { icon: <CheckCircle className="w-5 h-5" />, title: "Safe Environment", desc: "Pro security team" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="border-b border-r border-white/10 p-6 sm:p-8 hover:bg-white/[0.02] transition-colors">
                <div className="text-[#c72d28] mb-4">{icon}</div>
                <div className="text-white text-sm font-bold mb-1">{title}</div>
                <div className="text-white/30 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="bg-black py-24 sm:py-32 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <span className="section-line" />
            <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">Tickets</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <h2
                className="text-6xl sm:text-8xl font-black text-white leading-none mb-8"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                data-testid="tickets-title"
              >
                GET YOUR<br />TICKET.
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-10">
                Secure your spot at Vol. 3: Full Capacity. Pay via MCB, Juice, or Cash — and receive your ticket on WhatsApp within 24 hours.
              </p>

              {/* Payment details */}
              <div className="space-y-4" data-testid="payment-instructions">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Payment Accounts</p>
                {[
                  { method: "MCB Bank", ref: "000453915337", note: "MCB — AFTR Account" },
                  { method: "Juice Mobile", ref: "58205220", note: "Use ref: AFTR-3-[YOUR NAME]" },
                  { method: "Cash", ref: "58205220", note: "Text or call to arrange pickup" },
                ].map(({ method, ref, note }) => (
                  <div key={method} className="border border-white/10 p-4">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1">{method}</div>
                    <div className="font-mono text-white font-bold text-lg tracking-widest">{ref}</div>
                    <div className="text-[10px] text-white/20 mt-1">{note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Early Bird ticket card */}
              <div className="border border-[#c72d28] p-8 relative" data-testid="phase-1-ticket">
                <div className="absolute top-4 right-4">
                  <span className="bg-[#c72d28] text-white text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1">Active</span>
                </div>
                <p className="text-[10px] text-[#c72d28] uppercase tracking-[0.3em] mb-3">Early Bird — Phase 1</p>
                <h3
                  className="text-5xl font-black text-white leading-none mb-2"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  AFTR EARLY BIRD
                </h3>
                <div className="text-3xl font-black text-white mt-6 mb-6" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                  Rs 350 <span className="text-white/30 text-base font-normal" style={{ fontFamily: "inherit" }}>/ person</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {["6 hours non-stop", "Top DJs lineup", "Photo Booth & 360° Video", "Bar & refreshments available"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/50 text-sm">
                      <Check className="w-3 h-3 text-[#c72d28] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openModal('Early Bird')}
                  className="w-full bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#a82421] transition-colors"
                  data-testid="buy-early-bird-btn"
                >
                  Buy Now
                </button>
              </div>

              {/* Golden VIP ticket card */}
              <div className="border p-8 relative" style={{ borderColor: '#C9A84C' }} data-testid="golden-vip-ticket">
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-bold" style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}>Golden VIP</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: '#C9A84C' }}>Premium Experience</p>
                <h3
                  className="text-5xl font-black text-white leading-none mb-2"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  AFTR GOLDEN VIP
                </h3>
                <div className="flex items-center gap-2 mb-6">
                  <Crown className="w-4 h-4" style={{ color: '#C9A84C' }} />
                  <span className="text-xs text-white/40 uppercase tracking-[0.15em]">Limited spots</span>
                </div>
                <div className="text-3xl font-black mb-2" style={{ color: '#C9A84C', fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                  Rs 700
                </div>
                <p className="text-white/40 text-xs mb-8">Premium access + exclusive perks</p>
                <ul className="space-y-2 mb-8">
                  {['Priority entry', 'Dedicated VIP area', 'Exclusive AFTR merch'].map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-white/60">
                      <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#C9A84C' }} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openModal('Golden VIP')}
                  className="w-full py-4 text-black text-xs uppercase tracking-[0.2em] font-bold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#C9A84C' }}
                  data-testid="golden-vip-buy-btn"
                >
                  Get Golden VIP — Rs 700
                </button>
              </div>

              {/* WhatsApp help */}
              <a
                href="https://wa.me/23058205220?text=Hi!%20I%20have%20a%20question%20about%20AFTR%20Vol.%203%20tickets."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 border border-[#25D366]/30 text-[#25D366] text-xs uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#25D366]/10 transition-colors w-full"
                data-testid="whatsapp-support-button"
              >
                <SiWhatsapp className="w-4 h-4" />
                Questions? WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How to buy */}
      <section className="bg-black py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-14">
            <span className="section-line" />
            <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">How it works</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
            {[
              { step: "01", title: "Click Buy Now", desc: "Select your ticket and fill in your details" },
              { step: "02", title: "Make Payment", desc: "Pay via MCB, Juice, or cash and note your reference" },
              { step: "03", title: "Send Proof", desc: "Screenshot your payment and WhatsApp it to us" },
              { step: "04", title: "Get Your Ticket", desc: "Receive your digital ticket within 24 hours" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="border-b sm:border-b-0 border-r border-white/10 p-8">
                <div className="text-5xl font-black text-white/10 mb-4" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{step}</div>
                <div className="text-white text-sm font-bold mb-2">{title}</div>
                <div className="text-white/30 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section id="venue" className="bg-black py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-16">
            <span className="section-line" />
            <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">Venue</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <h2
                className="text-6xl sm:text-8xl font-black text-white leading-none mb-6"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                data-testid="venue-title"
              >
                SHOTZ<br />FLIC EN FLAC
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                Located in the heart of Flic en Flac, Shotz provides the perfect setting for an epic night of music and dancing. Easy to find and accessible from all parts of the island.
              </p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-20.28325,57.36539"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-bold px-7 py-4 hover:border-white/40 transition-colors"
                data-testid="get-directions-button"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>

            <div className="aspect-video border border-white/10" data-testid="venue-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.8!2d57.36539!3d-20.28325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDE2JzU5LjciUyA1N8KwMjEnNTUuNCJF!5e0!3m2!1sen!2smu!4v1600000000000!5m2!1sen!2smu"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shotz Flic en Flac Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-black border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">18 April 2026 — Shotz, Flic en Flac</p>
            <p className="text-white font-black text-2xl" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>AFTR VOL. 3: FULL CAPACITY</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/30 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">
              ← Home
            </Link>
            <button
              onClick={() => openModal('Early Bird')}
              className="bg-[#c72d28] text-white text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#a82421] transition-colors"
              data-testid="buy-now-payment-section"
            >
              Buy Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

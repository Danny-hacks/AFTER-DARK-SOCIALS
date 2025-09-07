import { Crown, Ticket, CreditCard, Check, Star } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function TicketSection() {
  // Check if we're in Phase 2 (after September 18, 2025)
  const currentDate = new Date();
  const phase2StartDate = new Date('2025-09-18');
  const isPhase2 = currentDate >= phase2StartDate;
  
  const openWhatsApp = () => {
    const phase = isPhase2 ? "Phase 2" : "Phase 1";
    const price = isPhase2 ? "Rs 500" : "Rs 350";
    const message = encodeURIComponent(`Hi! I'd like to purchase ${phase} tickets for AFTR rave on 27th September (${price}). I have sent the payment and will share the proof now.`);
    window.open(`https://wa.me/23058205220?text=${message}`, '_blank');
  };

  const openEmailContact = () => {
    const subject = encodeURIComponent("AFTR Rave 2025 - Payment Proof");
    const body = encodeURIComponent("Hi,\n\nI have made payment for AFTR rave tickets. Please find the payment proof attached.\n\nFull Name: \nEmail: \nNumber of Tickets: \n\nThank you!");
    window.open(`mailto:afterdarksocials@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const openGoldenTicketWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in the Golden All-Access ticket for AFTR rave on 27th September 2025. Can you please provide more information on how to claim it?");
    window.open(`https://wa.me/23058205220?text=${message}`, '_blank');
  };

  return (
    <section id="tickets" className="py-20 bg-gradient-to-br from-card via-background to-card relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="tickets-title">
            Get Your Digital Tickets
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="tickets-description">
            Secure your spot at AFTR - the rave that keeps the city awake!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {/* Phase 1 Ticket */}
          <div className={`bg-card border-2 rounded-2xl p-8 transition-all relative overflow-hidden ${
            !isPhase2 ? 'border-primary hover:scale-105' : 'border-border opacity-60'
          }`} data-testid="phase1-card">
            <div className={`absolute top-0 right-0 px-3 py-1 text-sm font-bold ${
              !isPhase2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
            }`} data-testid="phase1-badge">
              PHASE 1 {isPhase2 ? '- EXPIRED' : '- ACTIVE'}
            </div>
            <div className="text-center mb-6">
              <Ticket className="text-4xl gradient-text mb-4 mx-auto" />
              <h3 className="text-3xl font-black gradient-text tracking-wider uppercase" data-testid="phase1-title">AFTR Rave Entry</h3>
              <p className="text-muted-foreground">Phase 1 Pricing</p>
            </div>
            <div className="text-center mb-6">
              <div className="text-4xl font-black gradient-text" data-testid="phase1-price">Rs 350</div>
              <div className="text-sm text-muted-foreground">per person</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3" data-testid="phase1-feature-1">
                <Check className="text-accent" />
                <span>6 hours of non-stop energy</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase1-feature-2">
                <Check className="text-accent" />
                <span>5 Top DJs</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase1-feature-3">
                <Check className="text-accent" />
                <span>Premium Musical Experience</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase1-feature-4">
                <Check className="text-accent" />
                <span>Bar & refreshments available</span>
              </li>
            </ul>
            <div className="text-center space-y-2">
              {!isPhase2 ? (
                <div className="text-sm text-destructive font-semibold bg-destructive/10 px-4 py-2 rounded-lg">
                  ⏰ Phase 1 ends September 18th
                </div>
              ) : (
                <div className="text-sm text-muted-foreground font-semibold bg-muted/10 px-4 py-2 rounded-lg">
                  ❌ Phase 1 has expired
                </div>
              )}
            </div>
          </div>

          {/* Phase 2 Ticket */}
          <div className={`bg-card border-2 rounded-2xl p-8 transition-all relative overflow-hidden ${
            isPhase2 ? 'border-primary hover:scale-105' : 'border-border opacity-60'
          }`} data-testid="phase2-card">
            <div className={`absolute top-0 right-0 px-3 py-1 text-sm font-bold ${
              isPhase2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
            }`} data-testid="phase2-badge">
              PHASE 2 {isPhase2 ? '- ACTIVE' : '- COMING SOON'}
            </div>
            <div className="text-center mb-6">
              <Crown className="text-4xl gradient-text mb-4 mx-auto" />
              <h3 className="text-3xl font-black gradient-text tracking-wider uppercase" data-testid="phase2-title">AFTR Rave Entry</h3>
              <p className="text-muted-foreground">Phase 2 Pricing</p>
            </div>
            <div className="text-center mb-6">
              <div className="text-4xl font-black gradient-text" data-testid="phase2-price">Rs 500</div>
              <div className="text-sm text-muted-foreground">per person</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3" data-testid="phase2-feature-1">
                <Check className="text-accent" />
                <span>6 hours of non-stop energy</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase2-feature-2">
                <Check className="text-accent" />
                <span>5 Top DJs</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase2-feature-3">
                <Check className="text-accent" />
                <span>Premium Musical Experience</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase2-feature-4">
                <Check className="text-accent" />
                <span>Bar & refreshments available</span>
              </li>
            </ul>
            <div className="text-center space-y-2">
              {isPhase2 ? (
                <div className="text-sm text-accent font-semibold bg-accent/10 px-4 py-2 rounded-lg">
                  ✅ Phase 2 now available
                </div>
              ) : (
                <div className="text-sm text-muted-foreground font-semibold bg-muted/10 px-4 py-2 rounded-lg">
                  📅 Available from September 18th
                </div>
              )}
            </div>
          </div>

          {/* Golden All-Access Ticket */}
          <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/30 to-yellow-600/20 border-2 border-yellow-500/50 rounded-2xl p-8 transition-all relative overflow-hidden hover:scale-105 hover:border-yellow-400/80" data-testid="golden-card">
            <div className="absolute top-0 right-0 px-3 py-1 text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
              ✨ EXCLUSIVE
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10 pointer-events-none"></div>
            <div className="text-center mb-6 relative z-10">
              <Star className="text-4xl text-yellow-500 mb-4 mx-auto" />
              <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-wider uppercase" data-testid="golden-title">Golden All-Access</h3>
              <p className="text-muted-foreground">VIP Experience</p>
            </div>
            <div className="text-center mb-6 relative z-10">
              <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent" data-testid="golden-price">Exclusive</div>
              <div className="text-sm text-muted-foreground">contact for details</div>
            </div>
            <ul className="space-y-3 mb-8 relative z-10">
              <li className="flex items-center space-x-3" data-testid="golden-feature-1">
                <Star className="text-yellow-500 w-5 h-5" />
                <span>All Phase 1 & 2 benefits</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="golden-feature-2">
                <Star className="text-yellow-500 w-5 h-5" />
                <span>VIP entrance & priority access</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="golden-feature-3">
                <Star className="text-yellow-500 w-5 h-5" />
                <span>Stage access</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="golden-feature-4">
                <Star className="text-yellow-500 w-5 h-5" />
                <span>Meet & greet with DJs</span>
              </li>
            </ul>
            <div className="text-center relative z-10">
              <button
                onClick={openGoldenTicketWhatsApp}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 w-full"
                data-testid="button-golden-contact"
              >
                <SiWhatsapp className="inline-block w-5 h-5 mr-2" />
                How to Claim
              </button>
            </div>
          </div>
        </div>
        
        {/* Payment Instructions */}
        <div className="bg-muted rounded-2xl p-8 border-l-4 border-primary" data-testid="payment-instructions">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center" data-testid="payment-instructions-title">
            <CreditCard className="gradient-text mr-3" />
            How to Purchase Your Ticket
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-foreground mb-4" data-testid="payment-account-title">Payment Account Details</h4>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="space-y-4">
                  <div data-testid="bank-transfer-section">
                    <label className="text-sm text-muted-foreground">Bank Transfer</label>
                    <div className="text-xl font-mono font-bold text-foreground bg-background px-4 py-2 rounded mt-1" data-testid="bank-account-number">
                      000453915337
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">MCB - AFTR Account</div>
                  </div>
                  <div data-testid="mobile-money-section">
                    <label className="text-sm text-muted-foreground">Juice Mobile</label>
                    <div className="text-xl font-mono font-bold text-foreground bg-background px-4 py-2 rounded mt-1" data-testid="mobile-money-number">
                      58205220
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Use reference: AFTR-[YOUR NAME]</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-foreground mb-4" data-testid="process-steps-title">Simple 3-Step Process</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-4" data-testid="step-1">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <div className="font-semibold text-foreground">Send Payment</div>
                    <div className="text-sm text-muted-foreground">Transfer Rs 350 with reference AFTR-[YOUR NAME]</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4" data-testid="step-2">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <div className="font-semibold text-foreground">Send Proof</div>
                    <div className="text-sm text-muted-foreground">WhatsApp your receipt to 58205220 with name & email</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4" data-testid="step-3">
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <div className="font-semibold text-foreground">Receive Ticket</div>
                    <div className="text-sm text-muted-foreground">Get your digital ticket within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={openWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-colors"
              data-testid="whatsapp-button"
            >
              <SiWhatsapp className="text-xl mr-3" />
              WhatsApp Payment Proof
            </button>
            <button 
              onClick={openEmailContact}
              className="flex-1 border border-border bg-card text-foreground hover:bg-muted font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-colors"
              data-testid="email-button"
            >
              <CreditCard className="text-xl mr-3" />
              Email Payment Proof
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

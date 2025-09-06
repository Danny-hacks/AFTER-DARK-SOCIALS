import { Crown, Ticket, CreditCard, Check } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function TicketSection() {
  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'd like to purchase tickets for AFTR rave on 27th September. I have sent the payment and will share the proof now.");
    window.open(`https://wa.me/23058205220?text=${message}`, '_blank');
  };

  const openEmailContact = () => {
    const subject = encodeURIComponent("AFTR Rave 2025 - Payment Proof");
    const body = encodeURIComponent("Hi,\n\nI have made payment for AFTR rave tickets. Please find the payment proof attached.\n\nFull Name: \nEmail: \nNumber of Tickets: \n\nThank you!");
    window.open(`mailto:afterdarksocials@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <section id="tickets" className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="tickets-title">
            Get Your Digital Tickets
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="tickets-description">
            Secure your spot at AFTR - the rave that keeps the city awake!
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-12">
          {/* Phase 1 Ticket */}
          <div className="bg-card border-2 border-primary rounded-2xl p-8 hover:scale-105 transition-transform relative overflow-hidden" data-testid="phase1-card">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-sm font-bold" data-testid="available-badge">
              PHASE 1
            </div>
            <div className="text-center mb-6">
              <Ticket className="text-4xl gradient-text mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-foreground" data-testid="phase1-title">AFTR Rave Entry</h3>
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
                <span>5 top electronic DJs</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase1-feature-3">
                <Check className="text-accent" />
                <span>Premium sound system</span>
              </li>
              <li className="flex items-center space-x-3" data-testid="phase1-feature-4">
                <Check className="text-accent" />
                <span>Bar & refreshments available</span>
              </li>
            </ul>
            <div className="text-center text-sm text-muted-foreground">
              Phase 2 pricing: TBA
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
              <h4 className="text-lg font-semibold text-foreground mb-4" data-testid="payment-account-title">Payment Account Details</h4>
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
              <h4 className="text-lg font-semibold text-foreground mb-4" data-testid="process-steps-title">Simple 3-Step Process</h4>
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

import { useState } from "react";
import { Phone, Mail } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiFacebook, SiX, SiTiktok } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { toast } = useToast();

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi! I have a question about AFTR rave on 27th September 2025.");
    window.open(`https://wa.me/23058205220?text=${message}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email with form data
    const subject = encodeURIComponent("AFTR Rave 2025 - Inquiry");
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.open(`mailto:afterdarksocials@gmail.com?subject=${subject}&body=${body}`, '_blank');
    
    // Show success toast
    toast({
      title: "Message Prepared",
      description: "Your email client should open with the pre-filled message.",
    });
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-bl from-card via-background to-card relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-6" data-testid="contact-title">
            GET IN TOUCH
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="contact-description">
            Questions? We're here to help make your rave experience amazing!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-8 border border-border" data-testid="contact-info-card">
            <h3 className="text-xl font-bold text-foreground mb-6" data-testid="contact-info-title">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4" data-testid="whatsapp-contact">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <SiWhatsapp className="text-white text-xl" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">WhatsApp</div>
                  <button 
                    onClick={openWhatsApp}
                    className="text-accent hover:text-accent/80"
                    data-testid="whatsapp-link"
                  >
                    58205220
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4" data-testid="phone-contact">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <Phone className="text-white text-xl" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Phone</div>
                  <a 
                    href="tel:+23058205220" 
                    className="text-accent hover:text-accent/80"
                    data-testid="phone-link"
                  >
                    58205220
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4" data-testid="email-contact">
                <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                  <Mail className="text-white text-xl" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Email</div>
                  <a 
                    href="mailto:afterdarksocials@gmail.com" 
                    className="text-accent hover:text-accent/80"
                    data-testid="email-link"
                  >
                    afterdarksocials@gmail.com
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-bold text-foreground mb-4" data-testid="social-media-title">Follow Us</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/afterdarksocials.mu?igsh=M3FxdDR1bzd6MjJy&utm_source=qr" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  data-testid="instagram-link"
                >
                  <SiInstagram />
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-8 border border-border" data-testid="contact-form-card">
            <h3 className="text-xl font-bold text-foreground mb-6" data-testid="contact-form-title">Quick Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  data-testid="contact-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  data-testid="contact-email-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="How can we help you?"
                  required
                  data-testid="contact-message-input"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-bg text-white font-bold py-3 px-6 rounded-lg hover:scale-105 transition-transform"
                data-testid="contact-submit-button"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

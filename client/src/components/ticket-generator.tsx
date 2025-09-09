import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Download, Share, Mail, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Ticket } from "@shared/schema";

interface TicketGeneratorProps {
  ticket: Ticket;
}

export function TicketGenerator({ ticket }: TicketGeneratorProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadTicket = async () => {
    if (ticketRef.current) {
      try {
        const canvas = await html2canvas(ticketRef.current, {
          scale: 2,
          backgroundColor: '#1a1a1a',
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Use A4 landscape for better compatibility and quality
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calculate dimensions to maintain aspect ratio
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let imgWidth = pdfWidth - 20; // 10mm margin on each side
        let imgHeight = imgWidth / canvasAspectRatio;
        
        // If height exceeds page, adjust width
        if (imgHeight > pdfHeight - 20) {
          imgHeight = pdfHeight - 20;
          imgWidth = imgHeight * canvasAspectRatio;
        }
        
        // Center the image
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        pdf.save(`AFTR-Ticket-${ticket.referenceCode}.pdf`);
        
        toast({
          title: "Success",
          description: "Ticket PDF downloaded successfully",
        });
      } catch (error) {
        console.error('Error generating ticket:', error);
        toast({
          title: "Error",
          description: "Failed to generate ticket PDF",
          variant: "destructive",
        });
      }
    }
  };

  const shareViaWhatsApp = async () => {
    if (!ticketRef.current) return;
    
    try {
      // Generate ticket PDF
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Use A4 landscape for better compatibility and quality
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to maintain aspect ratio
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let imgWidth = pdfWidth - 20; // 10mm margin on each side
      let imgHeight = imgWidth / canvasAspectRatio;
      
      // If height exceeds page, adjust width
      if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * canvasAspectRatio;
      }
      
      // Center the image
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const message = `🎉 Your AFTR Rave Ticket is Ready! 🎉\n\n` +
        `📧 Customer: ${ticket.customerName}\n` +
        `🎫 Reference: ${ticket.referenceCode}\n` +
        `💰 Price: ${ticket.price}\n` +
        `📅 Date: 27th September 2025\n` +
        `📍 Venue: Shotz, Flic en Flac\n` +
        `🕙 Door opens: 10:00 PM\n\n` +
        `Your digital ticket PDF will be downloaded automatically.\n\n` +
        `See you on the dance floor! 🎵🔥`;
      
      // Always download the PDF first
      const link = document.createElement('a');
      link.download = `AFTR-Ticket-${ticket.referenceCode}.pdf`;
      link.href = pdfUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      
      // Then open WhatsApp with message
      setTimeout(() => {
        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = ticket.customerPhone ? ticket.customerPhone.replace(/[^\d]/g, '') : '';
        window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank');
      }, 500);
      
      toast({
        title: "WhatsApp Ready!",
        description: "Ticket PDF downloaded! WhatsApp opening with message - just upload the PDF.",
      });
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast({
        title: "Error",
        description: "Failed to generate ticket for WhatsApp sharing",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = async () => {
    if (!ticketRef.current) return;
    
    try {
      // Generate ticket PDF
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Use A4 landscape for better compatibility and quality
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to maintain aspect ratio
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let imgWidth = pdfWidth - 20; // 10mm margin on each side
      let imgHeight = imgWidth / canvasAspectRatio;
      
      // If height exceeds page, adjust width
      if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * canvasAspectRatio;
      }
      
      // Center the image
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const subject = `🎵 Your AFTR Rave Ticket is Ready - ${ticket.referenceCode}`;
      const body = `🔥 AFTR - THE RAVE EXPERIENCE 🔥

Hello ${ticket.customerName}! 👋

Your ticket for AFTR rave is ready! Get excited for the night of your life! 🎉

🎵 EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date:        27th September 2025
📍 Venue:       Shotz, Flic en Flac
🕙 Doors Open:  10:00 PM
⚡ Duration:    6 Hours Non-Stop Energy

🎫 YOUR TICKET REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reference Code: ${ticket.referenceCode}
Ticket Type:    ${ticket.ticketType}
Price:          ${ticket.price}

📋 IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Keep your ticket PDF safe - this is your entry pass
✓ Arrive early to avoid queues at the entrance
✓ No outside drinks or food allowed
✓ Security checks at entrance
✓ Event continues rain or shine
✓ Digital tickets must be shown on mobile device
✓ Follow us on: https://www.instagram.com/afterdarksocials.mu/

🔥 READY TO RAVE?

An unforgettable night of music and energy with unmatched vibes and non-stop dancing until dawn awaits you!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After Dark Socials Team
Follow us on: https://www.instagram.com/afterdarksocials.mu/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**IMPORTANT:** Please find your ticket PDF attached to this email. This PDF is your entry pass to the event!`;
      
      // Always download the PDF first
      const link = document.createElement('a');
      link.download = `AFTR-Ticket-${ticket.referenceCode}.pdf`;
      link.href = pdfUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      
      // Then open Outlook specifically
      setTimeout(() => {
        const emailTo = ticket.customerEmail || '';
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        
        // Open default email client (which should be Outlook on your MacBook)
        const mailtoUrl = `mailto:${emailTo}?subject=${encodedSubject}&body=${encodedBody}`;
        
        // Open email client
        window.open(mailtoUrl, '_blank');
      }, 500);
      
      toast({
        title: "Email Ready!",
        description: "Ticket PDF downloaded! Email client opening - just attach the PDF and send.",
      });
    } catch (error) {
      console.error('Error sharing via email:', error);
      toast({
        title: "Error",
        description: "Failed to generate ticket for email sharing",
        variant: "destructive",
      });
    }
  };

  // Smart sharing function that automatically chooses email or WhatsApp based on available contact info
  const shareTicketSmart = async () => {
    // Prioritize email if available, otherwise use phone number for WhatsApp
    if (ticket.customerEmail && ticket.customerEmail.trim()) {
      await shareViaEmail();
    } else if (ticket.customerPhone && ticket.customerPhone.trim()) {
      await shareViaWhatsApp();
    } else {
      // Fallback to download if no contact info
      downloadTicket();
      toast({
        title: "Download Ready!",
        description: "No contact info available - ticket downloaded for manual sharing.",
      });
    }
  };

  const shareTicket = async () => {
    if (ticketRef.current) {
      try {
        const dataUrl = await toPng(ticketRef.current, {
          quality: 0.95,
          width: 800,
          height: 600,
          backgroundColor: '#1a1a1a',
        });
        
        // Convert dataURL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        if (navigator.share && navigator.canShare({ files: [new File([blob], `AFTR-Ticket-${ticket.referenceCode}.png`, { type: 'image/png' })] })) {
          await navigator.share({
            title: `AFTR Rave Ticket - ${ticket.customerName}`,
            text: `Your ticket for AFTR rave on 27th September 2025!`,
            files: [new File([blob], `AFTR-Ticket-${ticket.referenceCode}.png`, { type: 'image/png' })]
          });
        } else {
          // Fallback to download
          downloadTicket();
        }
        
        toast({
          title: "Success",
          description: "Ticket shared successfully",
        });
      } catch (error) {
        console.error('Error sharing ticket:', error);
        toast({
          title: "Error",
          description: "Failed to share ticket, downloading instead",
          variant: "destructive",
        });
        downloadTicket();
      }
    }
  };

  // Generate QR code URL (using a QR code service)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`AFTR-TICKET-${ticket.id}-${ticket.qrCode}`)}`;

  return (
    <div className="space-y-4">
      {/* Digital Ticket */}
      <div 
        ref={ticketRef}
        className="w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-primary rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 gradient-bg rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 gradient-bg rounded-full blur-3xl"></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10 text-center mb-6">
          <h1 className="text-4xl font-black gradient-text mb-2">AFTR</h1>
          <p className="text-lg text-gray-300">The Rave Experience</p>
          <p className="text-sm text-gray-400">27th September 2025 • Shotz, Flic en Flac</p>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex-1">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Ticket Holder</p>
                <p className="text-2xl font-bold gradient-text">{ticket.customerName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Reference</p>
                  <p className="text-lg font-mono font-bold">{ticket.referenceCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Price</p>
                  <p className="text-lg font-bold text-accent">{ticket.price}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Event Details</p>
                <p className="text-sm">Door opens: 10:00 PM</p>
                <p className="text-sm">First act: 10:30 PM</p>
                <p className="text-sm">Duration: 6 hours non-stop</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-2 ml-6">
            <div className="bg-white p-2 rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="Ticket QR Code" 
                className="w-24 h-24"
                onError={(e) => {
                  // Fallback if QR service fails
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFGVFI8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">Entry Code</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-8 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <p>After Dark Socials</p>
            <p>{ticket.ticketType} • Valid for entry</p>
            <p>ID: {ticket.id.slice(-8)}</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 gradient-bg rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 gradient-bg rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={downloadTicket}
          className="flex items-center gap-2"
          data-testid="button-download-ticket"
        >
          <Download className="w-4 h-4" />
          Download Ticket
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-share-options"
            >
              <Share className="w-4 h-4" />
              Share Ticket
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <p className="text-sm font-medium mb-3">Share via:</p>
              
              {/* Smart Auto Share Button */}
              <Button
                onClick={shareTicketSmart}
                variant="default"
                className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
                data-testid="button-share-auto"
              >
                {ticket.customerEmail && ticket.customerEmail.trim() ? (
                  <><Mail className="w-4 h-4" /> Auto: Email</>
                ) : ticket.customerPhone && ticket.customerPhone.trim() ? (
                  <><SiWhatsapp className="w-4 h-4" /> Auto: WhatsApp</>
                ) : (
                  <><Download className="w-4 h-4" /> Auto: Download</>
                )}
              </Button>
              
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-2">Or choose manually:</p>
                
                <Button
                  onClick={shareViaWhatsApp}
                  variant="outline"
                  className="w-full justify-start gap-2 mb-1"
                  data-testid="button-share-whatsapp"
                  disabled={!ticket.customerPhone || !ticket.customerPhone.trim()}
                >
                  <SiWhatsapp className="w-4 h-4 text-green-600" />
                  WhatsApp {!ticket.customerPhone || !ticket.customerPhone.trim() ? '(No phone)' : ''}
                </Button>
                
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  data-testid="button-share-email"
                  disabled={!ticket.customerEmail || !ticket.customerEmail.trim()}
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email {!ticket.customerEmail || !ticket.customerEmail.trim() ? '(No email)' : ''}
                </Button>
              </div>
              
              <Button
                onClick={shareTicket}
                variant="outline"
                className="w-full justify-start gap-2"
                data-testid="button-share-native"
              >
                <Share className="w-4 h-4" />
                Native Share
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
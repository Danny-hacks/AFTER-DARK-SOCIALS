import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useQuery } from "@tanstack/react-query";
import { Download, Share, Mail, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Event, Ticket } from "@shared/schema";

interface TicketGeneratorProps {
  ticket: Ticket;
}

export function TicketGenerator({ ticket }: TicketGeneratorProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // The ticket only stores an eventId — always pull the event's own name/date/venue
  // rather than hardcoding a specific event's details here.
  const { data: eventData } = useQuery<{ success: boolean; event: Event }>({
    queryKey: ["/api/events", ticket.eventId],
    enabled: !!ticket.eventId,
  });
  const event = eventData?.event;
  const eventName = event?.name ?? "AFTR";
  const eventSubtitle = event?.subtitle ?? "";
  const eventDateVenue = [event?.date, event?.venue].filter(Boolean).join(" · ");

  const isGoldenVIP = ticket.ticketType === 'Golden VIP';
  const accentColor = isGoldenVIP ? '#C9A84C' : '#c72d28';
  const cardBg = isGoldenVIP ? '#0f0b00' : '#000000';
  const borderColor = isGoldenVIP ? '#C9A84C' : '#ffffff';
  const displayPrice = isGoldenVIP && ticket.price === 'Rs 350' ? 'Rs 700' : ticket.price;

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
      const fileName = `AFTR-Ticket-${ticket.referenceCode}.pdf`;

      const message =
        `Your ${eventName} Ticket is Ready!\n\n` +
        `Customer: ${ticket.customerName}\n` +
        `Reference: ${ticket.referenceCode}\n` +
        `Price: ${displayPrice}\n` +
        (eventDateVenue ? `${eventDateVenue}\n` : "") +
        (event?.time ? `Time: ${event.time}\n` : "") +
        `\nSee you on the dance floor!`;

      // A URL scheme can't attach a file to a WhatsApp message — WhatsApp doesn't
      // expose that outside its own paid Business API. The Web Share API is the
      // one browser mechanism that CAN hand a real file to WhatsApp: on a phone,
      // it opens the native share sheet with the PDF already attached, and
      // picking WhatsApp there sends it as a document, no manual upload needed.
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({
          title: `${eventName} Ticket - ${ticket.customerName}`,
          text: message,
          files: [pdfFile],
        });
        toast({
          title: "Ready to send",
          description: "Pick WhatsApp in the share sheet — the ticket PDF is attached.",
        });
        return;
      }

      // Desktop fallback: WhatsApp Web has no way to receive a file from a link,
      // so download the PDF and open a prefilled chat for a manual attach.
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = pdfUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

      setTimeout(() => {
        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = ticket.customerPhone ? ticket.customerPhone.replace(/[\s\-\+\(\)]/g, '') : '';
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      }, 500);

      toast({
        title: "PDF downloaded",
        description: "WhatsApp Web can't auto-attach files — drag the downloaded PDF into the chat that just opened.",
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
      
      const subject = `Your ${eventName} Ticket is Ready - ${ticket.referenceCode}`;
      const body = `${eventName.toUpperCase()}${eventSubtitle ? ` — ${eventSubtitle.toUpperCase()}` : ""}

Hello ${ticket.customerName},

Your ticket for ${eventName} is ready.

EVENT DETAILS
${event?.date ? `Date:   ${event.date}\n` : ""}${event?.venue ? `Venue:  ${event.venue}\n` : ""}${event?.time ? `Time:   ${event.time}\n` : ""}
YOUR TICKET REFERENCE
Reference Code: ${ticket.referenceCode}
Ticket Type:    ${ticket.ticketType}
Price:          ${displayPrice}

IMPORTANT NOTES
- Keep your ticket PDF safe — this is your entry pass
- Arrive early to avoid queues at the entrance
- No outside drinks or food allowed
- Security checks at entrance
- Event continues rain or shine
- Digital tickets must be shown on mobile device
- Follow us on: https://www.instagram.com/afterdarksocials.mu/

An unforgettable night of music and energy with unmatched vibes and non-stop dancing until dawn awaits you.

After Dark Socials Team
https://www.instagram.com/afterdarksocials.mu/

IMPORTANT: Please find your ticket PDF attached to this email. This PDF is your entry pass to the event.`;
      
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
            title: `${eventName} Ticket - ${ticket.customerName}`,
            text: `Your ticket for ${eventName}${event?.date ? ` on ${event.date}` : ""}!`,
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

  // Generate QR code URL (using a QR code service). Only the ticket's own
  // qrCode is encoded — it's already a globally unique UUID on its own, and
  // embedding ticket.id too made this ambiguous to parse back out, since both
  // are UUIDs containing hyphens (see qr-scanner.tsx).
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`AFTR-TICKET-${ticket.qrCode}`)}`;

  return (
    <div className="space-y-4">
      {/* Digital Ticket */}
      <div
        ref={ticketRef}
        className="w-full max-w-2xl mx-auto rounded-2xl p-7 sm:p-8 text-white relative overflow-hidden"
        style={{ backgroundColor: cardBg, border: `2px solid ${borderColor}` }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${borderColor} 35px, ${borderColor} 36px)`,
          }}></div>
        </div>

        {/* Header */}
        <div className="relative z-10 text-center mb-6 pb-5" style={{ borderBottom: `1px solid ${isGoldenVIP ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.1)'}` }}>
          <h1
            className="text-white leading-none mb-2"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(28px, 6vw, 42px)", letterSpacing: "0.01em" }}
          >
            {eventName}
          </h1>
          {eventSubtitle && (
            <p className="text-xs sm:text-sm font-bold tracking-[0.15em]" style={{ color: isGoldenVIP ? '#C9A84C' : accentColor }}>
              {eventSubtitle.toUpperCase()}
            </p>
          )}
          {isGoldenVIP && (
            <p className="text-xs uppercase tracking-[0.3em] mt-1" style={{ color: '#C9A84C' }}>Golden VIP</p>
          )}
          {eventDateVenue && <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-[0.15em]">{eventDateVenue}</p>}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex justify-between items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Ticket Holder</p>
                <p className="text-xl font-bold text-white truncate">{ticket.customerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Reference</p>
                  <p className="text-sm font-mono font-bold truncate" style={{ color: accentColor }}>{ticket.referenceCode}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Price</p>
                  <p className="text-sm font-bold text-white">{displayPrice}</p>
                </div>
              </div>

              {(event?.venue || event?.time) && (
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-0.5">Details</p>
                  {event?.venue && <p className="text-xs text-gray-300 truncate">{event.venue}</p>}
                  {event?.time && <p className="text-xs text-gray-300">{event.time}</p>}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-2 shrink-0">
            <div className="bg-white p-3 rounded-lg">
              <img
                src={qrCodeUrl} 
                alt="Ticket QR Code" 
                className="w-24 h-24"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFGVFI8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">Scan for Entry</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-8 pt-4" style={{ borderTop: `1px solid ${isGoldenVIP ? '#C9A84C33' : '#374151'}` }}>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p className="font-medium">After Dark Socials</p>
            <p style={{ color: isGoldenVIP ? '#C9A84C' : undefined }}>{ticket.ticketType} • Valid for entry</p>
            <p className="font-mono">ID: {ticket.id.slice(-8)}</p>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-4 right-4 w-8 h-8 opacity-30" style={{ borderTop: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}` }}></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 opacity-30" style={{ borderBottom: `2px solid ${borderColor}`, borderLeft: `2px solid ${borderColor}` }}></div>
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
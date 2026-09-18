import { useEffect, useRef, useState } from "react";
// html-to-image (not html2canvas) for all exports — html2canvas doesn't
// support CSS background-clip:text, so the gold gradient wordmark rendered
// as a solid block in downloaded/shared tickets even though it looked right
// on screen. html-to-image renders through an SVG foreignObject instead, so
// it matches the live preview.
import { toCanvas, toPng } from "html-to-image";
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
  /** Immediately trigger the WhatsApp share flow on mount — used by the
   * Resend button so it behaves exactly like clicking Share Ticket ->
   * WhatsApp inside this preview, without an extra click once it's open. */
  autoShare?: boolean;
}

export function TicketGenerator({ ticket, autoShare }: TicketGeneratorProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const autoSharedRef = useRef(false);
  const { toast } = useToast();

  // The ticket only stores an eventId — always pull the event's own name/date/venue
  // rather than hardcoding a specific event's details here.
  const { data: eventData, isLoading: eventLoading } = useQuery<{ success: boolean; event: Event }>({
    queryKey: ["/api/events", ticket.eventId],
    enabled: !!ticket.eventId,
  });
  const event = eventData?.event;
  const eventName = event?.name ?? "AFTR";
  const eventSubtitle = event?.subtitle ?? "";
  const eventDateVenue = [event?.date, event?.venue].filter(Boolean).join(" · ");

  // One unified ticket style — data correction for old mispriced Golden VIP
  // tickets is still needed, but no separate visual treatment for it anymore.
  const displayPrice = ticket.ticketType === 'Golden VIP' && ticket.price === 'Rs 350' ? 'Rs 700' : ticket.price;

  const downloadTicket = async () => {
    if (ticketRef.current) {
      try {
        const canvas = await toCanvas(ticketRef.current, {
          pixelRatio: 2,
          backgroundColor: '#0a0a0a',
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
      const canvas = await toCanvas(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
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

  useEffect(() => {
    // Wait for the event query to settle first — firing immediately on
    // mount could capture the "AFTR" placeholder instead of the real event
    // name/date/venue if this resolves before that fetch does.
    if (autoShare && !eventLoading && !autoSharedRef.current) {
      autoSharedRef.current = true;
      shareViaWhatsApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoShare, eventLoading]);

  const shareViaEmail = async () => {
    if (!ticketRef.current) return;
    
    try {
      // Generate ticket PDF
      const canvas = await toCanvas(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
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
          backgroundColor: '#0a0a0a',
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
      {/* Digital Ticket — one flat dark background throughout, gold used only
          as accent (wordmark, ticket type, reference line). Values only, no
          field labels — position and type do that job. Punched-hole notches
          are colored to match whatever sits behind the ticket (the dialog's
          bg-[#0a0a0a]) so they read as real cut-outs, not a colored shape —
          the toCanvas/toPng calls above are set to the same color for the
          same reason when exporting. */}
      <div
        ref={ticketRef}
        className="w-full max-w-3xl mx-auto rounded-lg text-white relative"
        style={{ backgroundColor: "#0d0d0d", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
      >
        {/* Punched holes along the outer top/bottom edges */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 6, right: 6, height: 26, top: -13,
            backgroundImage: "radial-gradient(circle, #0a0a0a 8px, transparent 8.5px)",
            backgroundSize: "26px 26px", backgroundRepeat: "repeat-x", backgroundPosition: "13px center",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            left: 6, right: 6, height: 26, bottom: -13,
            backgroundImage: "radial-gradient(circle, #0a0a0a 8px, transparent 8.5px)",
            backgroundSize: "26px 26px", backgroundRepeat: "repeat-x", backgroundPosition: "13px center",
          }}
        />

        <div className="flex">
          {/* Main info */}
          <div className="relative flex-1 min-w-0 p-6 sm:p-7 flex flex-col justify-center gap-3">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.35em] m-0">E-Ticket</p>
            <h1
              className="leading-none truncate"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "clamp(28px, 5.5vw, 40px)",
                letterSpacing: "0.015em",
                lineHeight: 0.92,
                background: "linear-gradient(180deg, #f5d76e 0%, #c9962a 55%, #8a6a1f 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 1px 0 rgba(255,255,255,0.15), 0 2px 1px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.5)",
              }}
            >
              {eventName}
            </h1>
            {(eventDateVenue || event?.time) && (
              <p className="text-[11px] font-semibold text-white/65 uppercase tracking-[0.06em] truncate">
                {[eventDateVenue, event?.time].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="flex items-baseline justify-between gap-4 pt-3" style={{ borderTop: "1px dashed rgba(255,255,255,0.15)" }}>
              <span className="text-base sm:text-lg font-bold truncate">{ticket.customerName}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] shrink-0" style={{ color: "#f0c869" }}>
                {ticket.ticketType}
              </span>
            </div>
            <p className="font-mono text-[11px] text-white/40 tracking-wide m-0">
              {ticket.referenceCode} &nbsp;&bull;&nbsp; {displayPrice}
            </p>
          </div>

          {/* Straight dashed tear line with punched notches at the seam */}
          <div
            className="relative shrink-0"
            style={{
              width: 20,
              backgroundImage: "repeating-linear-gradient(to bottom, #c9962a 0 5px, transparent 5px 10px)",
              backgroundSize: "2px 10px",
              backgroundRepeat: "repeat-y",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute rounded-full" style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)", width: 26, height: 26, background: "#0a0a0a" }} />
            <div className="absolute rounded-full" style={{ left: "50%", top: "100%", transform: "translate(-50%, -50%)", width: 26, height: 26, background: "#0a0a0a" }} />
          </div>

          {/* QR stub */}
          <div className="shrink-0 flex flex-col items-center justify-center gap-2" style={{ width: 220, padding: 22 }}>
            <div className="bg-white p-2.5 rounded">
              <img
                src={qrCodeUrl}
                alt="Ticket QR Code"
                className="block"
                style={{ width: 170, height: 170 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFGVFI8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.15em] text-center m-0">To be scanned at the gate</p>
          </div>
        </div>
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
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertTicketSchema, insertEventSchema, insertHeroSlideSchema, insertTicketPurchaseSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import sgMail from "@sendgrid/mail";

// Simple admin credentials - in production, use proper authentication
const ADMIN_USERNAME = "aftr_admin";

// Extend session data type
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// Middleware to check admin authentication
function requireAuth(req: Request, res: Response, next: any) {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure PostgreSQL session store for persistence
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Creates the session table automatically
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    tableName: "sessions"
  });

  // Configure session middleware
  app.use(session({
    secret: 'aftr-admin-session-secret-key-2024', // In production, use environment variable
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiry on activity
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'aftr.session.id' // Custom session name
  }));

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === "aftr2025admin") { // Temporary simple password
      req.session.isAdmin = true;
      return res.json({ success: true, message: "Logged in successfully" });
    }
    
    return res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/admin/check", (req, res) => {
    res.json({ isAuthenticated: !!req.session?.isAdmin });
  });

  // Ticket management routes (protected)
  app.post("/api/admin/tickets", requireAuth, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      
      // Check if reference code already exists
      const existingTicket = await storage.getTicketByReference(ticketData.referenceCode);
      if (existingTicket) {
        return res.status(400).json({ error: "Reference code already exists" });
      }
      
      const ticket = await storage.createTicket(ticketData);
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.get("/api/admin/tickets", requireAuth, async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json({ success: true, tickets });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/admin/tickets/:id", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  // Search ticket by QR code (alternative lookup for scanner)
  app.get("/api/admin/tickets/qr/:qrCode", requireAuth, async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      const ticket = tickets.find(t => t.qrCode === req.params.qrCode);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error fetching ticket by QR:", error);
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.patch("/api/admin/tickets/:id/use", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.markTicketAsUsed(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error marking ticket as used:", error);
      res.status(500).json({ error: "Failed to mark ticket as used" });
    }
  });

  app.delete("/api/admin/tickets/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTicket(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json({ success: true, message: "Ticket deleted successfully" });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  });

  // Serve public assets from object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve private objects (uploaded files)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error fetching object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for video/file
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const fileExtension = req.body.fileExtension || undefined;
      const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL(fileExtension);
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Event management routes (protected)
  app.get("/api/events", async (req, res) => {
    try {
      const eventsList = await storage.getAllEvents();
      res.json({ success: true, events: eventsList });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/past", async (req, res) => {
    try {
      const eventsList = await storage.getPastEvents();
      res.json({ success: true, events: eventsList });
    } catch (error) {
      console.error("Error fetching past events:", error);
      res.status(500).json({ error: "Failed to fetch past events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/admin/events", requireAuth, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.patch("/api/admin/events/:id", requireAuth, async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/admin/events/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Hero slide routes (public)
  app.get("/api/hero-slides", async (req, res) => {
    try {
      const slides = await storage.getActiveHeroSlides();
      res.json({ success: true, slides });
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      res.status(500).json({ error: "Failed to fetch hero slides" });
    }
  });

  // Hero slide management routes (protected)
  app.get("/api/admin/hero-slides", requireAuth, async (req, res) => {
    try {
      const slides = await storage.getAllHeroSlides();
      res.json({ success: true, slides });
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      res.status(500).json({ error: "Failed to fetch hero slides" });
    }
  });

  app.post("/api/admin/hero-slides", requireAuth, async (req, res) => {
    try {
      const slideData = insertHeroSlideSchema.parse(req.body);
      const slide = await storage.createHeroSlide(slideData);
      res.json({ success: true, slide });
    } catch (error) {
      console.error("Error creating hero slide:", error);
      res.status(500).json({ error: "Failed to create hero slide" });
    }
  });

  app.patch("/api/admin/hero-slides/:id", requireAuth, async (req, res) => {
    try {
      const slide = await storage.updateHeroSlide(req.params.id, req.body);
      if (!slide) {
        return res.status(404).json({ error: "Hero slide not found" });
      }
      res.json({ success: true, slide });
    } catch (error) {
      console.error("Error updating hero slide:", error);
      res.status(500).json({ error: "Failed to update hero slide" });
    }
  });

  app.delete("/api/admin/hero-slides/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteHeroSlide(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Hero slide not found" });
      }
      res.json({ success: true, message: "Hero slide deleted successfully" });
    } catch (error) {
      console.error("Error deleting hero slide:", error);
      res.status(500).json({ error: "Failed to delete hero slide" });
    }
  });

  // Public Ticket Purchase routes
  app.post("/api/tickets/purchase", async (req, res) => {
    try {
      const purchaseData = insertTicketPurchaseSchema.parse(req.body);
      const purchase = await storage.createTicketPurchase(purchaseData);
      res.json({ success: true, purchase, message: "Purchase request submitted. Please complete payment and wait for verification." });
    } catch (error) {
      console.error("Error creating ticket purchase:", error);
      res.status(500).json({ error: "Failed to submit purchase request" });
    }
  });

  // Get upload URL for payment proof (public)
  app.post("/api/tickets/upload-proof", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const fileExtension = req.body.fileExtension || 'jpg';
      const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL(fileExtension);
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL for proof:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Admin Ticket Purchase Management routes
  app.get("/api/admin/purchases", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getAllTicketPurchases();
      res.json({ success: true, purchases });
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.get("/api/admin/purchases/pending", requireAuth, async (req, res) => {
    try {
      const purchases = await storage.getPendingTicketPurchases();
      res.json({ success: true, purchases });
    } catch (error) {
      console.error("Error fetching pending purchases:", error);
      res.status(500).json({ error: "Failed to fetch pending purchases" });
    }
  });

  app.get("/api/admin/purchases/:id", requireAuth, async (req, res) => {
    try {
      const purchase = await storage.getTicketPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json({ success: true, purchase });
    } catch (error) {
      console.error("Error fetching purchase:", error);
      res.status(500).json({ error: "Failed to fetch purchase" });
    }
  });

  // Verify purchase and create ticket
  app.post("/api/admin/purchases/:id/verify", requireAuth, async (req, res) => {
    try {
      const purchase = await storage.getTicketPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      
      if (purchase.status !== "pending") {
        return res.status(400).json({ error: "Purchase already processed" });
      }
      
      // Generate unique reference code
      const referenceCode = `AFTR-2-${purchase.customerName.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;
      
      // Create ticket
      const ticket = await storage.createTicket({
        eventId: purchase.eventId || "aftr-vol-2",
        purchaseId: purchase.id,
        referenceCode,
        customerName: purchase.customerName,
        customerEmail: purchase.customerEmail,
        customerPhone: purchase.customerPhone,
        ticketType: purchase.ticketType,
        price: purchase.price,
        paymentMethod: purchase.paymentMethod,
        deliveryMethod: purchase.deliveryMethod,
      });
      
      // Update purchase with ticket ID
      await storage.verifyTicketPurchase(purchase.id, ticket.id);
      
      res.json({ 
        success: true, 
        ticket, 
        message: "Ticket created successfully. Ready for delivery.",
        deliveryMethod: purchase.deliveryMethod,
        whatsappLink: purchase.deliveryMethod === "whatsapp" 
          ? `https://wa.me/${purchase.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`🎉 Your AFTR Volume 2 Ticket\n\nHey ${purchase.customerName}!\n\nYour ticket is confirmed!\n\n📱 Reference: ${referenceCode}\n🎫 Type: ${purchase.ticketType}\n💰 Price: ${purchase.price}\n\nShow this message and your QR code at the door.\n\nSee you at the rave! 🔥`)}`
          : null
      });
    } catch (error) {
      console.error("Error verifying purchase:", error);
      res.status(500).json({ error: "Failed to verify purchase" });
    }
  });

  // Send ticket via email
  app.post("/api/admin/tickets/:id/send-email", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      if (!ticket.customerEmail) {
        return res.status(400).json({ error: "No email address for this ticket" });
      }
      
      // Initialize SendGrid
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = {
          to: ticket.customerEmail,
          from: process.env.SENDGRID_FROM_EMAIL || 'afterdarksocials@gmail.com',
          subject: '🎉 Your AFTR Volume 2 Ticket is Confirmed!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #c72d28; margin: 0;">AFTR</h1>
                <p style="color: #888; margin: 5px 0;">VOLUME 2</p>
              </div>
              
              <h2 style="color: #ffffff; text-align: center;">Hey ${ticket.customerName}! 🔥</h2>
              <p style="color: #cccccc; text-align: center;">Your ticket to AFTR Volume 2 is confirmed!</p>
              
              <div style="background: #1a1a1a; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #333;">
                <div style="margin-bottom: 15px;">
                  <span style="color: #888;">Reference Code:</span>
                  <span style="color: #c72d28; font-weight: bold; float: right;">${ticket.referenceCode}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <span style="color: #888;">Ticket Type:</span>
                  <span style="color: #fff; float: right;">${ticket.ticketType}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <span style="color: #888;">Price:</span>
                  <span style="color: #fff; float: right;">${ticket.price}</span>
                </div>
                <div style="margin-bottom: 15px;">
                  <span style="color: #888;">QR Code:</span>
                  <span style="color: #c72d28; font-weight: bold; float: right;">${ticket.qrCode}</span>
                </div>
              </div>
              
              <div style="background: linear-gradient(135deg, #c72d28, #8b1f1b); border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                <h3 style="color: #fff; margin: 0 0 15px 0;">📅 Event Details</h3>
                <p style="color: #fff; margin: 5px 0;"><strong>Date:</strong> January 30, 2026</p>
                <p style="color: #fff; margin: 5px 0;"><strong>Time:</strong> 10:00 PM - 4:00 AM</p>
                <p style="color: #fff; margin: 5px 0;"><strong>Venue:</strong> Shotz, Flic en Flac</p>
              </div>
              
              <p style="color: #888; text-align: center; font-size: 14px;">
                Show this email or your QR code at the door for entry.
              </p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                <p style="color: #c72d28; font-style: italic; margin: 0;">The Rave That Keeps The City Awake</p>
                <p style="color: #666; font-size: 12px; margin-top: 10px;">© 2026 AFTR - After Dark Socials</p>
              </div>
            </div>
          `,
        };
        
        await sgMail.send(msg);
        await storage.markTicketAsDelivered(ticket.id);
        
        res.json({ success: true, message: "Ticket sent via email successfully" });
      } else {
        res.status(400).json({ error: "SendGrid API key not configured" });
      }
    } catch (error) {
      console.error("Error sending ticket email:", error);
      res.status(500).json({ error: "Failed to send ticket email" });
    }
  });

  // Reject purchase
  app.post("/api/admin/purchases/:id/reject", requireAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const purchase = await storage.rejectTicketPurchase(req.params.id, reason || "Payment not verified");
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json({ success: true, purchase, message: "Purchase rejected" });
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      res.status(500).json({ error: "Failed to reject purchase" });
    }
  });

  // Scan/validate ticket by QR code
  app.get("/api/admin/scan/:qrCode", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicketByQrCode(req.params.qrCode);
      if (!ticket) {
        return res.status(404).json({ error: "Invalid ticket", valid: false });
      }
      
      res.json({ 
        success: true, 
        valid: true,
        ticket,
        alreadyUsed: ticket.isUsed,
        message: ticket.isUsed 
          ? `Ticket already used at ${ticket.usedAt?.toLocaleString()}` 
          : "Valid ticket - ready for check-in"
      });
    } catch (error) {
      console.error("Error scanning ticket:", error);
      res.status(500).json({ error: "Failed to validate ticket" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

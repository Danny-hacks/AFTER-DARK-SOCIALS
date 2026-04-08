import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertTicketSchema, insertEventSchema, insertHeroSlideSchema, insertTicketPurchaseSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
import { appendTicketToSheet, initializeSheetHeaders } from "./googleSheets";
import { pool } from "./db";

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
  // One-time startup correction: fix Golden VIP tickets that were incorrectly priced
  try {
    await pool.query(`
      UPDATE tickets SET price = 'Rs 700' WHERE ticket_type = 'Golden VIP' AND price = 'Rs 350';
      UPDATE ticket_purchases SET price = 'Rs 700' WHERE ticket_type = 'Golden VIP' AND price = 'Rs 350';
    `);
  } catch (e) {
    console.error("Price correction failed (non-blocking):", e);
  }

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
      const rawData = insertTicketSchema.parse(req.body);
      // Enforce correct price per ticket type
      const correctPrice = rawData.ticketType === 'Golden VIP' ? 'Rs 700' : rawData.price;
      const ticketData = { ...rawData, price: correctPrice };
      
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

  app.patch("/api/admin/tickets/:id/deliver", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.markTicketAsDelivered(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json({ success: true, ticket });
    } catch (error) {
      console.error("Error marking ticket as delivered:", error);
      res.status(500).json({ error: "Failed to mark ticket as delivered" });
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
      const rawPurchase = insertTicketPurchaseSchema.parse(req.body);
      // Enforce correct price per ticket type
      const expectedTotal = rawPurchase.ticketType === 'Golden VIP' ? 700 * (rawPurchase.quantity ?? 1) : 350 * (rawPurchase.quantity ?? 1);
      const purchaseData = { ...rawPurchase, price: `Rs ${expectedTotal}` };
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

  // Verify purchase and create tickets (supports multiple tickets per purchase)
  app.post("/api/admin/purchases/:id/verify", requireAuth, async (req, res) => {
    try {
      const purchase = await storage.getTicketPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      
      if (purchase.status !== "pending") {
        return res.status(400).json({ error: "Purchase already processed" });
      }
      
      // IMMEDIATELY mark as processing to prevent race condition from double-clicks
      await storage.markPurchaseProcessing(req.params.id);
      
      const quantity = purchase.quantity || 1;
      const pricePerTicket = purchase.ticketType === 'Golden VIP' ? 700 : 350;
      const tickets = [];
      
      // Create multiple tickets based on quantity (each with unique reference/QR code)
      for (let i = 0; i < quantity; i++) {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const referenceCode = `VOL3-${randomPart}`;
        
        const ticket = await storage.createTicket({
          eventId: purchase.eventId || "aftr-vol-3",
          purchaseId: purchase.id,
          referenceCode,
          customerName: purchase.customerName,
          customerEmail: purchase.customerEmail,
          customerPhone: purchase.customerPhone,
          ticketType: purchase.ticketType,
          price: `Rs ${pricePerTicket}`,
          paymentMethod: purchase.paymentMethod,
          deliveryMethod: purchase.deliveryMethod,
        });
        
        tickets.push(ticket);
        
        // Append each ticket to Google Sheet for record keeping
        try {
          await appendTicketToSheet({
            timestamp: new Date().toISOString(),
            customerName: purchase.customerName,
            customerEmail: purchase.customerEmail,
            customerPhone: purchase.customerPhone,
            ticketType: purchase.ticketType,
            price: `Rs ${pricePerTicket}`,
            paymentMethod: purchase.paymentMethod,
            deliveryMethod: purchase.deliveryMethod,
            referenceCode: referenceCode,
            qrCode: ticket.qrCode,
            eventId: purchase.eventId || "aftr-vol-3",
            status: "verified"
          });
        } catch (sheetError) {
          console.error("Failed to append to Google Sheet (non-blocking):", sheetError);
        }
      }
      
      // Update purchase with first ticket ID (for backwards compatibility)
      await storage.verifyTicketPurchase(purchase.id, tickets[0].id);
      
      res.json({ 
        success: true, 
        tickets,
        ticketCount: tickets.length,
        message: `${tickets.length} ticket${tickets.length > 1 ? 's' : ''} created successfully. Ready for delivery.`,
        deliveryMethod: purchase.deliveryMethod,
      });
    } catch (error) {
      console.error("Error verifying purchase:", error);
      res.status(500).json({ error: "Failed to verify purchase" });
    }
  });

  // Send ticket via email using Gmail SMTP
  app.post("/api/admin/tickets/:id/send-email", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      if (!ticket.customerEmail) {
        return res.status(400).json({ error: "No email address for this ticket" });
      }
      
      const gmailUser = process.env.GMAIL_USER || 'afterdarksocials@gmail.com';
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
      
      if (!gmailAppPassword) {
        return res.status(400).json({ error: "Gmail app password not configured. Please add GMAIL_APP_PASSWORD secret." });
      }
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });
      
      const mailOptions = {
        from: `"AFTR" <${gmailUser}>`,
        to: ticket.customerEmail,
        subject: '🔥 VOL.2 | Your AFTR Ticket is Ready!',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0a0a0a 0%, #1a0808 100%); color: #ffffff; padding: 0;">
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #c72d28 0%, #8b1f1b 50%, #0a0a0a 100%); padding: 30px; text-align: center; border-bottom: 3px solid #c72d28;">
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 8px; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">AFTR</div>
              <div style="font-size: 24px; font-weight: 300; letter-spacing: 12px; color: #fff; margin-top: 5px;">VOL.2</div>
            </div>
            
            <!-- Ticket Body -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="color: #c72d28; font-size: 14px; letter-spacing: 3px; margin: 0;">ADMIT ONE</p>
                <h2 style="color: #ffffff; font-size: 24px; margin: 10px 0;">${ticket.customerName}</h2>
              </div>
              
              <!-- Ticket Details Card -->
              <div style="background: rgba(199, 45, 40, 0.1); border: 2px dashed #c72d28; border-radius: 0; padding: 25px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                      <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reference</span><br>
                      <span style="color: #c72d28; font-size: 20px; font-weight: bold; font-family: monospace;">${ticket.referenceCode}</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">
                      <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Type</span><br>
                      <span style="color: #fff; font-size: 16px;">${ticket.ticketType}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">QR Code</span><br>
                      <span style="color: #fff; font-size: 14px; font-family: monospace;">${ticket.qrCode}</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</span><br>
                      <span style="color: #c72d28; font-size: 20px; font-weight: bold;">${ticket.ticketType === 'Golden VIP' && ticket.price === 'Rs 350' ? 'Rs 700' : ticket.price}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Event Info -->
              <div style="background: #0a0a0a; border-left: 4px solid #c72d28; padding: 20px; margin: 25px 0;">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <p style="color: #888; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                    <p style="color: #fff; font-size: 16px; margin: 5px 0 15px 0; font-weight: bold;">JAN 30, 2026</p>
                    
                    <p style="color: #888; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Time</p>
                    <p style="color: #fff; font-size: 16px; margin: 5px 0 0 0; font-weight: bold;">10PM - 4AM</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="color: #888; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Venue</p>
                    <p style="color: #fff; font-size: 16px; margin: 5px 0 0 0; font-weight: bold;">SHOTZ</p>
                    <p style="color: #888; font-size: 14px; margin: 3px 0 0 0;">Flic en Flac</p>
                  </div>
                </div>
              </div>
              
              <p style="color: #666; text-align: center; font-size: 13px; margin-top: 30px;">
                Screenshot this ticket. Show at the door for entry.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #0a0a0a; text-align: center; padding: 25px; border-top: 1px solid #222;">
              <p style="color: #c72d28; font-style: italic; font-size: 14px; margin: 0; letter-spacing: 2px;">The Rave That Keeps The City Awake</p>
              <p style="color: #444; font-size: 11px; margin-top: 15px;">© 2026 AFTR · After Dark Socials</p>
            </div>
          </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      await storage.markTicketAsDelivered(ticket.id);
      
      res.json({ success: true, message: "Ticket sent via email successfully" });
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

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import {
  insertTicketSchema,
  insertEventSchema,
  insertHeroSlideSchema,
  insertTicketPurchaseSchema,
  insertGalleryPhotoSchema,
  insertEventTicketTierSchema,
  insertAccessEventSchema,
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import nodemailer from "nodemailer";
import { appendTicketToSheet, initializeSheetHeaders } from "./googleSheets";
import { pool } from "./db";

// Simple admin credentials - in production, use proper authentication
const ADMIN_USERNAME = "aftr_admin";

// Extend session data type
declare module "express-session" {
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

  // Seed access table inventory (pricing/capacity) with defaults if empty
  try {
    const existing = await storage.getAllTableInventory();
    if (existing.length === 0) {
      const defaults = [
        { tableType: "single_entry", label: "Single Entry", price: 500, pricePerPerson: 500, capacity: 99, maxGuests: 1, minGuests: 1 },
        { tableType: "table_4", label: "Table for 4", price: 2000, pricePerPerson: 500, capacity: 5, maxGuests: 4, minGuests: 1 },
        { tableType: "table_5", label: "Table for 5", price: 2500, pricePerPerson: 500, capacity: 5, maxGuests: 5, minGuests: 1 },
        { tableType: "section_8_12", label: "Section (8–12 guests)", price: 4000, pricePerPerson: 500, capacity: 3, maxGuests: 12, minGuests: 8 },
      ];
      for (const row of defaults) {
        await pool.query(
          `INSERT INTO access_table_inventory (table_type, label, price, price_per_person, capacity, max_guests, min_guests)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (table_type) DO NOTHING`,
          [row.tableType, row.label, row.price, row.pricePerPerson, row.capacity, row.maxGuests, row.minGuests],
        );
      }
    }
  } catch (e) {
    console.error("Access table inventory seed failed (non-blocking):", e);
  }

  // Backfill slugs for events created before slug generation existed,
  // so their public URLs stop showing a raw UUID.
  try {
    const allEvents = await storage.getAllEvents();
    for (const ev of allEvents) {
      if (!ev.slug) {
        await storage.updateEvent(ev.id, {});
      }
    }
  } catch (e) {
    console.error("Event slug backfill failed (non-blocking):", e);
  }

  // Dynamic sitemap — static pages plus every real event, instead of a
  // fixed file that never included event detail pages at all.
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const staticUrls: { loc: string; priority: string }[] = [
        { loc: "/", priority: "1.0" },
        { loc: "/events", priority: "0.9" },
        { loc: "/access", priority: "0.9" },
        { loc: "/about", priority: "0.8" },
        { loc: "/gallery", priority: "0.7" },
        { loc: "/services", priority: "0.7" },
        { loc: "/events/past", priority: "0.6" },
        { loc: "/contact", priority: "0.6" },
        { loc: "/terms", priority: "0.2" },
        { loc: "/privacy", priority: "0.2" },
        { loc: "/refund", priority: "0.2" },
        { loc: "/age-requirements", priority: "0.2" },
      ];

      const events = await storage.getAllEvents();
      const eventUrls = events.map((e) => ({
        loc: `/events/${e.slug ?? e.id}`,
        priority: e.isPast ? "0.5" : "0.9",
        lastmod: e.createdAt ? new Date(e.createdAt).toISOString().slice(0, 10) : undefined,
      }));

      const allUrls = [...staticUrls, ...eventUrls];
      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        allUrls
          .map(
            (u) =>
              `  <url><loc>https://aftr.events${u.loc}</loc>` +
              ("lastmod" in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "") +
              `<priority>${u.priority}</priority></url>`,
          )
          .join("\n") +
        `\n</urlset>`;

      res.set({ "Content-Type": "application/xml" }).send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).end();
    }
  });

  // Configure PostgreSQL session store for persistence
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Creates the session table automatically
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    tableName: "sessions",
  });

  // Configure session middleware
  app.use(
    session({
      secret: "aftr-admin-session-secret-key-2024", // In production, use environment variable
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset expiry on activity
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      },
      name: "aftr.session.id", // Custom session name
    }),
  );

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === "aftr2025admin") {
      // Temporary simple password
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
      const correctPrice =
        rawData.ticketType === "Golden VIP" ? "Rs 700" : rawData.price;
      const ticketData = { ...rawData, price: correctPrice };

      // Check if reference code already exists
      const existingTicket = await storage.getTicketByReference(
        ticketData.referenceCode,
      );
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
      const ticket = tickets.find((t) => t.qrCode === req.params.qrCode);

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
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
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
      const { uploadURL, objectPath } =
        await objectStorageService.getObjectEntityUploadURL(fileExtension);
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
      const event = (await storage.getEventBySlug(req.params.id)) ?? (await storage.getEvent(req.params.id));
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      const tiers = await storage.getTiersByEvent(event.id);
      res.json({ success: true, event, tiers });
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

  // Event ticket tier routes (protected — public reads happen via /api/events/:id)
  app.post("/api/admin/events/:eventId/tiers", requireAuth, async (req, res) => {
    try {
      const tierData = insertEventTicketTierSchema.parse({ ...req.body, eventId: req.params.eventId });
      const tier = await storage.createTicketTier(tierData);
      res.json({ success: true, tier });
    } catch (error) {
      console.error("Error creating ticket tier:", error);
      res.status(500).json({ error: "Failed to create ticket tier" });
    }
  });

  app.patch("/api/admin/events/tiers/:tierId", requireAuth, async (req, res) => {
    try {
      const tierData = insertEventTicketTierSchema.partial().parse(req.body);
      const tier = await storage.updateTicketTier(req.params.tierId, tierData);
      if (!tier) {
        return res.status(404).json({ error: "Ticket tier not found" });
      }
      res.json({ success: true, tier });
    } catch (error) {
      console.error("Error updating ticket tier:", error);
      res.status(500).json({ error: "Failed to update ticket tier" });
    }
  });

  app.delete("/api/admin/events/tiers/:tierId", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTicketTier(req.params.tierId);
      if (!deleted) {
        return res.status(404).json({ error: "Ticket tier not found" });
      }
      res.json({ success: true, message: "Ticket tier deleted successfully" });
    } catch (error) {
      console.error("Error deleting ticket tier:", error);
      res.status(500).json({ error: "Failed to delete ticket tier" });
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

  // Gallery photo routes (public)
  app.get("/api/gallery", async (req, res) => {
    try {
      const photos = await storage.getAllGalleryPhotos();
      res.json({ success: true, photos });
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      res.status(500).json({ error: "Failed to fetch gallery photos" });
    }
  });

  // Gallery photo management routes (protected)
  app.get("/api/admin/gallery", requireAuth, async (req, res) => {
    try {
      const photos = await storage.getAllGalleryPhotos();
      res.json({ success: true, photos });
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      res.status(500).json({ error: "Failed to fetch gallery photos" });
    }
  });

  app.post("/api/admin/gallery", requireAuth, async (req, res) => {
    try {
      const photoData = insertGalleryPhotoSchema.parse(req.body);
      const photo = await storage.createGalleryPhoto(photoData);
      res.json({ success: true, photo });
    } catch (error) {
      console.error("Error creating gallery photo:", error);
      res.status(500).json({ error: "Failed to create gallery photo" });
    }
  });

  app.patch("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      const photo = await storage.updateGalleryPhoto(req.params.id, req.body);
      if (!photo) {
        return res.status(404).json({ error: "Gallery photo not found" });
      }
      res.json({ success: true, photo });
    } catch (error) {
      console.error("Error updating gallery photo:", error);
      res.status(500).json({ error: "Failed to update gallery photo" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteGalleryPhoto(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Gallery photo not found" });
      }
      res.json({ success: true, message: "Gallery photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery photo:", error);
      res.status(500).json({ error: "Failed to delete gallery photo" });
    }
  });

  // Public Ticket Purchase routes
  app.post("/api/tickets/purchase", async (req, res) => {
    try {
      const rawPurchase = insertTicketPurchaseSchema.parse(req.body);
      const quantity = rawPurchase.quantity ?? 1;

      // Look up the real price from the event's ticket tiers; fall back to the
      // legacy Golden VIP check for older purchases with no tiers configured.
      let pricePerTicket = rawPurchase.ticketType === "Golden VIP" ? 700 : 350;
      if (rawPurchase.eventId) {
        const tiers = await storage.getTiersByEvent(rawPurchase.eventId);
        const matchedTier = tiers.find((t) => t.name === rawPurchase.ticketType);
        if (matchedTier) pricePerTicket = matchedTier.price;
      }

      const expectedTotal = pricePerTicket * quantity;
      const purchaseData = { ...rawPurchase, price: `Rs ${expectedTotal}` };
      const purchase = await storage.createTicketPurchase(purchaseData);
      res.json({
        success: true,
        purchase,
        message:
          "Purchase request submitted. Please complete payment and wait for verification.",
      });
    } catch (error) {
      console.error("Error creating ticket purchase:", error);
      res.status(500).json({ error: "Failed to submit purchase request" });
    }
  });

  // Get upload URL for payment proof (public)
  app.post("/api/tickets/upload-proof", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const fileExtension = req.body.fileExtension || "jpg";
      const { uploadURL, objectPath } =
        await objectStorageService.getObjectEntityUploadURL(fileExtension);
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
      // Honor the price the customer was actually quoted at purchase time
      // (already tier-aware — see /api/tickets/purchase) rather than re-deriving it.
      const totalPrice = parseInt(purchase.price.replace(/\D/g, ""), 10) || 350 * quantity;
      const pricePerTicket = Math.round(totalPrice / quantity);
      const tickets = [];

      // Extra guest names for tickets 2..N of a multi-ticket order — the
      // purchaser's own customerName covers ticket 1. Malformed/short JSON
      // just means fewer names than tickets, handled by the fallback below.
      let guestNames: string[] = [];
      if (purchase.guestNamesJson) {
        try {
          const parsed = JSON.parse(purchase.guestNamesJson);
          if (Array.isArray(parsed)) guestNames = parsed.filter((n) => typeof n === "string");
        } catch {}
      }

      // Create multiple tickets based on quantity (each with unique reference/QR code)
      for (let i = 0; i < quantity; i++) {
        const randomPart = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        const referenceCode = `VOL3-${randomPart}`;
        const holderName = i === 0 ? purchase.customerName : (guestNames[i - 1]?.trim() || purchase.customerName);

        const ticket = await storage.createTicket({
          eventId: purchase.eventId || "aftr-vol-3",
          purchaseId: purchase.id,
          referenceCode,
          customerName: holderName,
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
            customerName: holderName,
            customerEmail: purchase.customerEmail,
            customerPhone: purchase.customerPhone,
            ticketType: purchase.ticketType,
            price: `Rs ${pricePerTicket}`,
            paymentMethod: purchase.paymentMethod,
            deliveryMethod: purchase.deliveryMethod,
            referenceCode: referenceCode,
            qrCode: ticket.qrCode,
            eventId: purchase.eventId || "aftr-vol-3",
            status: "verified",
          });
        } catch (sheetError) {
          console.error(
            "Failed to append to Google Sheet (non-blocking):",
            sheetError,
          );
        }
      }

      // Update purchase with first ticket ID (for backwards compatibility)
      await storage.verifyTicketPurchase(purchase.id, tickets[0].id);

      res.json({
        success: true,
        tickets,
        ticketCount: tickets.length,
        message: `${tickets.length} ticket${tickets.length > 1 ? "s" : ""} created successfully. Ready for delivery.`,
        deliveryMethod: purchase.deliveryMethod,
      });
    } catch (error) {
      console.error("Error verifying purchase:", error);
      res.status(500).json({ error: "Failed to verify purchase" });
    }
  });

  // Send ticket via email using Gmail SMTP
  app.post(
    "/api/admin/tickets/:id/send-email",
    requireAuth,
    async (req, res) => {
      try {
        const ticket = await storage.getTicket(req.params.id);
        if (!ticket) {
          return res.status(404).json({ error: "Ticket not found" });
        }

        if (!ticket.customerEmail) {
          return res
            .status(400)
            .json({ error: "No email address for this ticket" });
        }

        const gmailUser =
          process.env.GMAIL_USER || "afterdarksocials@gmail.com";
        const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

        if (!gmailAppPassword) {
          return res.status(400).json({
            error:
              "Gmail app password not configured. Please add GMAIL_APP_PASSWORD secret.",
          });
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        });

        const mailOptions = {
          from: `"AFTR" <${gmailUser}>`,
          to: ticket.customerEmail,
          subject: "🔥 VOL.2 | Your AFTR Ticket is Ready!",
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
                      <span style="color: #c72d28; font-size: 20px; font-weight: bold;">${ticket.ticketType === "Golden VIP" && ticket.price === "Rs 350" ? "Rs 700" : ticket.price}</span>
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

        res.json({
          success: true,
          message: "Ticket sent via email successfully",
        });
      } catch (error) {
        console.error("Error sending ticket email:", error);
        res.status(500).json({ error: "Failed to send ticket email" });
      }
    },
  );

  // Reject purchase
  app.post("/api/admin/purchases/:id/reject", requireAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const purchase = await storage.rejectTicketPurchase(
        req.params.id,
        reason || "Payment not verified",
      );
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json({ success: true, purchase, message: "Purchase rejected" });
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      res.status(500).json({ error: "Failed to reject purchase" });
    }
  });

  app.delete("/api/admin/purchases/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTicketPurchase(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json({ success: true, message: "Purchase deleted successfully" });
    } catch (error) {
      console.error("Error deleting purchase:", error);
      res.status(500).json({ error: "Failed to delete purchase" });
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
          : "Valid ticket - ready for check-in",
      });
    } catch (error) {
      console.error("Error scanning ticket:", error);
      res.status(500).json({ error: "Failed to validate ticket" });
    }
  });

  // ─── Table-based ACCESS routes ────────────────────────────────────────────
  // Pricing/capacity now lives in the access_table_inventory table (admin-editable
  // via /api/admin/access/inventory) instead of a hardcoded const.

  app.get("/api/access/capacity", async (_req, res) => {
    try {
      const inventory = await storage.getAllTableInventory();
      const counts = await storage.getAccessReservationCounts();
      const result: Record<string, object> = {};
      for (const config of inventory) {
        const confirmed = counts[config.tableType]?.confirmed ?? 0;
        const pending = counts[config.tableType]?.pending ?? 0;
        result[config.tableType] = {
          ...config,
          used: confirmed,
          confirmed,
          pending,
          available: config.capacity - confirmed,
        };
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching access capacity:", error);
      res.status(500).json({ error: "Failed to fetch access capacity" });
    }
  });

  app.post("/api/access/apply", async (req, res) => {
    const { tableType, guests } = req.body;
    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ error: "Guests required" });
    }
    try {
      const config = tableType ? await storage.getTableInventory(tableType) : undefined;
      if (!config) {
        return res.status(400).json({ error: "Invalid table type" });
      }
      const counts = await storage.getAccessReservationCounts();
      if ((counts[tableType]?.confirmed ?? 0) >= config.capacity) {
        return res.status(400).json({ error: "This table type is fully booked" });
      }
      // Assign the next table number for this type (non-rejected count + 1)
      const existingCount = await storage.getReservationCountByType(tableType);
      const tableNumber = existingCount + 1;
      // Generate server-side pass IDs: ACC-[tableNumber][guestIndex padded 3 digits]
      const guestsWithPassIds = (guests as { name: string; phone?: string }[]).map((g, i) => ({
        name: g.name,
        phone: g.phone ?? "",
        passId: `ACC-${tableNumber}${String(i + 1).padStart(3, "0")}`,
      }));
      await storage.createAccessReservation({
        tableType,
        tableLabel: config.label,
        guestsJson: JSON.stringify(guestsWithPassIds),
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error applying for access:", error);
      res.status(500).json({ error: "Failed to apply" });
    }
  });

  // ─── Admin ACCESS reservation routes ───────────────────────────────────────
  app.get("/api/admin/access/reservations", requireAuth, async (_req, res) => {
    try {
      const reservations = await storage.getAllAccessReservations();
      const counts = await storage.getAccessReservationCounts();
      res.json({ success: true, reservations, counts });
    } catch (error) {
      console.error("Error fetching access reservations:", error);
      res.status(500).json({ error: "Failed to fetch reservations" });
    }
  });

  app.put("/api/admin/access/:id/approve", requireAuth, async (req, res) => {
    try {
      const reservation = await storage.approveAccessReservation(req.params.id);
      if (!reservation) return res.status(404).json({ error: "Reservation not found" });

      const currentAccessEvent = await storage.getUpcomingAccessEvent();
      const eventDate = currentAccessEvent?.date || "3 July 2026";
      const eventVenue = currentAccessEvent?.venue || "Club Sixty Nine";

      // Build per-guest WhatsApp URLs for admin to dispatch manually
      const guests: { name: string; phone?: string; passId: string }[] = (() => {
        try { return JSON.parse(reservation.guestsJson); } catch { return []; }
      })();

      const whatsappUrls = guests
        .filter((g) => g.phone?.trim())
        .map((g) => {
          const clean = (g.phone ?? "").replace(/[\s\-\+\(\)]/g, "");
          const msg =
            `Your ACCESS pass has been confirmed.\n\n` +
            `Name: ${g.name.toUpperCase()}\n` +
            `Table: ${reservation.tableLabel.toUpperCase()}\n` +
            `Date: ${eventDate}\n` +
            `Venue: ${eventVenue}\n` +
            `Pass ID: ${g.passId}\n\n` +
            `Present this pass at the door.\n` +
            `After Dark Socials · @afterdarksocials.mu`;
          return {
            name: g.name,
            passId: g.passId,
            url: `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`,
          };
        });

      res.json({ success: true, reservation, whatsappUrls });
    } catch (error) {
      console.error("Error approving reservation:", error);
      res.status(500).json({ error: "Failed to approve" });
    }
  });

  app.post("/api/admin/access/single", requireAuth, async (req, res) => {
    const { name, phone, tableType, tableNumber, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });
    const inventoryConfig = tableType ? await storage.getTableInventory(tableType) : undefined;
    if (!inventoryConfig) {
      return res.status(400).json({ error: "Invalid table type" });
    }

    let passId: string;
    let tableLabel: string;

    if (tableType === "single_entry") {
      const count = await storage.countAdminSinglePassesByType("single_entry");
      passId = `ACC-SE${(count + 1).toString().padStart(3, "0")}`;
      tableLabel = "Single Entry";
    } else {
      const tNum = parseInt(tableNumber, 10);
      if (isNaN(tNum) || tNum < 1) {
        return res.status(400).json({ error: "Invalid number" });
      }
      if (tableType === "section_8_12") {
        passId = `ACC-S${tNum}001`;
        tableLabel = `Section ${tNum}`;
      } else {
        passId = `ACC-${tNum}001`;
        tableLabel = inventoryConfig.label;
      }
    }

    const guest = {
      name: (name as string).trim(),
      phone: phone?.trim() ?? "",
      passId,
      notes: notes?.trim() ?? "",
    };
    try {
      const reservation = await storage.createAdminSinglePass({
        tableType,
        tableLabel,
        guestsJson: JSON.stringify([guest]),
      });
      let whatsappUrl: string | null = null;
      if (phone?.trim()) {
        const currentAccessEvent = await storage.getUpcomingAccessEvent();
        const eventDate = currentAccessEvent?.date || "3 July 2026";
        const eventVenue = currentAccessEvent?.venue || "Club Sixty Nine";
        const clean = (phone as string).replace(/[\s\-\+\(\)]/g, "");
        const msg =
          `Your ACCESS pass is confirmed.\n\n` +
          `Name: ${(name as string).toUpperCase()}\n` +
          `Table: ${tableLabel.toUpperCase()}\n` +
          `Date: ${eventDate}\n` +
          `Venue: ${eventVenue}\n` +
          `Pass ID: ${passId}\n\n` +
          `Your pass has been attached to this message.\n\n` +
          `After Dark Socials · @afterdarksocials.mu`;
        whatsappUrl = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
      }
      res.json({ success: true, reservation, passId, tableLabel, whatsappUrl });
    } catch (error) {
      console.error("Error creating single pass:", error);
      res.status(500).json({ error: "Failed to create pass" });
    }
  });

  app.delete("/api/admin/access/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteAccessReservation(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Reservation not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res.status(500).json({ error: "Failed to delete reservation" });
    }
  });

  app.put("/api/admin/access/:id/reject", requireAuth, async (req, res) => {
    try {
      const reservation = await storage.rejectAccessReservation(req.params.id);
      if (!reservation) return res.status(404).json({ error: "Reservation not found" });
      res.json({ success: true, reservation });
    } catch (error) {
      console.error("Error rejecting reservation:", error);
      res.status(500).json({ error: "Failed to reject" });
    }
  });

  // ─── ACCESS table pricing/capacity management (protected) ─────────────────
  app.get("/api/admin/access/inventory", requireAuth, async (_req, res) => {
    try {
      const inventory = await storage.getAllTableInventory();
      res.json({ success: true, inventory });
    } catch (error) {
      console.error("Error fetching table inventory:", error);
      res.status(500).json({ error: "Failed to fetch table inventory" });
    }
  });

  app.patch("/api/admin/access/inventory/:tableType", requireAuth, async (req, res) => {
    try {
      const { label, price, pricePerPerson, capacity, maxGuests, minGuests } = req.body;
      const row = await storage.updateTableInventory(req.params.tableType, {
        label, price, pricePerPerson, capacity, maxGuests, minGuests,
      });
      if (!row) return res.status(404).json({ error: "Table type not found" });
      res.json({ success: true, inventory: row });
    } catch (error) {
      console.error("Error updating table inventory:", error);
      res.status(500).json({ error: "Failed to update table inventory" });
    }
  });

  // ─── ACCESS events (editions) ──────────────────────────────────────────────
  app.get("/api/access/current", async (_req, res) => {
    try {
      const event = await storage.getUpcomingAccessEvent();
      res.json({ success: true, event: event ?? null });
    } catch (error) {
      console.error("Error fetching current access event:", error);
      res.status(500).json({ error: "Failed to fetch current access event" });
    }
  });

  app.get("/api/access/past", async (_req, res) => {
    try {
      const events = await storage.getPastAccessEvents();
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching past access events:", error);
      res.status(500).json({ error: "Failed to fetch past access events" });
    }
  });

  app.get("/api/admin/access/events", requireAuth, async (_req, res) => {
    try {
      const events = await storage.getAllAccessEvents();
      res.json({ success: true, events });
    } catch (error) {
      console.error("Error fetching access events:", error);
      res.status(500).json({ error: "Failed to fetch access events" });
    }
  });

  app.post("/api/admin/access/events", requireAuth, async (req, res) => {
    try {
      const eventData = insertAccessEventSchema.parse(req.body);
      const event = await storage.createAccessEvent(eventData);
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error creating access event:", error);
      res.status(500).json({ error: "Failed to create access event" });
    }
  });

  app.patch("/api/admin/access/events/:id", requireAuth, async (req, res) => {
    try {
      const eventData = insertAccessEventSchema.partial().parse(req.body);
      const event = await storage.updateAccessEvent(req.params.id, eventData);
      if (!event) return res.status(404).json({ error: "Access event not found" });
      res.json({ success: true, event });
    } catch (error) {
      console.error("Error updating access event:", error);
      res.status(500).json({ error: "Failed to update access event" });
    }
  });

  app.delete("/api/admin/access/events/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteAccessEvent(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Access event not found" });
      res.json({ success: true, message: "Access event deleted successfully" });
    } catch (error) {
      console.error("Error deleting access event:", error);
      res.status(500).json({ error: "Failed to delete access event" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

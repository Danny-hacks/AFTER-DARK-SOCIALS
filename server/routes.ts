import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertTicketSchema, insertEventSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

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

  const httpServer = createServer(app);

  return httpServer;
}

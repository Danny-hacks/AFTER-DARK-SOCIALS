import { type User, type InsertUser, type Ticket, type InsertTicket, type TicketPurchase, type InsertTicketPurchase, type Event, type InsertEvent, type HeroSlide, type InsertHeroSlide, type AccessReservation, type GalleryPhoto, type InsertGalleryPhoto, type AccessTableInventory, type EventTicketTier, type InsertEventTicketTier, type AccessEvent, type InsertAccessEvent, users, tickets, ticketPurchases, events, heroSlides, accessReservations, galleryPhotos, accessTableInventory, eventTicketTiers, accessEvents } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ne } from "drizzle-orm";
import { randomUUID } from "crypto";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ticket Purchase operations
  getTicketPurchase(id: string): Promise<TicketPurchase | undefined>;
  getAllTicketPurchases(): Promise<TicketPurchase[]>;
  getPendingTicketPurchases(): Promise<TicketPurchase[]>;
  createTicketPurchase(purchase: InsertTicketPurchase): Promise<TicketPurchase>;
  updateTicketPurchase(id: string, data: Partial<TicketPurchase>): Promise<TicketPurchase | undefined>;
  verifyTicketPurchase(id: string, ticketId: string): Promise<TicketPurchase | undefined>;
  rejectTicketPurchase(id: string, reason: string): Promise<TicketPurchase | undefined>;
  markPurchaseProcessing(id: string): Promise<TicketPurchase | undefined>;
  deleteTicketPurchase(id: string): Promise<boolean>;
  
  // Ticket operations
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketByReference(referenceCode: string): Promise<Ticket | undefined>;
  getTicketByQrCode(qrCode: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getAllTickets(): Promise<Ticket[]>;
  getTicketsByEvent(eventId: string): Promise<Ticket[]>;
  markTicketAsUsed(id: string): Promise<Ticket | undefined>;
  markTicketAsDelivered(id: string): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;

  // Event operations
  getEvent(id: string): Promise<Event | undefined>;
  getEventBySlug(slug: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getPastEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Event ticket tier operations
  getTiersByEvent(eventId: string): Promise<EventTicketTier[]>;
  createTicketTier(tier: InsertEventTicketTier): Promise<EventTicketTier>;
  updateTicketTier(id: string, tier: Partial<InsertEventTicketTier>): Promise<EventTicketTier | undefined>;
  deleteTicketTier(id: string): Promise<boolean>;

  // Hero slide operations
  getHeroSlide(id: string): Promise<HeroSlide | undefined>;
  getAllHeroSlides(): Promise<HeroSlide[]>;
  getActiveHeroSlides(): Promise<HeroSlide[]>;
  createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide>;
  updateHeroSlide(id: string, slide: Partial<InsertHeroSlide>): Promise<HeroSlide | undefined>;
  deleteHeroSlide(id: string): Promise<boolean>;

  // Access reservation operations
  createAccessReservation(data: { tableType: string; tableLabel: string; guestsJson: string }): Promise<AccessReservation>;
  getAllAccessReservations(): Promise<AccessReservation[]>;
  approveAccessReservation(id: string): Promise<AccessReservation | undefined>;
  rejectAccessReservation(id: string): Promise<AccessReservation | undefined>;
  getAccessReservationCounts(): Promise<Record<string, { confirmed: number; pending: number }>>;
  getReservationCountByType(tableType: string): Promise<number>;
  createAdminSinglePass(data: { tableType: string; tableLabel: string; guestsJson: string }): Promise<AccessReservation>;
  countAdminSinglePassesByType(tableType: string): Promise<number>;
  deleteAccessReservation(id: string): Promise<boolean>;

  // Gallery photo operations
  getGalleryPhoto(id: string): Promise<GalleryPhoto | undefined>;
  getAllGalleryPhotos(): Promise<GalleryPhoto[]>;
  createGalleryPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto>;
  updateGalleryPhoto(id: string, photo: Partial<InsertGalleryPhoto>): Promise<GalleryPhoto | undefined>;
  deleteGalleryPhoto(id: string): Promise<boolean>;

  // Access table inventory (pricing/capacity) operations
  getAllTableInventory(): Promise<AccessTableInventory[]>;
  getTableInventory(tableType: string): Promise<AccessTableInventory | undefined>;
  updateTableInventory(tableType: string, data: Partial<Omit<AccessTableInventory, "tableType">>): Promise<AccessTableInventory | undefined>;

  // ACCESS event operations
  getAccessEvent(id: string): Promise<AccessEvent | undefined>;
  getAllAccessEvents(): Promise<AccessEvent[]>;
  getUpcomingAccessEvent(): Promise<AccessEvent | undefined>;
  createAccessEvent(event: InsertAccessEvent): Promise<AccessEvent>;
  updateAccessEvent(id: string, event: Partial<InsertAccessEvent>): Promise<AccessEvent | undefined>;
  deleteAccessEvent(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Ticket Purchase operations
  async getTicketPurchase(id: string): Promise<TicketPurchase | undefined> {
    const [purchase] = await db.select().from(ticketPurchases).where(eq(ticketPurchases.id, id));
    return purchase || undefined;
  }

  async getAllTicketPurchases(): Promise<TicketPurchase[]> {
    return db.select().from(ticketPurchases).orderBy(desc(ticketPurchases.createdAt));
  }

  async getPendingTicketPurchases(): Promise<TicketPurchase[]> {
    return db.select().from(ticketPurchases).where(eq(ticketPurchases.status, "pending")).orderBy(desc(ticketPurchases.createdAt));
  }

  async createTicketPurchase(insertPurchase: InsertTicketPurchase): Promise<TicketPurchase> {
    const [purchase] = await db
      .insert(ticketPurchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async updateTicketPurchase(id: string, data: Partial<TicketPurchase>): Promise<TicketPurchase | undefined> {
    const [purchase] = await db
      .update(ticketPurchases)
      .set(data)
      .where(eq(ticketPurchases.id, id))
      .returning();
    return purchase || undefined;
  }

  async verifyTicketPurchase(id: string, ticketId: string): Promise<TicketPurchase | undefined> {
    const [purchase] = await db
      .update(ticketPurchases)
      .set({ status: "verified", ticketId, verifiedAt: new Date() })
      .where(eq(ticketPurchases.id, id))
      .returning();
    return purchase || undefined;
  }

  async rejectTicketPurchase(id: string, reason: string): Promise<TicketPurchase | undefined> {
    const [purchase] = await db
      .update(ticketPurchases)
      .set({ status: "rejected", rejectionReason: reason, rejectedAt: new Date() })
      .where(eq(ticketPurchases.id, id))
      .returning();
    return purchase || undefined;
  }

  async markPurchaseProcessing(id: string): Promise<TicketPurchase | undefined> {
    const [purchase] = await db
      .update(ticketPurchases)
      .set({ status: "processing" })
      .where(eq(ticketPurchases.id, id))
      .returning();
    return purchase || undefined;
  }

  async deleteTicketPurchase(id: string): Promise<boolean> {
    // Remove any tickets generated from this request too, so deleting an
    // invalid/test request doesn't leave orphaned tickets behind skewing
    // ticket-level stats and check-in lists.
    await db.delete(tickets).where(eq(tickets.purchaseId, id));
    const result = await db
      .delete(ticketPurchases)
      .where(eq(ticketPurchases.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Ticket operations
  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getTicketByReference(referenceCode: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceCode, referenceCode));
    return ticket || undefined;
  }

  async getTicketByQrCode(qrCode: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.qrCode, qrCode));
    return ticket || undefined;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const qrCode = randomUUID(); // Generate unique QR code
    const [ticket] = await db
      .insert(tickets)
      .values({ ...insertTicket, qrCode })
      .returning();
    return ticket;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return db.select().from(tickets);
  }

  async getTicketsByEvent(eventId: string): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.eventId, eventId));
  }

  async markTicketAsUsed(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket || undefined;
  }

  async markTicketAsDelivered(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ isDelivered: true, deliveredAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket || undefined;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db
      .delete(tickets)
      .where(eq(tickets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Event operations
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventBySlug(slug: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.slug, slug));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async getPastEvents(): Promise<Event[]> {
    return db.select().from(events).where(eq(events.isPast, true));
  }

  private async generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const base_ = slugify(base);
    if (!base_) return "";
    let candidate = base_;
    let suffix = 2;
    while (true) {
      const existing = await this.getEventBySlug(candidate);
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base_}-${suffix++}`;
    }
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const slug = await this.generateUniqueSlug(insertEvent.slug?.trim() || insertEvent.name);
    const [event] = await db
      .insert(events)
      .values({ ...insertEvent, slug: slug || null })
      .returning();
    return event;
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const data: Partial<InsertEvent> = { ...eventData };
    if (data.slug?.trim()) {
      data.slug = await this.generateUniqueSlug(data.slug, id);
    } else {
      delete data.slug;
      const current = await this.getEvent(id);
      if (current && !current.slug) {
        const generated = await this.generateUniqueSlug(data.name || current.name, id);
        if (generated) data.slug = generated;
      }
    }
    const [event] = await db
      .update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Event ticket tier operations
  async getTiersByEvent(eventId: string): Promise<EventTicketTier[]> {
    return db.select().from(eventTicketTiers).where(eq(eventTicketTiers.eventId, eventId)).orderBy(eventTicketTiers.order);
  }

  async createTicketTier(insertTier: InsertEventTicketTier): Promise<EventTicketTier> {
    const [tier] = await db
      .insert(eventTicketTiers)
      .values(insertTier)
      .returning();
    return tier;
  }

  async updateTicketTier(id: string, tierData: Partial<InsertEventTicketTier>): Promise<EventTicketTier | undefined> {
    const [tier] = await db
      .update(eventTicketTiers)
      .set(tierData)
      .where(eq(eventTicketTiers.id, id))
      .returning();
    return tier || undefined;
  }

  async deleteTicketTier(id: string): Promise<boolean> {
    const result = await db
      .delete(eventTicketTiers)
      .where(eq(eventTicketTiers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Hero slide operations
  async getHeroSlide(id: string): Promise<HeroSlide | undefined> {
    const [slide] = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
    return slide || undefined;
  }

  async getAllHeroSlides(): Promise<HeroSlide[]> {
    return db.select().from(heroSlides);
  }

  async getActiveHeroSlides(): Promise<HeroSlide[]> {
    return db.select().from(heroSlides).where(eq(heroSlides.isActive, true));
  }

  async createHeroSlide(insertSlide: InsertHeroSlide): Promise<HeroSlide> {
    const [slide] = await db
      .insert(heroSlides)
      .values(insertSlide)
      .returning();
    return slide;
  }

  async updateHeroSlide(id: string, slideData: Partial<InsertHeroSlide>): Promise<HeroSlide | undefined> {
    const [slide] = await db
      .update(heroSlides)
      .set(slideData)
      .where(eq(heroSlides.id, id))
      .returning();
    return slide || undefined;
  }

  async deleteHeroSlide(id: string): Promise<boolean> {
    const result = await db
      .delete(heroSlides)
      .where(eq(heroSlides.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Access reservation operations
  async createAccessReservation(data: { tableType: string; tableLabel: string; guestsJson: string }): Promise<AccessReservation> {
    const [row] = await db
      .insert(accessReservations)
      .values({ ...data, status: "pending_payment" })
      .returning();
    return row;
  }

  async getAllAccessReservations(): Promise<AccessReservation[]> {
    return db.select().from(accessReservations).orderBy(desc(accessReservations.createdAt));
  }

  async approveAccessReservation(id: string): Promise<AccessReservation | undefined> {
    const [row] = await db
      .update(accessReservations)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(accessReservations.id, id))
      .returning();
    return row || undefined;
  }

  async rejectAccessReservation(id: string): Promise<AccessReservation | undefined> {
    const [row] = await db
      .update(accessReservations)
      .set({ status: "rejected" })
      .where(eq(accessReservations.id, id))
      .returning();
    return row || undefined;
  }

  async getAccessReservationCounts(): Promise<Record<string, { confirmed: number; pending: number }>> {
    const rows = await db.select().from(accessReservations);
    const result: Record<string, { confirmed: number; pending: number }> = {};
    for (const row of rows) {
      if (!result[row.tableType]) result[row.tableType] = { confirmed: 0, pending: 0 };
      if (row.status === "approved") result[row.tableType].confirmed++;
      else if (row.status === "pending_payment") result[row.tableType].pending++;
    }
    return result;
  }

  async createAdminSinglePass(data: { tableType: string; tableLabel: string; guestsJson: string }): Promise<AccessReservation> {
    const [row] = await db
      .insert(accessReservations)
      .values({ ...data, status: "approved", source: "admin_single", approvedAt: new Date() })
      .returning();
    return row;
  }

  async deleteAccessReservation(id: string): Promise<boolean> {
    const result = await db.delete(accessReservations).where(eq(accessReservations.id, id)).returning();
    return result.length > 0;
  }

  async countAdminSinglePassesByType(tableType: string): Promise<number> {
    const rows = await db
      .select()
      .from(accessReservations)
      .where(and(eq(accessReservations.tableType, tableType), eq(accessReservations.source, "admin_single")));
    return rows.length;
  }

  async getReservationCountByType(tableType: string): Promise<number> {
    const rows = await db
      .select()
      .from(accessReservations)
      .where(and(eq(accessReservations.tableType, tableType), ne(accessReservations.status, "rejected")));
    return rows.length;
  }

  // Gallery photo operations
  async getGalleryPhoto(id: string): Promise<GalleryPhoto | undefined> {
    const [photo] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id));
    return photo || undefined;
  }

  async getAllGalleryPhotos(): Promise<GalleryPhoto[]> {
    return db.select().from(galleryPhotos).orderBy(galleryPhotos.order);
  }

  async createGalleryPhoto(insertPhoto: InsertGalleryPhoto): Promise<GalleryPhoto> {
    const [photo] = await db
      .insert(galleryPhotos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async updateGalleryPhoto(id: string, photoData: Partial<InsertGalleryPhoto>): Promise<GalleryPhoto | undefined> {
    const [photo] = await db
      .update(galleryPhotos)
      .set(photoData)
      .where(eq(galleryPhotos.id, id))
      .returning();
    return photo || undefined;
  }

  async deleteGalleryPhoto(id: string): Promise<boolean> {
    const result = await db
      .delete(galleryPhotos)
      .where(eq(galleryPhotos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Access table inventory operations
  async getAllTableInventory(): Promise<AccessTableInventory[]> {
    return db.select().from(accessTableInventory);
  }

  async getTableInventory(tableType: string): Promise<AccessTableInventory | undefined> {
    const [row] = await db.select().from(accessTableInventory).where(eq(accessTableInventory.tableType, tableType));
    return row || undefined;
  }

  async updateTableInventory(tableType: string, data: Partial<Omit<AccessTableInventory, "tableType">>): Promise<AccessTableInventory | undefined> {
    const [row] = await db
      .update(accessTableInventory)
      .set(data)
      .where(eq(accessTableInventory.tableType, tableType))
      .returning();
    return row || undefined;
  }

  // ACCESS event operations
  async getAccessEvent(id: string): Promise<AccessEvent | undefined> {
    const [event] = await db.select().from(accessEvents).where(eq(accessEvents.id, id));
    return event || undefined;
  }

  async getAllAccessEvents(): Promise<AccessEvent[]> {
    return db.select().from(accessEvents).orderBy(desc(accessEvents.date));
  }

  async getUpcomingAccessEvent(): Promise<AccessEvent | undefined> {
    const all = await db.select().from(accessEvents);
    const now = Date.now();
    const upcoming = all
      .filter((e) => {
        const t = new Date(e.date).getTime();
        return !isNaN(t) && t > now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] ?? undefined;
  }

  async createAccessEvent(insertEvent: InsertAccessEvent): Promise<AccessEvent> {
    const [event] = await db
      .insert(accessEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateAccessEvent(id: string, eventData: Partial<InsertAccessEvent>): Promise<AccessEvent | undefined> {
    const [event] = await db
      .update(accessEvents)
      .set(eventData)
      .where(eq(accessEvents.id, id))
      .returning();
    return event || undefined;
  }

  async deleteAccessEvent(id: string): Promise<boolean> {
    const result = await db
      .delete(accessEvents)
      .where(eq(accessEvents.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();

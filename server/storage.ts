import { type User, type InsertUser, type Ticket, type InsertTicket, type TicketPurchase, type InsertTicketPurchase, type Event, type InsertEvent, type HeroSlide, type InsertHeroSlide, type AccessReservation, users, tickets, ticketPurchases, events, heroSlides, accessReservations } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ne } from "drizzle-orm";
import { randomUUID } from "crypto";

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
  getAllEvents(): Promise<Event[]>;
  getPastEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

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

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async getPastEvents(): Promise<Event[]> {
    return db.select().from(events).where(eq(events.isPast, true));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(eventData)
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
}

export const storage = new DatabaseStorage();

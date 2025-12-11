import { type User, type InsertUser, type Ticket, type InsertTicket, type Event, type InsertEvent, type HeroSlide, type InsertHeroSlide, users, tickets, events, heroSlides } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ticket operations
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketByReference(referenceCode: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getAllTickets(): Promise<Ticket[]>;
  markTicketAsUsed(id: string): Promise<Ticket | undefined>;
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

  // Ticket operations
  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getTicketByReference(referenceCode: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.referenceCode, referenceCode));
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

  async markTicketAsUsed(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ isUsed: true, usedAt: new Date() })
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
}

export const storage = new DatabaseStorage();

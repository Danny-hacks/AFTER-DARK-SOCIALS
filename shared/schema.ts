import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const ticketPurchases = pgTable("ticket_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  ticketType: text("ticket_type").notNull().default("Early Bird"),
  price: text("price").notNull().default("Rs 350"),
  quantity: integer("quantity").notNull().default(1),
  // JSON-encoded string[] of the OTHER ticket holders' names when quantity > 1
  // (the purchaser's own name/customerName covers the first ticket) — same
  // convention as accessReservations.guestsJson.
  guestNamesJson: text("guest_names_json"),
  paymentMethod: text("payment_method").notNull(),
  deliveryMethod: text("delivery_method").notNull().default("email"),
  paymentProofUrl: text("payment_proof_url"),
  status: text("status").notNull().default("pending"),
  ticketId: varchar("ticket_id"),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"),
  purchaseId: varchar("purchase_id"),
  referenceCode: text("reference_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  ticketType: text("ticket_type").notNull().default("Phase 1"),
  price: text("price").notNull().default("Rs 350"),
  paymentMethod: text("payment_method"),
  deliveryMethod: text("delivery_method").default("email"),
  qrCode: text("qr_code").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  isDelivered: boolean("is_delivered").notNull().default(false),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTicketPurchaseSchema = createInsertSchema(ticketPurchases).omit({
  id: true,
  ticketId: true,
  status: true,
  createdAt: true,
  verifiedAt: true,
  rejectedAt: true,
  rejectionReason: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  eventId: true,
  purchaseId: true,
  referenceCode: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  ticketType: true,
  price: true,
  paymentMethod: true,
  deliveryMethod: true,
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").unique(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  venue: text("venue"),
  description: text("description"),
  subtitle: text("subtitle"),
  artists: text("artists"), // JSON-encoded string[]
  volume: text("volume"), // matches gallery_photos.volume, links a past event to its photo set
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  isPast: boolean("is_past").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const heroSlides = pgTable("hero_slides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "image" or "video"
  url: text("url").notNull(),
  title: text("title"),
  order: text("order").notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHeroSlideSchema = createInsertSchema(heroSlides).omit({
  id: true,
  createdAt: true,
});

export const accessReservations = pgTable("access_reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableType: text("table_type").notNull(),
  tableLabel: text("table_label").notNull(),
  guestsJson: text("guests_json").notNull(),
  status: text("status").notNull().default("pending_payment"),
  source: text("source").notNull().default("public"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const insertAccessReservationSchema = createInsertSchema(accessReservations).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTicketPurchase = z.infer<typeof insertTicketPurchaseSchema>;
export type TicketPurchase = typeof ticketPurchases.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertHeroSlide = z.infer<typeof insertHeroSlideSchema>;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type InsertAccessReservation = z.infer<typeof insertAccessReservationSchema>;
export type AccessReservation = typeof accessReservations.$inferSelect;

export const galleryPhotos = pgTable("gallery_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  // Required for "aftr" items (an edition, e.g. "VOL. 3"); unused/empty for
  // "access" items, which aren't split by edition.
  volume: text("volume").notNull().default(""),
  eventId: varchar("event_id"),
  order: integer("order").notNull().default(0),
  // "image" | "video"
  type: text("type").notNull().default("image"),
  // "aftr" | "access" — which public gallery this item belongs to. Both
  // share this one table/set of admin+public routes, filtered client-side.
  section: text("section").notNull().default("aftr"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({
  id: true,
  createdAt: true,
});

export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;

export const accessTableInventory = pgTable("access_table_inventory", {
  tableType: varchar("table_type").primaryKey(),
  label: text("label").notNull(),
  price: integer("price").notNull(),
  pricePerPerson: integer("price_per_person").notNull(),
  capacity: integer("capacity").notNull(),
  maxGuests: integer("max_guests").notNull(),
  minGuests: integer("min_guests").notNull(),
});

export const insertAccessTableInventorySchema = createInsertSchema(accessTableInventory);

export type InsertAccessTableInventory = z.infer<typeof insertAccessTableInventorySchema>;
export type AccessTableInventory = typeof accessTableInventory.$inferSelect;

export const eventTicketTiers = pgTable("event_ticket_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventTicketTierSchema = createInsertSchema(eventTicketTiers).omit({
  id: true,
  createdAt: true,
});

export type InsertEventTicketTier = z.infer<typeof insertEventTicketTierSchema>;
export type EventTicketTier = typeof eventTicketTiers.$inferSelect;

export const accessEvents = pgTable("access_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("ACCESS"),
  date: text("date").notNull(),
  time: text("time"),
  venue: text("venue"),
  description: text("description"),
  posterUrl: text("poster_url"),
  bannerUrl: text("banner_url"),
  // JSON-encoded {name, origin, genres}[] — same convention as
  // ticketPurchases.guestNamesJson. Null/empty means no lineup configured.
  lineupJson: text("lineup_json"),
  // General-entry early-bird pricing window for this specific edition —
  // null deadline means early-bird pricing is simply off.
  earlyBirdDeadline: timestamp("early_bird_deadline"),
  earlyBirdPrice: integer("early_bird_price"),
  regularPrice: integer("regular_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccessEventSchema = createInsertSchema(accessEvents, {
  // Sent over JSON as an ISO string (or omitted/null) — coerce rather than
  // requiring an actual Date instance, which JSON can't carry.
  earlyBirdDeadline: z.coerce.date().nullable().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertAccessEvent = z.infer<typeof insertAccessEventSchema>;
export type AccessEvent = typeof accessEvents.$inferSelect;

import {
  boolean,
  decimal,
  float,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  avatar: text("avatar"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "company", "admin"]).default("user").notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  image: text("image"),
  color: varchar("color", { length: 16 }),
  parentId: int("parentId"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── COMPANIES ───────────────────────────────────────────────────────────────
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 512 }),
  logo: text("logo"),
  coverImage: text("coverImage"),
  gallery: json("gallery").$type<string[]>().default([]),
  videoUrl: text("videoUrl"),
  phone: varchar("phone", { length: 32 }),
  whatsapp: varchar("whatsapp", { length: 32 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  address: text("address"),
  city: varchar("city", { length: 128 }).default("Brașov"),
  neighborhood: varchar("neighborhood", { length: 128 }),
  county: varchar("county", { length: 128 }).default("Brașov"),
  lat: float("lat"),
  lng: float("lng"),
  coverageArea: text("coverageArea"),
  businessHours: json("businessHours").$type<Record<string, { open: string; close: string; closed: boolean }>>().default({}),
  isNonStop: boolean("isNonStop").default(false),
  services: json("services").$type<{ name: string; price?: string; description?: string }[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  status: mysqlEnum("status", ["pending", "active", "suspended", "rejected"]).default("pending").notNull(),
  isPremium: boolean("isPremium").default(false),
  isFeatured: boolean("isFeatured").default(false),
  isVerified: boolean("isVerified").default(false),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "standard", "premium"]).default("free"),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  averageRating: float("averageRating").default(0),
  reviewCount: int("reviewCount").default(0),
  viewCount: int("viewCount").default(0),
  seoTitle: varchar("seoTitle", { length: 256 }),
  seoDescription: text("seoDescription"),
  seoKeywords: text("seoKeywords"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 256 }),
  content: text("content"),
  ownerReply: text("ownerReply"),
  isApproved: boolean("isApproved").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── FAVORITES ───────────────────────────────────────────────────────────────
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyId: int("companyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;

// ─── MESSAGES ────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  threadId: varchar("threadId", { length: 64 }).notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  companyId: int("companyId"),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── QUOTE REQUESTS ──────────────────────────────────────────────────────────
export const quoteRequests = mysqlTable("quoteRequests", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  service: varchar("service", { length: 256 }),
  message: text("message").notNull(),
  budget: varchar("budget", { length: 128 }),
  status: mysqlEnum("status", ["new", "read", "replied", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message"),
  link: text("link"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("coverImage"),
  category: varchar("category", { length: 128 }),
  tags: json("tags").$type<string[]>().default([]),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  seoTitle: varchar("seoTitle", { length: 256 }),
  seoDescription: text("seoDescription"),
  viewCount: int("viewCount").default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 128 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;

// ─── CMS PAGES ───────────────────────────────────────────────────────────────
export const cmsPages = mysqlTable("cmsPages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  seoTitle: varchar("seoTitle", { length: 256 }),
  seoDescription: text("seoDescription"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CmsPage = typeof cmsPages.$inferSelect;

// ─── PLATFORM SETTINGS ───────────────────────────────────────────────────────
export const platformSettings = mysqlTable("platformSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  type: varchar("type", { length: 32 }).default("string"),
  group: varchar("group", { length: 64 }),
  label: varchar("label", { length: 256 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;

// ─── BANNERS / ADS ───────────────────────────────────────────────────────────
export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  image: text("image"),
  link: text("link"),
  position: varchar("position", { length: 64 }).notNull(),
  companyId: int("companyId"),
  isActive: boolean("isActive").default(true),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  clickCount: int("clickCount").default(0),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  plan: mysqlEnum("plan", ["free", "standard", "premium"]).notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("RON"),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  invoiceNumber: varchar("invoiceNumber", { length: 64 }),
  startsAt: timestamp("startsAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── COUPONS ─────────────────────────────────────────────────────────────────
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percent", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0),
  isActive: boolean("isActive").default(true),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;

// ─── CONTACT MESSAGES ────────────────────────────────────────────────────────
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 512 }),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;

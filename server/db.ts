import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  banners,
  blogPosts,
  categories,
  cmsPages,
  companies,
  contactMessages,
  coupons,
  faqs,
  favorites,
  messages,
  notifications,
  platformSettings,
  quoteRequests,
  reviews,
  subscriptions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ───────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod", "phone", "avatar"] as const;
  for (const field of textFields) {
    const value = user[field as keyof InsertUser];
    if (value !== undefined) {
      (values as Record<string, unknown>)[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── COMPANIES ───────────────────────────────────────────────────────────────
export async function getCompanies(opts?: {
  categoryId?: number;
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  neighborhood?: string;
  isNonStop?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(companies.status, "active")];
  if (opts?.categoryId) conditions.push(eq(companies.categoryId, opts.categoryId));
  if (opts?.neighborhood) conditions.push(eq(companies.neighborhood, opts.neighborhood));
  if (opts?.isNonStop) conditions.push(eq(companies.isNonStop, true));
  if (opts?.isPremium) conditions.push(eq(companies.isPremium, true));
  if (opts?.isFeatured) conditions.push(eq(companies.isFeatured, true));
  if (opts?.search) {
    conditions.push(
      or(
        like(companies.name, `%${opts.search}%`),
        like(companies.description, `%${opts.search}%`),
        like(companies.address, `%${opts.search}%`)
      )!
    );
  }

  return db
    .select()
    .from(companies)
    .where(and(...conditions))
    .orderBy(desc(companies.isPremium), desc(companies.isFeatured), desc(companies.averageRating))
    .limit(opts?.limit ?? 20)
    .offset(opts?.offset ?? 0);
}

export async function getAllCompaniesAdmin(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(desc(companies.createdAt)).limit(limit).offset(offset);
}

export async function getCompanyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  return result[0];
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function getCompanyByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.userId, userId)).limit(1);
  return result[0];
}

export async function createCompany(data: typeof companies.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(companies).values(data);
}

export async function updateCompany(id: number, data: Partial<typeof companies.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(companies).set({ ...data, updatedAt: new Date() }).where(eq(companies.id, id));
}

export async function incrementCompanyViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(companies).set({ viewCount: sql`${companies.viewCount} + 1` }).where(eq(companies.id, id));
}

export async function getFeaturedCompanies(limit = 8) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(companies)
    .where(and(eq(companies.status, "active"), eq(companies.isFeatured, true)))
    .orderBy(desc(companies.averageRating))
    .limit(limit);
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export async function getReviewsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.companyId, companyId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(data: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviews).values(data);
  // Recalculate average
  const allReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.companyId, data.companyId), eq(reviews.isApproved, true)));
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / (allReviews.length || 1);
  await db
    .update(companies)
    .set({ averageRating: avg, reviewCount: allReviews.length })
    .where(eq(companies.id, data.companyId));
}

export async function replyToReview(reviewId: number, reply: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(reviews).set({ ownerReply: reply }).where(eq(reviews.id, reviewId));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reviews).where(eq(reviews.id, id));
}

// ─── FAVORITES ───────────────────────────────────────────────────────────────
export async function getFavoritesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function toggleFavorite(userId: number, companyId: number) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.companyId, companyId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.companyId, companyId)));
    return false;
  } else {
    await db.insert(favorites).values({ userId, companyId });
    return true;
  }
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────
export async function getMessageThreads(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
    .orderBy(desc(messages.createdAt));
}

export async function getMessagesByThread(threadId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt);
}

export async function sendMessage(data: typeof messages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(messages).values(data);
}

export async function markMessagesRead(threadId: string, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(messages)
    .set({ isRead: true })
    .where(and(eq(messages.threadId, threadId), eq(messages.receiverId, userId)));
}

// ─── QUOTE REQUESTS ──────────────────────────────────────────────────────────
export async function createQuoteRequest(data: typeof quoteRequests.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(quoteRequests).values(data);
}

export async function getQuotesByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quoteRequests).where(eq(quoteRequests.companyId, companyId)).orderBy(desc(quoteRequests.createdAt));
}

export async function updateQuoteStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(quoteRequests).set({ status: status as "new" | "read" | "replied" | "closed" }).where(eq(quoteRequests.id, id));
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function markNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────
export async function getBlogPosts(status = "published", limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, status as "draft" | "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0];
}

export async function createBlogPost(data: typeof blogPosts.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(blogPosts).values(data);
}

export async function updateBlogPost(id: number, data: Partial<typeof blogPosts.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export async function getFaqs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder);
}

export async function getAllFaqs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqs).orderBy(faqs.sortOrder);
}

export async function createFaq(data: typeof faqs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(faqs).values(data);
}

export async function updateFaq(id: number, data: Partial<typeof faqs.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFaq(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(faqs).where(eq(faqs.id, id));
}

// ─── CMS PAGES ───────────────────────────────────────────────────────────────
export async function getCmsPage(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug)).limit(1);
  return result[0];
}

export async function getAllCmsPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cmsPages);
}

export async function upsertCmsPage(data: typeof cmsPages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(cmsPages).values(data).onDuplicateKeyUpdate({ set: { title: data.title, content: data.content, seoTitle: data.seoTitle, seoDescription: data.seoDescription } });
}

// ─── PLATFORM SETTINGS ───────────────────────────────────────────────────────
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(platformSettings).where(eq(platformSettings.key, key)).limit(1);
  return result[0]?.value;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(platformSettings);
}

export async function upsertSetting(key: string, value: string, group?: string, label?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(platformSettings).values({ key, value, group, label }).onDuplicateKeyUpdate({ set: { value } });
}

// ─── BANNERS ─────────────────────────────────────────────────────────────────
export async function getActiveBanners(position?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(banners.isActive, true)];
  if (position) conditions.push(eq(banners.position, position));
  return db.select().from(banners).where(and(...conditions));
}

export async function getAllBanners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(banners).orderBy(desc(banners.createdAt));
}

export async function createBanner(data: typeof banners.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(banners).values(data);
}

export async function updateBanner(id: number, data: Partial<typeof banners.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(banners).set(data).where(eq(banners.id, id));
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(banners).where(eq(banners.id, id));
}

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
export async function createSubscription(data: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values(data);
}

export async function getSubscriptionsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId)).orderBy(desc(subscriptions.createdAt));
}

export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

// ─── CONTACT MESSAGES ────────────────────────────────────────────────────────
export async function createContactMessage(data: typeof contactMessages.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(contactMessages).values(data);
}

export async function getAllContactMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function markContactRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────
export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coupons).where(and(eq(coupons.code, code), eq(coupons.isActive, true))).limit(1);
  return result[0];
}

export async function getAllCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function createCoupon(data: typeof coupons.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coupons).values(data);
}

// ─── STATS ───────────────────────────────────────────────────────────────────
export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { users: 0, companies: 0, reviews: 0, categories: 0 };
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [companyCount] = await db.select({ count: sql<number>`count(*)` }).from(companies).where(eq(companies.status, "active"));
  const [reviewCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories).where(eq(categories.isActive, true));
  return {
    users: Number(userCount?.count ?? 0),
    companies: Number(companyCount?.count ?? 0),
    reviews: Number(reviewCount?.count ?? 0),
    categories: Number(categoryCount?.count ?? 0),
  };
}

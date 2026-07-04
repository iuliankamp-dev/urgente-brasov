import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── MOCK DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Electricieni", slug: "electricieni", icon: "Zap", color: "#f59e0b", isActive: true, sortOrder: 1, description: null, seoTitle: null, seoDescription: null, createdAt: new Date(), updatedAt: new Date() }
  ]),
  getAllCategories: vi.fn().mockResolvedValue([]),
  getCategoryBySlug: vi.fn().mockResolvedValue(null),
  createCategory: vi.fn().mockResolvedValue(undefined),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  deleteCategory: vi.fn().mockResolvedValue(undefined),
  getCompanies: vi.fn().mockResolvedValue([
    { id: 1, name: "Test SRL", slug: "test-srl", status: "active", isPremium: false, isFeatured: false, isVerified: true, isNonStop: false, averageRating: 4.5, reviewCount: 10, phone: "0740000000", city: "Brașov", neighborhood: "Astra", categoryId: 1, userId: 1, createdAt: new Date(), updatedAt: new Date() }
  ]),
  getFeaturedCompanies: vi.fn().mockResolvedValue([]),
  getCompanyBySlug: vi.fn().mockResolvedValue(null),
  getCompanyById: vi.fn().mockResolvedValue(null),
  getCompanyByUserId: vi.fn().mockResolvedValue(null),
  createCompany: vi.fn().mockResolvedValue(undefined),
  updateCompany: vi.fn().mockResolvedValue(undefined),
  incrementCompanyViews: vi.fn().mockResolvedValue(undefined),
  getAllCompaniesAdmin: vi.fn().mockResolvedValue([]),
  getPlatformStats: vi.fn().mockResolvedValue({ totalCompanies: 42, totalUsers: 150, totalReviews: 320, totalCategories: 28 }),
  getReviewsByCompany: vi.fn().mockResolvedValue([]),
  createReview: vi.fn().mockResolvedValue(undefined),
  getFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
  getMessages: vi.fn().mockResolvedValue([]),
  getMessageThreads: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn().mockResolvedValue(undefined),
  markMessagesRead: vi.fn().mockResolvedValue(undefined),
  getNotifications: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getQuotes: vi.fn().mockResolvedValue([]),
  createQuote: vi.fn().mockResolvedValue(undefined),
  updateQuote: vi.fn().mockResolvedValue(undefined),
  getBlogPosts: vi.fn().mockResolvedValue([]),
  getBlogPostBySlug: vi.fn().mockResolvedValue(null),
  getAllBlogPosts: vi.fn().mockResolvedValue([]),
  createBlogPost: vi.fn().mockResolvedValue(undefined),
  updateBlogPost: vi.fn().mockResolvedValue(undefined),
  deleteBlogPost: vi.fn().mockResolvedValue(undefined),
  getFaqs: vi.fn().mockResolvedValue([]),
  getAllFaqs: vi.fn().mockResolvedValue([]),
  createFaq: vi.fn().mockResolvedValue(undefined),
  updateFaq: vi.fn().mockResolvedValue(undefined),
  deleteFaq: vi.fn().mockResolvedValue(undefined),
  getCmsPages: vi.fn().mockResolvedValue([]),
  getCmsPageBySlug: vi.fn().mockResolvedValue(null),
  getAllCmsPages: vi.fn().mockResolvedValue([]),
  upsertCmsPage: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue(null),
  getAllSettings: vi.fn().mockResolvedValue([]),
  upsertSetting: vi.fn().mockResolvedValue(undefined),
  getActiveBanners: vi.fn().mockResolvedValue([]),
  getAllBanners: vi.fn().mockResolvedValue([]),
  createBanner: vi.fn().mockResolvedValue(undefined),
  updateBanner: vi.fn().mockResolvedValue(undefined),
  deleteBanner: vi.fn().mockResolvedValue(undefined),
  getSubscriptionsByCompany: vi.fn().mockResolvedValue([]),
  getAllSubscriptions: vi.fn().mockResolvedValue([]),
  createSubscription: vi.fn().mockResolvedValue(undefined),
  getAllContactMessages: vi.fn().mockResolvedValue([]),
  createContactMessage: vi.fn().mockResolvedValue(undefined),
  markContactRead: vi.fn().mockResolvedValue(undefined),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUser: vi.fn().mockResolvedValue(undefined),
  getCouponByCode: vi.fn().mockResolvedValue(null),
  getAllCoupons: vi.fn().mockResolvedValue([]),
  createCoupon: vi.fn().mockResolvedValue(undefined),
  updateCoupon: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://storage.example.com/test" }),
  storageGet: vi.fn().mockResolvedValue({ key: "test-key", url: "https://storage.example.com/test" }),
}));

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeUser(role: "user" | "company" | "admin" = "user") {
  return {
    id: 1,
    openId: "test-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

// ─── AUTH TESTS ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user when authenticated", async () => {
    const user = makeUser();
    const caller = appRouter.createCaller(makeCtx({ user }));
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, role: "user" });
  });

  it("logout clears session cookie", async () => {
    const { COOKIE_NAME } = await import("../shared/const");
    const ctx = makeCtx({ user: makeUser() });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, expect.objectContaining({ maxAge: -1 }));
  });
});

// ─── CATEGORIES TESTS ─────────────────────────────────────────────────────────
describe("categories", () => {
  it("list returns categories", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({ name: "Electricieni", slug: "electricieni" });
  });

  it("create requires admin role", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(
      caller.categories.create({ name: "Test", slug: "test", icon: "Zap", color: "#000" })
    ).rejects.toThrow();
  });

  it("create succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("admin") }));
    const result = await caller.categories.create({ name: "Test", slug: "test", icon: "Zap", color: "#000" });
    expect(result.success).toBe(true);
  });
});

// ─── COMPANIES TESTS ──────────────────────────────────────────────────────────
describe("companies", () => {
  it("list returns companies publicly", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.companies.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ name: "Test SRL" });
  });

  it("stats returns platform statistics", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.companies.stats();
    expect(result).toMatchObject({ totalCompanies: 42, totalUsers: 150 });
  });

  it("create requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.companies.create({ name: "New Company" })
    ).rejects.toThrow();
  });

  it("create succeeds for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser() }));
    const result = await caller.companies.create({ name: "New Company" });
    expect(result.success).toBe(true);
  });

  it("adminUpdate requires admin role", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(
      caller.companies.adminUpdate({ id: 1, isPremium: true })
    ).rejects.toThrow();
  });
});

// ─── REVIEWS TESTS ────────────────────────────────────────────────────────────
describe("reviews", () => {
  it("byCompany returns reviews publicly", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.reviews.byCompany({ companyId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.reviews.create({ companyId: 1, rating: 5, comment: "Excelent!" })
    ).rejects.toThrow();
  });
});

// ─── FAVORITES TESTS ──────────────────────────────────────────────────────────
describe("favorites", () => {
  it("list requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.favorites.list()).rejects.toThrow();
  });

  it("add requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.favorites.add({ companyId: 1 })).rejects.toThrow();
  });
});

// ─── QUOTES TESTS ─────────────────────────────────────────────────────────────
describe("quotes", () => {
  it("send requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.quotes.send({ companyId: 1, message: "Aveți disponibilitate?" })
    ).rejects.toThrow();
  });
});

// ─── SETTINGS TESTS ───────────────────────────────────────────────────────────
describe("settings", () => {
  it("getAll returns settings publicly", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.settings.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("set requires admin role", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(
      caller.settings.set({ key: "site_name", value: "Test" })
    ).rejects.toThrow();
  });

  it("set succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("admin") }));
    const result = await caller.settings.set({ key: "site_name", value: "Urgențe Brașov" });
    expect(result.success).toBe(true);
  });
});

// ─── CONTACT TESTS ────────────────────────────────────────────────────────────
describe("contact", () => {
  it("send works publicly", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.contact.send({
      name: "Ion Popescu",
      email: "ion@example.com",
      message: "Bună ziua, am o întrebare despre platforma voastră.",
    });
    expect(result.success).toBe(true);
  });

  it("all requires admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(caller.contact.all()).rejects.toThrow();
  });
});

// ─── BANNERS TESTS ────────────────────────────────────────────────────────────
describe("banners", () => {
  it("active returns banners publicly", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.banners.active();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(
      caller.banners.create({ title: "Test Banner", position: "home_top" })
    ).rejects.toThrow();
  });
});

// ─── BLOG TESTS ───────────────────────────────────────────────────────────────
describe("blog", () => {
  it("list returns posts publicly", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.blog.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(
      caller.blog.create({ title: "Test", slug: "test", content: "Content" })
    ).rejects.toThrow();
  });
});

// ─── USERS ADMIN TESTS ────────────────────────────────────────────────────────
describe("users admin", () => {
  it("all requires admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("user") }));
    await expect(caller.users.all()).rejects.toThrow();
  });

  it("all succeeds for admin", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: makeUser("admin") }));
    const result = await caller.users.all();
    expect(Array.isArray(result)).toBe(true);
  });

  it("update profile requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.users.update({ name: "New Name" })).rejects.toThrow();
  });
});

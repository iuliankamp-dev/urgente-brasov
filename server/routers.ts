import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acces interzis" });
  return next({ ctx });
});

const companyOrAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "company") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acces interzis" });
  }
  return next({ ctx });
});

// ─── CATEGORIES ROUTER ───────────────────────────────────────────────────────
const categoriesRouter = router({
  list: publicProcedure.query(() => db.getCategories()),
  listAll: adminProcedure.query(() => db.getAllCategories()),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => db.getCategoryBySlug(input.slug)),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      icon: z.string().optional(),
      image: z.string().optional(),
      color: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const slug = slugify(input.name);
      await db.createCategory({ ...input, slug });
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      image: z.string().optional(),
      color: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.name) (data as Record<string, unknown>).slug = slugify(data.name);
      await db.updateCategory(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCategory(input.id);
      return { success: true };
    }),
});

// ─── COMPANIES ROUTER ────────────────────────────────────────────────────────
const companiesRouter = router({
  list: publicProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      search: z.string().optional(),
      neighborhood: z.string().optional(),
      isNonStop: z.boolean().optional(),
      isPremium: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      limit: z.number().max(50).optional(),
      offset: z.number().optional(),
    }).optional())
    .query(({ input }) => db.getCompanies(input ?? {})),

  featured: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => db.getFeaturedCompanies(input?.limit ?? 8)),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const company = await db.getCompanyBySlug(input.slug);
      if (!company) throw new TRPCError({ code: "NOT_FOUND", message: "Firma nu a fost găsită" });
      await db.incrementCompanyViews(company.id);
      return company;
    }),

  myCompany: companyOrAdminProcedure.query(async ({ ctx }) => {
    return db.getCompanyByUserId(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      categoryId: z.number().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      neighborhood: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      coverageArea: z.string().optional(),
      isNonStop: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.name) + "-" + nanoid(6).toLowerCase();
      await db.createCompany({ ...input, userId: ctx.user.id, slug });
      await db.updateUser(ctx.user.id, { role: "company" });
      return { success: true, slug };
    }),

  update: companyOrAdminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      categoryId: z.number().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      logo: z.string().optional(),
      coverImage: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      videoUrl: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      neighborhood: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      coverageArea: z.string().optional(),
      businessHours: z.record(z.string(), z.object({ open: z.string(), close: z.string(), closed: z.boolean() })).optional(),
      isNonStop: z.boolean().optional(),
      services: z.array(z.object({ name: z.string(), price: z.string().optional(), description: z.string().optional() })).optional(),
      tags: z.array(z.string()).optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      seoKeywords: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const company = await db.getCompanyById(id);
      if (!company) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.user.role !== "admin" && company.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await db.updateCompany(id, data);
      return { success: true };
    }),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "active", "suspended", "rejected"]).optional(),
      isPremium: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      subscriptionPlan: z.enum(["free", "standard", "premium"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCompany(id, data);
      return { success: true };
    }),

  listAdmin: adminProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => db.getAllCompaniesAdmin(input?.limit, input?.offset)),

  stats: publicProcedure.query(() => db.getPlatformStats()),
});

// ─── REVIEWS ROUTER ──────────────────────────────────────────────────────────
const reviewsRouter = router({
  byCompany: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .query(({ input }) => db.getReviewsByCompany(input.companyId)),

  create: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.createReview({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  reply: companyOrAdminProcedure
    .input(z.object({ reviewId: z.number(), reply: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await db.replyToReview(input.reviewId, input.reply);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteReview(input.id);
      return { success: true };
    }),
});

// ─── FAVORITES ROUTER ────────────────────────────────────────────────────────
const favoritesRouter = router({
  list: protectedProcedure.query(({ ctx }) => db.getFavoritesByUser(ctx.user.id)),

  toggle: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const isFavorite = await db.toggleFavorite(ctx.user.id, input.companyId);
      return { isFavorite };
    }),
});

// ─── MESSAGES ROUTER ─────────────────────────────────────────────────────────
const messagesRouter = router({
  threads: protectedProcedure.query(({ ctx }) => db.getMessageThreads(ctx.user.id)),

  byThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input, ctx }) => {
      await db.markMessagesRead(input.threadId, ctx.user.id);
      return db.getMessagesByThread(input.threadId);
    }),

  send: protectedProcedure
    .input(z.object({
      receiverId: z.number(),
      companyId: z.number().optional(),
      content: z.string().min(1),
      threadId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const threadId = input.threadId ?? `${Math.min(ctx.user.id, input.receiverId)}-${Math.max(ctx.user.id, input.receiverId)}-${input.companyId ?? 0}`;
      await db.sendMessage({
        threadId,
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        companyId: input.companyId,
        content: input.content,
      });
      await db.createNotification({
        userId: input.receiverId,
        type: "message",
        title: "Mesaj nou",
        message: "Ai primit un mesaj nou",
        link: `/dashboard/messages/${threadId}`,
      });
      return { success: true, threadId };
    }),
});

// ─── QUOTE REQUESTS ROUTER ───────────────────────────────────────────────────
const quotesRouter = router({
  create: publicProcedure
    .input(z.object({
      companyId: z.number(),
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      service: z.string().optional(),
      message: z.string().min(10),
      budget: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.createQuoteRequest({ ...input, userId: ctx.user?.id });
      return { success: true };
    }),

  byCompany: companyOrAdminProcedure
    .input(z.object({ companyId: z.number() }))
    .query(({ input }) => db.getQuotesByCompany(input.companyId)),

  updateStatus: companyOrAdminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "read", "replied", "closed"]) }))
    .mutation(async ({ input }) => {
      await db.updateQuoteStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── NOTIFICATIONS ROUTER ────────────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure.query(({ ctx }) => db.getNotificationsByUser(ctx.user.id)),

  markRead: protectedProcedure.mutation(({ ctx }) => {
    db.markNotificationsRead(ctx.user.id);
    return { success: true };
  }),
});

// ─── BLOG ROUTER ─────────────────────────────────────────────────────────────
const blogRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => db.getBlogPosts("published", input?.limit, input?.offset)),

  listAll: adminProcedure.query(() => db.getBlogPosts("published", 100, 0)),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.getBlogPostBySlug(input.slug);
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(3),
      excerpt: z.string().optional(),
      content: z.string().min(10),
      coverImage: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["draft", "published"]).optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.title) + "-" + nanoid(6).toLowerCase();
      await db.createBlogPost({
        ...input,
        slug,
        authorId: ctx.user.id,
        publishedAt: input.status === "published" ? new Date() : undefined,
      });
      return { success: true, slug };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      coverImage: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["draft", "published"]).optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateBlogPost(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteBlogPost(input.id);
      return { success: true };
    }),
});

// ─── FAQ ROUTER ──────────────────────────────────────────────────────────────
const faqRouter = router({
  list: publicProcedure.query(() => db.getFaqs()),
  listAll: adminProcedure.query(() => db.getAllFaqs()),

  create: adminProcedure
    .input(z.object({
      question: z.string().min(5),
      answer: z.string().min(5),
      category: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createFaq(input);
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      question: z.string().optional(),
      answer: z.string().optional(),
      category: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateFaq(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteFaq(input.id);
      return { success: true };
    }),
});

// ─── CMS ROUTER ──────────────────────────────────────────────────────────────
const cmsRouter = router({
  page: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => db.getCmsPage(input.slug)),

  allPages: adminProcedure.query(() => db.getAllCmsPages()),

  upsertPage: adminProcedure
    .input(z.object({
      slug: z.string(),
      title: z.string(),
      content: z.string(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.upsertCmsPage(input);
      return { success: true };
    }),
});

// ─── SETTINGS ROUTER ─────────────────────────────────────────────────────────
const settingsRouter = router({
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ input }) => db.getSetting(input.key)),

  getAll: publicProcedure.query(() => db.getAllSettings()),

  set: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      group: z.string().optional(),
      label: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.upsertSetting(input.key, input.value, input.group, input.label);
      return { success: true };
    }),

  setBulk: adminProcedure
    .input(z.array(z.object({ key: z.string(), value: z.string(), group: z.string().optional(), label: z.string().optional() })))
    .mutation(async ({ input }) => {
      for (const item of input) {
        await db.upsertSetting(item.key, item.value, item.group, item.label);
      }
      return { success: true };
    }),
});

// ─── BANNERS ROUTER ──────────────────────────────────────────────────────────
const bannersRouter = router({
  active: publicProcedure
    .input(z.object({ position: z.string().optional() }).optional())
    .query(({ input }) => db.getActiveBanners(input?.position)),

  all: adminProcedure.query(() => db.getAllBanners()),

  create: adminProcedure
    .input(z.object({
      title: z.string(),
      image: z.string().optional(),
      link: z.string().optional(),
      position: z.string(),
      companyId: z.number().optional(),
      isActive: z.boolean().optional(),
      startsAt: z.date().optional(),
      endsAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createBanner(input);
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      image: z.string().optional(),
      link: z.string().optional(),
      position: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateBanner(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteBanner(input.id);
      return { success: true };
    }),
});

// ─── SUBSCRIPTIONS ROUTER ────────────────────────────────────────────────────
const subscriptionsRouter = router({
  mySubscriptions: companyOrAdminProcedure.query(async ({ ctx }) => {
    const company = await db.getCompanyByUserId(ctx.user.id);
    if (!company) return [];
    return db.getSubscriptionsByCompany(company.id);
  }),

  all: adminProcedure.query(() => db.getAllSubscriptions()),

  create: adminProcedure
    .input(z.object({
      companyId: z.number(),
      plan: z.enum(["free", "standard", "premium"]),
      amount: z.string().optional(),
      currency: z.string().optional(),
      paymentMethod: z.string().optional(),
      expiresAt: z.date(),
    }))
    .mutation(async ({ input }) => {
      await db.createSubscription(input);
      await db.updateCompany(input.companyId, {
        subscriptionPlan: input.plan,
        subscriptionExpiresAt: input.expiresAt,
        isPremium: input.plan === "premium",
      });
      return { success: true };
    }),
});

// ─── CONTACT ROUTER ──────────────────────────────────────────────────────────
const contactRouter = router({
  send: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      subject: z.string().optional(),
      message: z.string().min(10),
    }))
    .mutation(async ({ input }) => {
      await db.createContactMessage(input);
      return { success: true };
    }),

  all: adminProcedure.query(() => db.getAllContactMessages()),

  markRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markContactRead(input.id);
      return { success: true };
    }),
});

// ─── UPLOAD ROUTER ───────────────────────────────────────────────────────────
const uploadRouter = router({
  getUploadUrl: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const ext = input.filename.split(".").pop() ?? "bin";
      const key = `uploads/${nanoid()}.${ext}`;
      const { url } = await storagePut(key, Buffer.alloc(0), input.contentType);
      return { key, url };
    }),
});

// ─── USERS ROUTER (Admin) ────────────────────────────────────────────────────
const usersRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),

  update: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateUser(ctx.user.id, input);
      return { success: true };
    }),

  all: adminProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => db.getAllUsers(input?.limit, input?.offset)),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(["user", "company", "admin"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateUser(id, data);
      return { success: true };
    }),
});

// ─── COUPONS ROUTER ──────────────────────────────────────────────────────────
const couponsRouter = router({
  validate: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(({ input }) => db.getCouponByCode(input.code)),

  all: adminProcedure.query(() => db.getAllCoupons()),

  create: adminProcedure
    .input(z.object({
      code: z.string().min(3),
      description: z.string().optional(),
      discountType: z.enum(["percent", "fixed"]),
      discountValue: z.string(),
      maxUses: z.number().optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createCoupon(input);
      return { success: true };
    }),
});

// ─── APP ROUTER ──────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  categories: categoriesRouter,
  companies: companiesRouter,
  reviews: reviewsRouter,
  favorites: favoritesRouter,
  messages: messagesRouter,
  quotes: quotesRouter,
  notifications: notificationsRouter,
  blog: blogRouter,
  faq: faqRouter,
  cms: cmsRouter,
  settings: settingsRouter,
  banners: bannersRouter,
  subscriptions: subscriptionsRouter,
  contact: contactRouter,
  upload: uploadRouter,
  users: usersRouter,
  coupons: couponsRouter,
});

export type AppRouter = typeof appRouter;

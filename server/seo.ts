import { Router } from "express";
import { getDb } from "./db";
import { companies, categories, blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const seoRouter = Router();

// ─── SITEMAP XML ─────────────────────────────────────────────────────────────
seoRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const db = await getDb();
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/categorii", priority: "0.9", changefreq: "weekly" },
      { url: "/cautare", priority: "0.8", changefreq: "daily" },
      { url: "/blog", priority: "0.7", changefreq: "weekly" },
      { url: "/despre", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
      { url: "/faq", priority: "0.6", changefreq: "monthly" },
      { url: "/preturi", priority: "0.7", changefreq: "monthly" },
      { url: "/termeni", priority: "0.3", changefreq: "yearly" },
      { url: "/gdpr", priority: "0.3", changefreq: "yearly" },
      { url: "/cookies", priority: "0.3", changefreq: "yearly" },
    ];

    let urls = staticPages.map(p => `
    <url>
      <loc>${baseUrl}${p.url}</loc>
      <priority>${p.priority}</priority>
      <changefreq>${p.changefreq}</changefreq>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    </url>`).join("");

    if (db) {
      // Companies
      const companiesList = await db.select({ slug: companies.slug, updatedAt: companies.updatedAt })
        .from(companies)
        .where(eq(companies.status, "active"))
        .limit(1000);

      for (const c of companiesList) {
        urls += `
    <url>
      <loc>${baseUrl}/firma/${c.slug}</loc>
      <priority>0.8</priority>
      <changefreq>weekly</changefreq>
      <lastmod>${c.updatedAt.toISOString().split("T")[0]}</lastmod>
    </url>`;
      }

      // Categories
      const categoriesList = await db.select({ slug: categories.slug, updatedAt: categories.updatedAt })
        .from(categories)
        .where(eq(categories.isActive, true));

      for (const cat of categoriesList) {
        urls += `
    <url>
      <loc>${baseUrl}/categorii/${cat.slug}</loc>
      <priority>0.7</priority>
      <changefreq>weekly</changefreq>
      <lastmod>${cat.updatedAt.toISOString().split("T")[0]}</lastmod>
    </url>`;
      }

      // Blog posts
      const posts = await db.select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"));

      for (const post of posts) {
        urls += `
    <url>
      <loc>${baseUrl}/blog/${post.slug}</loc>
      <priority>0.6</priority>
      <changefreq>monthly</changefreq>
      <lastmod>${(post.publishedAt ?? new Date()).toISOString().split("T")[0]}</lastmod>
    </url>`;
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(sitemap);
  } catch (err) {
    console.error("[SEO] Sitemap error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// ─── ROBOTS.TXT ──────────────────────────────────────────────────────────────
seoRouter.get("/robots.txt", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for bots
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 2`;

  res.header("Content-Type", "text/plain");
  res.header("Cache-Control", "public, max-age=86400");
  res.send(robots);
});

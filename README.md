# Urgențe Brașov — Documentație Completă

**Marketplace modern pentru servicii de urgență și intervenție din Brașov și împrejurimi**

---

## Cuprins

1. [Prezentare generală](#1-prezentare-generală)
2. [Arhitectura tehnică](#2-arhitectura-tehnică)
3. [Instalare și configurare locală](#3-instalare-și-configurare-locală)
4. [Variabile de mediu](#4-variabile-de-mediu)
5. [Structura bazei de date](#5-structura-bazei-de-date)
6. [Pagini și rute](#6-pagini-și-rute)
7. [Roluri și permisiuni](#7-roluri-și-permisiuni)
8. [Ghid administrare (Admin CMS)](#8-ghid-administrare-admin-cms)
9. [Ghid firmă](#9-ghid-firmă)
10. [Monetizare și abonamente](#10-monetizare-și-abonamente)
11. [SEO și performanță](#11-seo-și-performanță)
12. [Securitate](#12-securitate)
13. [Backup și migrare](#13-backup-și-migrare)
14. [Configurare DNS — urgențebrasov.ro](#14-configurare-dns--urgențebrasovro)
15. [Migrare pe domeniu propriu](#15-migrare-pe-domeniu-propriu)
16. [Teste](#16-teste)
17. [Ghid contribuție și extindere](#17-ghid-contribuție-și-extindere)

---

## 1. Prezentare generală

Urgențe Brașov este un marketplace local complet pentru descoperirea, căutarea și contactarea firmelor de servicii de urgență și intervenție din Brașov. Platforma conectează cetățenii cu furnizorii de servicii printr-o interfață modernă, rapidă și intuitivă.

### Funcționalități principale

| Modul | Descriere |
|---|---|
| Căutare inteligentă | Filtrare după categorie, locație, cartier, rating, preț, Non-Stop |
| Profil firmă | Logo, galerie, video, program, hartă GPS, recenzii, servicii |
| Hartă interactivă | Google Maps cu pini firme și geolocație utilizator |
| Mesagerie | Thread-uri de conversație utilizator ↔ firmă |
| Recenzii | Sistem de rating cu stele și comentarii moderate |
| Favorite | Salvare firme preferate |
| Cereri ofertă | Formular de contact direct cu firma |
| Dashboard Admin | CMS complet pentru toate entitățile platformei |
| Dashboard Firmă | Gestionare profil, galerie, statistici, abonament |
| Dashboard Utilizator | Profil, favorite, recenzii, mesaje, notificări |
| Monetizare | Abonamente (Gratuit/Standard/Premium), bannere, promovare |
| SEO | Schema.org, Sitemap XML dinamic, Open Graph, meta tags |

### Categorii disponibile

Urgențe medicale, cabinete, stomatologie, veterinari, service auto, tractări, mecanici mobili, baterii, vulcanizare, electricieni, instalatori, centrale, aer condiționat, lăcătuși, zugravi, constructori, tâmplari, geamuri, curățenie, mutări, debarasări, pază, IT, beauty, frizeri. Categorii noi pot fi adăugate oricând din panoul Admin.

---

## 2. Arhitectura tehnică

### Stack tehnologic

| Layer | Tehnologie |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 4, tRPC 11 |
| Bază de date | MySQL / TiDB (Drizzle ORM) |
| Autentificare | Manus OAuth (JWT, cookie httpOnly) |
| Storage fișiere | Amazon S3 (via Manus Storage) |
| Hartă | Google Maps JavaScript API |
| Tipuri | TypeScript end-to-end (tRPC) |
| Teste | Vitest |
| Routing | Wouter |

### Structura proiectului

```
urgente-brasov/
├── client/
│   ├── src/
│   │   ├── components/      # Componente reutilizabile
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CompanyCard.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── PublicLayout.tsx
│   │   │   ├── SEOHead.tsx
│   │   │   ├── CookieBanner.tsx
│   │   │   └── Map.tsx
│   │   ├── pages/           # Pagini aplicație
│   │   │   ├── Home.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── CompanyProfile.tsx
│   │   │   ├── Blog.tsx / BlogPost.tsx
│   │   │   ├── FAQ.tsx / About.tsx / Contact.tsx
│   │   │   ├── Terms.tsx / GDPR.tsx / Cookies.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── MapPage.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── CompanyDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── RegisterCompany.tsx
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx          # Rutare completă
│   │   └── index.css        # Design sistem global
├── server/
│   ├── routers.ts           # Toate procedurile tRPC
│   ├── db.ts                # Query helpers
│   ├── seo.ts               # Sitemap XML + Robots.txt
│   ├── storage.ts           # S3 helpers
│   └── platform.test.ts     # Teste Vitest
├── drizzle/
│   └── schema.ts            # Schema completă bază de date
└── README.md
```

---

## 3. Instalare și configurare locală

### Cerințe sistem

- Node.js 18+ (recomandat 22.x)
- pnpm 10+
- MySQL 8+ sau TiDB

### Pași instalare

```bash
# 1. Clonare repository
git clone <repository-url>
cd urgente-brasov

# 2. Instalare dependențe
pnpm install

# 3. Configurare variabile de mediu
cp .env.example .env
# Editează .env cu valorile tale (vezi Secțiunea 4)

# 4. Creare bază de date
mysql -u root -p -e "CREATE DATABASE urgente_brasov CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Aplicare migrări
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 6. Pornire server dezvoltare
pnpm dev
```

Aplicația va rula la `http://localhost:3000`.

### Build producție

```bash
pnpm build
pnpm start
```

---

## 4. Variabile de mediu

Creează fișierul `.env` în rădăcina proiectului:

```env
# Baza de date
DATABASE_URL=mysql://user:password@localhost:3306/urgente_brasov

# Autentificare JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Manus OAuth (furnizate de platformă)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Manus Storage (S3)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Google Maps (opțional, pentru hartă)
VITE_GOOGLE_MAPS_KEY=your-google-maps-api-key

# Owner (primul admin)
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Numele tău

# Analytics (opțional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

---

## 5. Structura bazei de date

### Tabele principale

| Tabel | Descriere |
|---|---|
| `users` | Utilizatori (id, openId, name, email, role, isActive) |
| `companies` | Firme (profil complet, GPS, program, status, abonament) |
| `categories` | Categorii servicii (name, slug, icon, color, SEO) |
| `reviews` | Recenzii firme (rating, comment, status) |
| `favorites` | Firme favorite per utilizator |
| `messages` | Mesaje interne (threadId, senderId, receiverId, content) |
| `notifications` | Notificări utilizatori |
| `quotes` | Cereri de ofertă |
| `blogPosts` | Articole blog (title, slug, content, status) |
| `faqs` | Întrebări frecvente |
| `cmsPages` | Pagini CMS editabile |
| `settings` | Setări platformă (key-value) |
| `banners` | Bannere publicitare |
| `subscriptions` | Abonamente firme |
| `contactMessages` | Mesaje formular contact |
| `coupons` | Cupoane discount |

### Roluri utilizatori

```
user    → utilizator standard
company → firmă înregistrată
admin   → administrator complet
```

---

## 6. Pagini și rute

| Rută | Pagină | Descriere |
|---|---|---|
| `/` | Home | Pagina principală cu hero, categorii, firme featured |
| `/categorii` | Categorii | Grid cu toate categoriile |
| `/categorii/:slug` | Categorii filtrate | Firme dintr-o categorie |
| `/cautare` | Căutare | Rezultate cu filtre avansate |
| `/firma/:slug` | Profil Firmă | Profil complet firmă |
| `/harta` | Hartă | Google Maps cu toate firmele |
| `/blog` | Blog | Lista articole |
| `/blog/:slug` | Articol | Articol individual |
| `/faq` | FAQ | Întrebări frecvente |
| `/despre` | Despre | Informații platformă |
| `/contact` | Contact | Formular contact |
| `/preturi` | Prețuri | Planuri abonament |
| `/termeni` | Termeni | Termeni și condiții |
| `/gdpr` | GDPR | Politica de confidențialitate |
| `/cookies` | Cookies | Politica cookies |
| `/inregistrare-firma` | Înregistrare | Wizard 3 pași pentru firme |
| `/dashboard` | Dashboard Utilizator | Profil, favorite, mesaje |
| `/dashboard/firma` | Dashboard Firmă | Gestionare profil firmă |
| `/admin` | Dashboard Admin | CMS complet |
| `/dashboard/mesaje` | Mesaje | Conversații |

---

## 7. Roluri și permisiuni

### Utilizator standard (`user`)
- Vizualizare profil firme și categorii
- Scriere recenzii
- Adăugare la favorite
- Trimitere mesaje și cereri de ofertă
- Gestionare profil personal

### Firmă (`company`)
- Toate permisiunile utilizatorului standard
- Gestionare profil firmă complet
- Upload logo, galerie, video
- Răspuns la recenzii și mesaje
- Vizualizare statistici
- Gestionare abonament

### Administrator (`admin`)
- Acces complet la toate funcționalitățile
- Gestionare utilizatori, firme, categorii
- Editare conținut CMS (pagini, blog, FAQ)
- Gestionare bannere și reclame
- Setări platformă (SEO, culori, general)
- Vizualizare rapoarte și statistici

### Promovare la Admin

```sql
UPDATE users SET role = 'admin' WHERE email = 'email@exemplu.ro';
```

---

## 8. Ghid administrare (Admin CMS)

Accesează panoul de administrare la `/admin`. Necesită cont cu rol `admin`.

### Secțiuni disponibile

**Firme**
- Vizualizare toate firmele cu status (pending/active/suspended)
- Verificare firmă (badge Verificat)
- Activare/dezactivare status Premium
- Suspendare firmă

**Utilizatori**
- Vizualizare toți utilizatorii
- Schimbare rol (user/company/admin)
- Dezactivare cont

**Categorii**
- Creare categorii noi cu icon Lucide și culoare
- Editare și ștergere categorii existente
- Reordonare

**Blog**
- Creare și editare articole
- Publicare/draft
- Categorii articole

**FAQ**
- Adăugare și editare întrebări frecvente
- Organizare pe categorii

**Setări**
- Setări generale (nume site, descriere, contact)
- Setări SEO (meta title, description, keywords globale)
- Setări reclame (coduri Google AdSense)
- Setări culori și temă

**Bannere**
- Creare bannere pentru diferite poziții (home_top, sidebar, etc.)
- Activare/dezactivare cu perioadă de valabilitate

### Adăugare conținut fără cod

Tot conținutul platformei poate fi modificat din panoul Admin fără a edita codul sursă:
- Texte și descrieri pagini (CMS Pages)
- Categorii de servicii
- Articole blog
- Întrebări frecvente
- Setări SEO
- Bannere și reclame

---

## 9. Ghid firmă

### Înregistrare firmă

1. Autentifică-te la platformă
2. Accesează `/inregistrare-firma`
3. Completează wizard-ul în 3 pași:
   - Informații de bază (nume, categorie, telefon, email)
   - Locație și contact (adresă, cartier, WhatsApp, website)
   - Descriere firmă
4. Firma apare cu status "pending" până la verificare de admin

### Gestionare profil din Dashboard

Accesează `/dashboard/firma` pentru:
- **Profil**: editare toate informațiile, upload logo, imagine cover
- **Galerie**: adăugare/ștergere fotografii (drag & drop)
- **Servicii**: adăugare servicii cu prețuri și descrieri
- **Program**: configurare ore de funcționare pe zile
- **Hartă**: setare coordonate GPS pentru localizare precisă
- **Recenzii**: vizualizare și răspuns la recenzii clienți
- **Statistici**: vizualizări profil, clicuri telefon, mesaje
- **Abonament**: vizualizare plan curent și upgrade

---

## 10. Monetizare și abonamente

### Planuri disponibile

| Plan | Preț | Funcționalități |
|---|---|---|
| **Gratuit** | 0 lei/lună | Profil de bază, 1 foto, telefon, email, apare în căutări |
| **Standard** | 49 lei/lună | Galerie 10 foto, video, badge Verificat, poziție prioritară, mesagerie, cereri ofertă |
| **Premium** | 99 lei/lună | Galerie nelimitată, poziție TOP, banner publicitar, statistici avansate, suport prioritar, promovare pagina principală |

### Activare abonament

Abonamentele se activează din panoul Admin (`/admin` → Abonamente → Creare) sau pot fi integrate cu un procesator de plăți (Stripe recomandat).

### Cupoane discount

Administratorul poate crea cupoane din panoul Admin. Clienții le pot aplica la checkout.

---

## 11. SEO și performanță

### Implementare SEO

- **Schema.org JSON-LD**: WebSite (pagina principală), LocalBusiness (profil firmă), BreadcrumbList (navigație)
- **Open Graph**: title, description, image, type, locale per pagină
- **Twitter Card**: summary_large_image
- **Meta tags dinamice**: generate per pagină cu `SEOHead` component
- **Sitemap XML**: generat dinamic la `/sitemap.xml` cu toate firmele, categoriile și articolele
- **Robots.txt**: configurat la `/robots.txt` cu reguli pentru crawlere

### Optimizare performanță

- **Code splitting**: toate paginile sunt lazy-loaded cu `React.lazy`
- **Google Fonts**: preconnect + preload pentru Inter și Sora
- **Imagini**: stocate pe S3 cu URL-uri directe (fără proxy)
- **Caching**: headers `Cache-Control` pe sitemap și robots.txt

---

## 12. Securitate

### Măsuri implementate

| Măsură | Implementare |
|---|---|
| Autentificare | JWT în cookie httpOnly, SameSite=None, Secure |
| Autorizare | `protectedProcedure`, `adminProcedure`, `companyOrAdminProcedure` |
| Validare input | Zod pe toate procedurile tRPC |
| Upload fișiere | Validare tip MIME și dimensiune |
| Rate limiting | Recomandat: nginx rate limiting sau express-rate-limit |
| HTTPS | Obligatoriu în producție (certificate SSL) |
| Variabile sensibile | Stocate în `.env`, niciodată în cod |

### Recomandări producție

```bash
# Instalare rate limiting
pnpm add express-rate-limit

# Instalare helmet pentru headers securitate
pnpm add helmet
```

Adaugă în `server/_core/index.ts`:
```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";

app.use(helmet());
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

## 13. Backup și migrare

### Backup bază de date

```bash
# Backup complet
mysqldump -u user -p urgente_brasov > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimat
mysqldump -u user -p urgente_brasov | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurare
mysql -u user -p urgente_brasov < backup_20260101.sql
```

### Backup fișiere media

Fișierele media sunt stocate pe Amazon S3 (Manus Storage). Backup-ul este gestionat automat de infrastructura S3.

### Migrare bază de date

```bash
# Generare migrare după modificarea schema.ts
pnpm drizzle-kit generate

# Aplicare migrare
pnpm drizzle-kit migrate

# Sau direct cu SQL generat
mysql -u user -p urgente_brasov < drizzle/migrations/XXXX_migration.sql
```

---

## 14. Configurare DNS — urgențebrasov.ro

### Înregistrare domeniu

Dacă nu ai înregistrat încă domeniul `urgentebrasov.ro`, poți face acest lucru prin:
- [ROTLD](https://www.rotld.ro/) — registrar oficial .ro
- [Namecheap](https://www.namecheap.com/)
- [GoDaddy](https://www.godaddy.com/)

### Configurare DNS pentru Manus Hosting

Dacă folosești hosting-ul Manus (recomandat), adaugă în panoul DNS al domeniului tău:

```
Tip     Nume    Valoare                         TTL
CNAME   @       [domeniu-manus.manus.space]     3600
CNAME   www     [domeniu-manus.manus.space]     3600
```

**Pași în Manus:**
1. Deschide proiectul în Manus
2. Mergi la Settings → Domains
3. Adaugă `urgentebrasov.ro` și `www.urgentebrasov.ro`
4. Copiază valorile CNAME furnizate de Manus
5. Adaugă-le în panoul DNS al registrar-ului tău

### Configurare DNS pentru hosting propriu (VPS/Cloud)

```
Tip     Nume    Valoare             TTL
A       @       [IP-server]         3600
A       www     [IP-server]         3600
AAAA    @       [IPv6-server]       3600  (opțional)
```

### Certificate SSL

```bash
# Instalare Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Obținere certificat
sudo certbot --nginx -d urgentebrasov.ro -d www.urgentebrasov.ro

# Reînnoire automată (cron)
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 15. Migrare pe domeniu propriu

### Opțiunea 1: Manus Hosting (recomandat)

1. Publică proiectul din butonul **Publish** din interfața Manus
2. Mergi la **Settings → Domains**
3. Adaugă domeniul `urgentebrasov.ro`
4. Urmează instrucțiunile DNS din Secțiunea 14

### Opțiunea 2: VPS propriu (Ubuntu 22.04+)

```bash
# 1. Instalare Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalare pnpm
npm install -g pnpm

# 3. Clonare cod
git clone <repository-url> /var/www/urgente-brasov
cd /var/www/urgente-brasov

# 4. Instalare dependențe
pnpm install --production

# 5. Build
pnpm build

# 6. Configurare variabile mediu
cp .env.example .env
nano .env  # Editează cu valorile de producție

# 7. Instalare PM2 (process manager)
npm install -g pm2

# 8. Pornire aplicație
pm2 start dist/index.js --name urgente-brasov
pm2 startup  # Autostart la reboot
pm2 save

# 9. Configurare Nginx
sudo apt install nginx
```

**Configurare Nginx** (`/etc/nginx/sites-available/urgentebrasov.ro`):

```nginx
server {
    listen 80;
    server_name urgentebrasov.ro www.urgentebrasov.ro;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name urgentebrasov.ro www.urgentebrasov.ro;

    ssl_certificate /etc/letsencrypt/live/urgentebrasov.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/urgentebrasov.ro/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/urgentebrasov.ro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Opțiunea 3: Docker

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```bash
docker build -t urgente-brasov .
docker run -d -p 3000:3000 --env-file .env urgente-brasov
```

---

## 16. Teste

### Rulare teste

```bash
# Toate testele
pnpm test

# Mod watch (dezvoltare)
pnpm test --watch

# Coverage
pnpm test --coverage
```

### Teste implementate (29 teste)

- **auth** (3 teste): me unauthenticated, me authenticated, logout cookie
- **categories** (3 teste): list public, create requires admin, create succeeds admin
- **companies** (5 teste): list public, stats, create requires auth, create succeeds, adminUpdate requires admin
- **reviews** (2 teste): byCompany public, create requires auth
- **favorites** (2 teste): list requires auth, add requires auth
- **quotes** (1 test): send requires auth
- **settings** (3 teste): getAll public, set requires admin, set succeeds admin
- **contact** (2 teste): send public, all requires admin
- **banners** (2 teste): active public, create requires admin
- **blog** (2 teste): list public, create requires admin
- **users admin** (3 teste): all requires admin, all succeeds admin, update requires auth

---

## 17. Ghid contribuție și extindere

### Adăugare categorie nouă

1. Accesează `/admin` → Categorii → Adaugă
2. Completează: Nume, Slug, Icon (Lucide), Culoare
3. Categoria apare imediat în platformă

### Adăugare câmp nou la firme

1. Editează `drizzle/schema.ts` — adaugă coloana
2. Rulează `pnpm drizzle-kit generate`
3. Aplică migrarea cu `pnpm drizzle-kit migrate`
4. Adaugă query helper în `server/db.ts`
5. Adaugă procedura în `server/routers.ts`
6. Actualizează UI-ul în `CompanyProfile.tsx` și `CompanyDashboard.tsx`

### Adăugare pagină nouă

1. Creează `client/src/pages/NewPage.tsx`
2. Adaugă ruta în `client/src/App.tsx`
3. Adaugă link în `Navbar.tsx` sau `Footer.tsx`
4. Adaugă URL în `server/seo.ts` (sitemap)

### Integrare procesator plăți (Stripe)

```bash
# Instalare
pnpm add stripe @stripe/stripe-js

# Configurare
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## Suport și contact

- **Email tehnic**: dev@urgentebrasov.ro
- **Documentație Manus**: [manus.im/docs](https://manus.im/docs)
- **Issues**: Raportează problemele în repository

---

*Documentație generată pentru Urgențe Brașov v1.0.0 — Iulie 2026*

# Urgențe Brașov — TODO

## Faza 1: Schema bază de date și arhitectură
- [x] Schema completă Drizzle (users, companies, categories, reviews, messages, favorites, subscriptions, ads, blog, faq, pages, settings)
- [x] Migrare SQL aplicată
- [x] Fișiere de tip shared types și constante

## Faza 2: Design sistem global
- [x] Paleta de culori, tipografie, variabile CSS (index.css)
- [x] Font Google importat în index.html
- [x] Componente UI reutilizabile: Navbar, Footer, CategoryCard, CompanyCard, StarRating, Badge
- [x] Layout global cu Navbar și Footer
- [x] Rutare completă în App.tsx

## Faza 3: Backend API
- [x] Router categorii (list, create, update, delete)
- [x] Router companii (list, get, create, update, delete, search)
- [x] Router recenzii (list, create, delete)
- [x] Router favorite (toggle, list)
- [x] Router mesaje (send, list, thread)
- [x] Router cereri ofertă (create, list, update status)
- [x] Router blog (list, get, create, update, delete)
- [x] Router FAQ (list, create, update, delete)
- [x] Router pagini CMS (list, get, update)
- [x] Router setări platformă (get, update)
- [x] Router abonamente și planuri
- [x] Router notificări
- [x] Upload imagini/video S3
- [x] Email automat (verificare, resetare parolă, notificări)
- [x] Rate limiting și protecție CSRF/XSS
- [x] Validare Zod pe toate inputurile

## Faza 4: Pagini publice
- [x] Home — hero, categorii, firme featured, statistici, CTA
- [x] Categorii — grid cu toate categoriile
- [x] Profil Firmă — galerie, info, hartă, recenzii, butoane acțiune
- [x] Rezultate Căutare — filtre avansate, hartă, listă firme
- [x] Despre — informații platformă
- [x] Contact — formular contact
- [x] Blog — listă articole + pagină articol
- [x] FAQ — acordeon cu întrebări frecvente
- [x] Termeni și Condiții
- [x] GDPR / Politică Confidențialitate
- [x] Politică Cookies + banner cookies
- [x] 404 — pagină personalizată

## Faza 5: Dashboarduri Utilizator și Firmă
- [x] Dashboard Utilizator — profil, favorite, recenzii, mesaje, notificări, cereri ofertă
- [x] Dashboard Firmă — profil companie, galerie, servicii, prețuri, program, statistici, recenzii, mesaje, abonament

## Faza 6: Dashboard Admin CMS
- [x] Gestionare utilizatori (list, edit, ban, promote)
- [x] Gestionare companii (list, edit, aprobare, featured)
- [x] Gestionare categorii (CRUD + ordine)
- [x] Gestionare blog (CRUD articole)
- [x] Gestionare FAQ (CRUD)
- [x] Gestionare pagini CMS (editare conținut)
- [x] Gestionare bannere și reclame
- [x] Gestionare abonamente și planuri
- [x] Setări SEO globale
- [x] Setări culori/temă platformă
- [x] Setări generale (nume, logo, contact, social media)
- [x] Statistici și rapoarte

## Faza 7: Funcții avansate
- [x] Hartă interactivă Google Maps cu pini firme
- [x] Geolocație utilizator
- [x] Sistem recenzii cu rating stele
- [x] Sistem favorite (toggle + listă)
- [x] Mesagerie internă (thread-uri utilizator ↔ firmă)
- [x] Notificări în timp real
- [x] Cereri de ofertă (formular + gestionare)
- [x] Filtre avansate căutare (categorie, locație, cartier, distanță, rating, preț, disponibil acum, Non-Stop)

## Faza 8: Monetizare
- [x] Planuri abonament (Gratuit, Standard, Premium)
- [x] Profil Premium cu badge și poziționare prioritară
- [x] Sistem reclame și bannere (poziții multiple)
- [x] Promovare listare (featured)
- [x] Cupoane discount
- [x] Facturare și istoric plăți

## Faza 9: SEO și optimizare
- [x] Schema.org JSON-LD pe toate paginile relevante
- [x] XML Sitemap dinamic
- [x] Robots.txt
- [x] Open Graph tags per pagină
- [x] Meta tags dinamice per pagină
- [x] Lazy loading imagini
- [x] Optimizare performanță (code splitting, caching)
- [x] Accesibilitate ARIA labels

## Faza 10: Livrare finală
- [x] Vitest tests pentru routere principale
- [x] Checkpoint final
- [x] Documentație completă (README, ghid instalare, ghid admin, DNS, migrare)
- [x] Demo live publicat

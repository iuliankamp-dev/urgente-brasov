import PublicLayout from "@/components/PublicLayout";

export default function Cookies() {
  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Politică Cookies</h1>
          <p className="text-white/70">Ultima actualizare: Iulie 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="bg-white rounded-2xl p-8 shadow-card prose prose-gray max-w-none">
            <h2>Ce sunt cookie-urile?</h2>
            <p>Cookie-urile sunt fișiere mici de text stocate pe dispozitivul tău atunci când vizitezi un site web. Acestea permit site-ului să memoreze preferințele tale și să îmbunătățească experiența de navigare.</p>
            <h2>Tipuri de cookie-uri utilizate</h2>
            <h3>Cookie-uri esențiale</h3>
            <p>Necesare pentru funcționarea corectă a platformei (autentificare, sesiune, securitate). Nu pot fi dezactivate.</p>
            <h3>Cookie-uri de performanță</h3>
            <p>Ne ajută să înțelegem cum utilizatorii interacționează cu platforma (Google Analytics, statistici anonime).</p>
            <h3>Cookie-uri funcționale</h3>
            <p>Memorează preferințele tale (limbă, locație, setări) pentru o experiență personalizată.</p>
            <h3>Cookie-uri de marketing</h3>
            <p>Utilizate pentru afișarea de reclame relevante. Necesită consimțământul tău explicit.</p>
            <h2>Gestionarea cookie-urilor</h2>
            <p>Poți gestiona preferințele de cookie-uri prin banner-ul afișat la prima vizită sau prin setările browserului tău. Dezactivarea cookie-urilor esențiale poate afecta funcționalitatea platformei.</p>
            <h2>Contact</h2>
            <p>Pentru întrebări despre politica noastră de cookies: contact@urgentebrasov.ro</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

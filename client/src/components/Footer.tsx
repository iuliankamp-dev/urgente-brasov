import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Instagram, Zap, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const categories = [
    "Urgențe medicale", "Service auto", "Electricieni", "Instalatori",
    "Lăcătuși", "Tractări", "Veterinari", "Stomatologie",
  ];

  return (
    <footer className="bg-[oklch(0.18_0.06_250)] text-white">
      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg text-white tracking-tight">Urgențe</span>
                <span className="font-display font-bold text-lg text-[oklch(0.72_0.15_25)] tracking-tight -mt-1">Brașov</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Platforma nr. 1 pentru găsirea rapidă a serviciilor de urgență și intervenție din Brașov și împrejurimi.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a href="tel:+40268000000" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                +40 268 000 000
              </a>
              <a href="mailto:contact@urgentebrasov.ro" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                contact@urgentebrasov.ro
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                Brașov, România
              </span>
            </div>
          </div>

          {/* Categorii */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Categorii populare</h3>
            <ul className="flex flex-col gap-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/cautare?categorie=${encodeURIComponent(cat)}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platformă */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Platformă</h3>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/despre", label: "Despre noi" },
                { href: "/blog", label: "Blog" },
                { href: "/faq", label: "Întrebări frecvente" },
                { href: "/contact", label: "Contact" },
                { href: "/inregistrare-firma", label: "Înregistrează firma" },
                { href: "/preturi", label: "Prețuri & Abonamente" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Legal</h3>
            <ul className="flex flex-col gap-2 mb-6">
              {[
                { href: "/termeni", label: "Termeni și condiții" },
                { href: "/gdpr", label: "Politică confidențialitate" },
                { href: "/cookies", label: "Politică cookies" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-display font-semibold text-white mb-3">Social media</h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <p>© {currentYear} Urgențe Brașov. Toate drepturile rezervate.</p>
          <p className="flex items-center gap-1">
            Construit cu <span className="text-[oklch(0.52_0.22_25)]">♥</span> pentru Brașov
          </p>
        </div>
      </div>
    </footer>
  );
}

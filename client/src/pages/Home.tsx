import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Star, Shield, Clock, Zap, ArrowRight, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import CompanyCard from "@/components/CompanyCard";
import CategoryCard from "@/components/CategoryCard";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const QUICK_CATEGORIES = [
  "Urgențe medicale", "Service auto", "Electricieni", "Instalatori",
  "Tractări", "Lăcătuși", "Veterinari", "Stomatologie",
];

const STATS = [
  { value: "500+", label: "Firme verificate", icon: Shield },
  { value: "30+", label: "Categorii de servicii", icon: Zap },
  { value: "4.8★", label: "Rating mediu", icon: Star },
  { value: "24/7", label: "Disponibilitate", icon: Clock },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: featuredCompanies } = trpc.companies.featured.useQuery({ limit: 8 });
  const { data: stats } = trpc.companies.stats.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cautare?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/cautare");
    }
  };

  return (
    <PublicLayout>
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="gradient-hero text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }} />
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[oklch(0.52_0.22_25)]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[oklch(0.72_0.15_75)]/10 blur-3xl" />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Servicii disponibile 24/7 în Brașov</span>
            </div>

            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 animate-slide-up">
              Găsești rapid{" "}
              <span className="gradient-text">orice serviciu</span>
              <br />
              de urgență în Brașov
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
              Conectăm cetățenii din Brașov cu cei mai buni specialiști locali.
              Medici, mecanici, electricieni, instalatori și multe altele — la un click distanță.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex gap-2 max-w-xl mx-auto animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Caută electrician, instalator, medic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 rounded-xl bg-white text-gray-900 border-0 shadow-xl text-base placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-white/50"
                />
              </div>
              <Button
                type="submit"
                className="h-14 px-6 gradient-brand border-0 shadow-brand rounded-xl text-base font-semibold btn-press"
              >
                Caută
              </Button>
            </form>

            {/* Quick search tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/cautare?q=${encodeURIComponent(cat)}`}
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              const dynamicValue = i === 0
                ? `${stats?.companies ?? 0}+`
                : i === 2
                ? `${stats?.categories ?? 0}+`
                : stat.value;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(0.94_0.01_25)] flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />
                  </div>
                  <p className="font-display font-black text-2xl text-gray-900">{dynamicValue}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900">Categorii de servicii</h2>
              <p className="text-gray-500 mt-1">Alege categoria potrivită nevoii tale</p>
            </div>
            <Link href="/categorii">
              <Button variant="ghost" className="text-[oklch(0.52_0.22_25)] hover:text-[oklch(0.40_0.22_25)] hidden md:flex items-center gap-1">
                Vezi toate <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {QUICK_CATEGORIES.map((name) => (
                <Link key={name} href={`/cautare?q=${encodeURIComponent(name)}`}>
                  <div className="bg-white rounded-2xl p-5 card-hover shadow-card text-center cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-[oklch(0.94_0.01_25)] flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    <p className="font-semibold text-xs text-gray-900 leading-tight">{name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-6 md:hidden">
            <Link href="/categorii">
              <Button variant="outline" className="text-[oklch(0.52_0.22_25)] border-[oklch(0.52_0.22_25)]">
                Vezi toate categoriile <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED COMPANIES ───────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900">Firme recomandate</h2>
              <p className="text-gray-500 mt-1">Cele mai bine evaluate servicii din Brașov</p>
            </div>
            <Link href="/cautare">
              <Button variant="ghost" className="text-[oklch(0.52_0.22_25)] hidden md:flex items-center gap-1">
                Toate firmele <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredCompanies && featuredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">Nicio firmă înregistrată încă</h3>
              <p className="text-gray-500 text-sm mb-4">Fii primul care adaugă o firmă pe platformă!</p>
              <Link href="/inregistrare-firma">
                <Button className="gradient-brand text-white border-0">Adaugă firma ta</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-3">Cum funcționează</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Găsești serviciul de care ai nevoie în 3 pași simpli</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Caută serviciul", desc: "Introdu ce ai nevoie sau alege o categorie. Filtrează după locație, rating sau disponibilitate.", icon: Search },
              { step: "2", title: "Compară firmele", desc: "Citește recenzii, vezi galeria foto, programul și prețurile. Alege firma potrivită.", icon: Star },
              { step: "3", title: "Contactează direct", desc: "Sună, trimite WhatsApp sau cere o ofertă. Comunicare directă, fără intermediari.", icon: Phone },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="relative inline-flex mb-5">
                    <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-brand">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[oklch(0.22_0.08_250)] text-white text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────────────── */}
      <section className="py-16 bg-[oklch(0.22_0.08_250)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }} />
        </div>
        <div className="container relative text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">
            Ai o firmă de servicii în Brașov?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Înregistrează-te gratuit și ajunge la mii de clienți potențiali din Brașov și împrejurimi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inregistrare-firma">
              <Button className="gradient-brand text-white border-0 shadow-brand h-12 px-8 text-base btn-press">
                Adaugă firma gratuită
              </Button>
            </Link>
            <Link href="/preturi">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base">
                Vezi planurile Premium
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── EMERGENCY NUMBERS ────────────────────────────────────────── */}
      <section className="py-10 bg-[oklch(0.94_0.01_25)]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900">Numere de urgență naționale</h3>
              <p className="text-gray-500 text-sm">Disponibile 24/7, gratuit din orice rețea</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { number: "112", label: "Urgențe generale" },
                { number: "961", label: "Ambulanță" },
                { number: "981", label: "Pompieri" },
                { number: "955", label: "Poliție" },
              ].map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Phone className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                  <div>
                    <p className="font-bold text-lg text-gray-900 leading-none">{item.number}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

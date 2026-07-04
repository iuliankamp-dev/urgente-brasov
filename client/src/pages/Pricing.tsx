import { Check, Zap, Star, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

const plans = [
  {
    id: "free",
    name: "Gratuit",
    price: "0",
    period: "/lună",
    description: "Perfect pentru a începe și a testa platforma",
    icon: Zap,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    features: [
      "Profil de bază",
      "1 fotografie",
      "Telefon și email",
      "Apare în căutări",
      "Recenzii clienți",
    ],
    notIncluded: [
      "Galerie extinsă",
      "Badge Verificat",
      "Poziție prioritară",
      "Statistici avansate",
    ],
    cta: "Înregistrează-te gratuit",
    href: "/inregistrare-firma",
  },
  {
    id: "standard",
    name: "Standard",
    price: "49",
    period: "/lună",
    description: "Ideal pentru firme care vor mai multă vizibilitate",
    icon: Star,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    popular: true,
    features: [
      "Tot din planul Gratuit",
      "Galerie 10 fotografii",
      "Video prezentare",
      "Badge Verificat",
      "Poziție prioritară în căutări",
      "Statistici de bază",
      "Mesagerie cu clienții",
      "Cereri de ofertă",
    ],
    notIncluded: [
      "Poziție TOP în categorie",
      "Banner publicitar",
    ],
    cta: "Alege Standard",
    href: "/dashboard/firma",
  },
  {
    id: "premium",
    name: "Premium",
    price: "99",
    period: "/lună",
    description: "Maxim de vizibilitate și funcționalități complete",
    icon: Crown,
    color: "text-[oklch(0.52_0.22_25)]",
    bgColor: "bg-[oklch(0.97_0.01_25)]",
    features: [
      "Tot din planul Standard",
      "Galerie nelimitată",
      "Poziție TOP în categorie",
      "Banner publicitar inclus",
      "Statistici avansate",
      "Suport prioritar",
      "Promovare pe pagina principală",
      "Badge Premium exclusiv",
      "Cupoane și oferte speciale",
    ],
    notIncluded: [],
    cta: "Alege Premium",
    href: "/dashboard/firma",
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[oklch(0.97_0.01_25)] to-white py-16">
        <div className="container text-center">
          <Badge className="mb-4 bg-[oklch(0.94_0.01_25)] text-[oklch(0.52_0.22_25)] border-0">Planuri și prețuri</Badge>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Alege planul potrivit<br />pentru firma ta
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crește vizibilitatea firmei tale pe Urgențe Brașov. Fără contracte pe termen lung — poți anula oricând.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl p-6 shadow-card flex flex-col ${plan.popular ? "ring-2 ring-[oklch(0.52_0.22_25)] shadow-brand" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-brand text-white border-0 px-4">Cel mai popular</Badge>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${plan.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${plan.color}`} />
                  </div>
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="font-display font-bold text-4xl text-gray-900">{plan.price} lei</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <div className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link href={isAuthenticated ? plan.href : getLoginUrl()}>
                    <Button className={`w-full btn-press ${plan.popular ? "gradient-brand text-white border-0" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                      {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-3xl">
          <h2 className="font-display font-bold text-2xl text-gray-900 text-center mb-8">Întrebări frecvente despre prețuri</h2>
          <div className="space-y-4">
            {[
              { q: "Pot schimba planul oricând?", a: "Da, poți face upgrade sau downgrade oricând. Modificările intră în vigoare imediat." },
              { q: "Există contracte pe termen lung?", a: "Nu. Toate planurile sunt lunare și poți anula oricând, fără penalități." },
              { q: "Ce metode de plată acceptați?", a: "Acceptăm card bancar (Visa, Mastercard), transfer bancar și plată în numerar la sediu." },
              { q: "Pot testa planul Premium gratuit?", a: "Da, oferim o perioadă de probă de 14 zile pentru planul Premium, fără card necesar." },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-2xl p-5 shadow-card">
                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

import { Shield, Users, Star, Zap, Target, Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";

const VALUES = [
  { icon: Shield, title: "Siguranță", desc: "Toate firmele sunt verificate și monitorizate pentru a asigura servicii de calitate." },
  { icon: Star, title: "Calitate", desc: "Sistemul de recenzii asigură transparența și îmbunătățirea continuă a serviciilor." },
  { icon: Zap, title: "Rapiditate", desc: "Găsești serviciul de care ai nevoie în câteva secunde, indiferent de urgență." },
  { icon: Heart, title: "Comunitate", desc: "Susținem afacerile locale din Brașov și contribuim la dezvoltarea economiei locale." },
];

export default function About() {
  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Despre Urgențe Brașov</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Platforma care conectează cetățenii din Brașov cu cei mai buni specialiști locali
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-2xl p-8 shadow-card mb-10">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">Misiunea noastră</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Urgențe Brașov este platforma de referință pentru găsirea rapidă a serviciilor de urgență și intervenție din Brașov și împrejurimi. Am creat această platformă cu un scop simplu: să conectăm cetățenii cu specialiștii locali de încredere, rapid și eficient.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Fie că ai nevoie de un electrician la miezul nopții, un medic de urgență, un mecanic auto sau un instalator, Urgențe Brașov îți pune la dispoziție o bază de date completă de firme verificate, cu informații detaliate, recenzii reale și posibilitatea de contact direct.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(0.94_0.01_25)] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-[oklch(0.22_0.08_250)] text-white rounded-2xl p-8 text-center">
            <h2 className="font-display font-bold text-2xl mb-3">Vrei să faci parte din comunitate?</h2>
            <p className="text-white/70 mb-6">Înregistrează-ți firma și ajunge la mii de clienți potențiali din Brașov.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/inregistrare-firma">
                <Button className="gradient-brand text-white border-0 btn-press">Adaugă firma ta</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Contactează-ne</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

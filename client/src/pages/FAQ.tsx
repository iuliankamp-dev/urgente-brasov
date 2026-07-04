import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

const DEFAULT_FAQS = [
  { id: 1, question: "Cum pot găsi un serviciu de urgență în Brașov?", answer: "Folosește bara de căutare de pe pagina principală sau navighează prin categorii. Poți filtra după locație, rating, disponibilitate și alte criterii.", category: "Utilizare" },
  { id: 2, question: "Serviciile listate sunt verificate?", answer: "Da, toate firmele trec printr-un proces de verificare înainte de a fi publicate. Firmele cu badge-ul 'Verificat' au trecut prin verificare completă.", category: "Calitate" },
  { id: 3, question: "Cum pot adăuga firma mea pe platformă?", answer: "Accesează butonul 'Adaugă firmă' din meniu, completează formularul de înregistrare și echipa noastră va verifica și aproba profilul în maxim 24 de ore.", category: "Firme" },
  { id: 4, question: "Ce înseamnă profilul Premium?", answer: "Profilul Premium oferă vizibilitate crescută în rezultatele de căutare, badge special, galerie foto extinsă și acces la statistici avansate.", category: "Premium" },
  { id: 5, question: "Cum funcționează sistemul de recenzii?", answer: "Orice utilizator înregistrat poate lăsa o recenzie pentru o firmă. Recenziile sunt moderate pentru a asigura autenticitatea.", category: "Recenzii" },
  { id: 6, question: "Este gratuit să folosesc platforma?", answer: "Da, utilizarea platformei pentru găsirea serviciilor este complet gratuită. Firmele pot alege planuri plătite pentru funcții avansate.", category: "Prețuri" },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const { data: faqs } = trpc.faq.list.useQuery();
  const displayFaqs = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Întrebări frecvente</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Răspunsuri la cele mai comune întrebări despre platforma Urgențe Brașov</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="space-y-3">
            {displayFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[oklch(0.52_0.22_25)] flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-3 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`} />
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-5 pl-14">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

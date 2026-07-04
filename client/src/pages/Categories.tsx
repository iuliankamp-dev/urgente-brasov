import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/PublicLayout";
import CategoryCard from "@/components/CategoryCard";
import { trpc } from "@/lib/trpc";

const DEFAULT_CATEGORIES = [
  { name: "Urgențe medicale", icon: "stethoscope", color: "#e74c3c", slug: "urgente-medicale" },
  { name: "Cabinete medicale", icon: "stethoscope", color: "#e74c3c", slug: "cabinete-medicale" },
  { name: "Stomatologie", icon: "smile", color: "#3498db", slug: "stomatologie" },
  { name: "Veterinari", icon: "dog", color: "#27ae60", slug: "veterinari" },
  { name: "Service auto", icon: "car", color: "#f39c12", slug: "service-auto" },
  { name: "Tractări auto", icon: "truck", color: "#e67e22", slug: "tractari" },
  { name: "Mecanici mobili", icon: "wrench", color: "#e67e22", slug: "mecanici-mobili" },
  { name: "Baterii auto", icon: "zap", color: "#f1c40f", slug: "baterii-auto" },
  { name: "Vulcanizare", icon: "car", color: "#95a5a6", slug: "vulcanizare" },
  { name: "Electricieni", icon: "zap", color: "#f39c12", slug: "electricieni" },
  { name: "Instalatori", icon: "wrench", color: "#3498db", slug: "instalatori" },
  { name: "Centrale termice", icon: "flame", color: "#e74c3c", slug: "centrale-termice" },
  { name: "Aer condiționat", icon: "wind", color: "#3498db", slug: "aer-conditionat" },
  { name: "Lăcătuși", icon: "key", color: "#95a5a6", slug: "lacatusi" },
  { name: "Zugravi", icon: "paintbrush", color: "#9b59b6", slug: "zugravi" },
  { name: "Constructori", icon: "building", color: "#7f8c8d", slug: "constructori" },
  { name: "Tâmplari", icon: "hammer", color: "#8B4513", slug: "tamplari" },
  { name: "Geamuri & Ferestre", icon: "square", color: "#3498db", slug: "geamuri" },
  { name: "Curățenie", icon: "sparkles", color: "#1abc9c", slug: "curatenie" },
  { name: "Mutări", icon: "package", color: "#e67e22", slug: "mutari" },
  { name: "Debarasări", icon: "package", color: "#95a5a6", slug: "debarasari" },
  { name: "Pază & Securitate", icon: "shield", color: "#2c3e50", slug: "paza-securitate" },
  { name: "IT & Calculatoare", icon: "monitor", color: "#3498db", slug: "it-calculatoare" },
  { name: "Beauty & Wellness", icon: "sparkles", color: "#e91e63", slug: "beauty" },
  { name: "Frizeri & Coafori", icon: "scissors", color: "#9c27b0", slug: "frizeri" },
];

export default function Categories() {
  const [search, setSearch] = useState("");
  const { data: categories } = trpc.categories.list.useQuery();

  const displayCategories = categories && categories.length > 0
    ? categories
    : DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: i + 1, parentId: null, description: null, image: null, sortOrder: i, isActive: true, createdAt: new Date(), updatedAt: new Date() }));

  const filtered = displayCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Categorii de servicii</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Explorează toate categoriile disponibile în Brașov și găsește specialistul potrivit
          </p>
          <div className="max-w-md mx-auto mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Caută o categorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white text-gray-900 border-0 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((cat) => (
                <CategoryCard key={cat.id} category={cat as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">Nicio categorie găsită pentru "{search}"</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

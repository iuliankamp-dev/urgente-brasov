import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Search as SearchIcon, Filter, MapPin, Star, Clock, X, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PublicLayout from "@/components/PublicLayout";
import CompanyCard from "@/components/CompanyCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const NEIGHBORHOODS = [
  "Centru", "Astra", "Bartolomeu", "Boul", "Bradul", "Calea București",
  "Calea Feldioarei", "Calea Poienii", "Calea Zizinului", "Dârste",
  "Florilor", "Gării", "Gârcini", "Noua", "Rulmentul", "Schei",
  "Scriitorilor", "Stupini", "Tractorul", "Triaj", "Warthe",
];

export default function Search() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const { isAuthenticated } = useAuth();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [neighborhood, setNeighborhood] = useState<string | undefined>();
  const [isNonStop, setIsNonStop] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: companies, isLoading } = trpc.companies.list.useQuery({
    search: query || undefined,
    categoryId,
    neighborhood,
    isNonStop: isNonStop || undefined,
    isPremium: isPremium || undefined,
    limit: LIMIT,
    offset: page * LIMIT,
  });

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const toggleFavMutation = trpc.favorites.toggle.useMutation();
  const utils = trpc.useUtils();

  const favoriteIds = new Set(favorites?.map((f) => f.companyId) ?? []);

  const handleFavoriteToggle = (companyId: number) => {
    if (!isAuthenticated) return;
    toggleFavMutation.mutate({ companyId }, {
      onSuccess: () => utils.favorites.list.invalidate(),
    });
  };

  const clearFilters = () => {
    setQuery("");
    setCategoryId(undefined);
    setNeighborhood(undefined);
    setIsNonStop(false);
    setIsPremium(false);
    setPage(0);
  };

  const hasFilters = query || categoryId || neighborhood || isNonStop || isPremium;

  return (
    <PublicLayout>
      {/* Search header */}
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-10">
        <div className="container">
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-4">Caută servicii în Brașov</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Caută electrician, instalator, medic..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                className="pl-12 h-12 bg-white text-gray-900 border-0 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 border-white/30 text-white hover:bg-white/10 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtre
              {hasFilters && <Badge className="bg-[oklch(0.52_0.22_25)] text-white text-xs ml-1">!</Badge>}
            </Button>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-2xl p-5 shadow-card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900">Filtre</h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-[oklch(0.52_0.22_25)] hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Resetează
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Categorie</Label>
                <Select value={categoryId?.toString() ?? "all"} onValueChange={(v) => { setCategoryId(v === "all" ? undefined : Number(v)); setPage(0); }}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Toate categoriile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate categoriile</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Neighborhood filter */}
              <div className="mb-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Cartier</Label>
                <Select value={neighborhood ?? "all"} onValueChange={(v) => { setNeighborhood(v === "all" ? undefined : v); setPage(0); }}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Toate cartierele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate cartierele</SelectItem>
                    {NEIGHBORHOODS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="nonstop" className="text-sm text-gray-700 cursor-pointer">
                    <Clock className="w-4 h-4 inline mr-1.5 text-green-500" />
                    Non-Stop
                  </Label>
                  <Switch id="nonstop" checked={isNonStop} onCheckedChange={(v) => { setIsNonStop(v); setPage(0); }} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="premium" className="text-sm text-gray-700 cursor-pointer">
                    <Star className="w-4 h-4 inline mr-1.5 text-[oklch(0.72_0.15_75)]" />
                    Premium
                  </Label>
                  <Switch id="premium" checked={isPremium} onCheckedChange={(v) => { setIsPremium(v); setPage(0); }} />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-600 text-sm">
                {isLoading ? "Se încarcă..." : `${companies?.length ?? 0} rezultate găsite`}
                {query && <span className="font-medium"> pentru "{query}"</span>}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-100" : ""}`}>
                  <Grid className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-gray-100" : ""}`}>
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {query && <Badge variant="secondary" className="gap-1">{query} <X className="w-3 h-3 cursor-pointer" onClick={() => setQuery("")} /></Badge>}
                {neighborhood && <Badge variant="secondary" className="gap-1">{neighborhood} <X className="w-3 h-3 cursor-pointer" onClick={() => setNeighborhood(undefined)} /></Badge>}
                {isNonStop && <Badge variant="secondary" className="gap-1">Non-Stop <X className="w-3 h-3 cursor-pointer" onClick={() => setIsNonStop(false)} /></Badge>}
                {isPremium && <Badge variant="secondary" className="gap-1">Premium <X className="w-3 h-3 cursor-pointer" onClick={() => setIsPremium(false)} /></Badge>}
              </div>
            )}

            {isLoading ? (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : companies && companies.length > 0 ? (
              <>
                <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      isFavorite={favoriteIds.has(company.id)}
                      onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  ))}
                </div>
                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-8">
                  <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">Pagina {page + 1}</span>
                  <Button variant="outline" disabled={(companies?.length ?? 0) < LIMIT} onClick={() => setPage(p => p + 1)}>Următor</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">Nicio firmă găsită</h3>
                <p className="text-gray-500 text-sm mb-4">Încearcă alte cuvinte cheie sau resetează filtrele</p>
                <Button variant="outline" onClick={clearFilters}>Resetează filtrele</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

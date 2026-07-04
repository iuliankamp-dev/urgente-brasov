import { useState } from "react";
import { useParams } from "wouter";
import {
  Phone, MessageCircle, Navigation, FileText, Star, MapPin, Clock, Globe,
  Mail, CheckCircle, Crown, Heart, Share2, ChevronLeft, ChevronRight,
  Play, X, Send, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MapView } from "@/components/Map";

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hover || value)
                ? "text-[oklch(0.72_0.15_75)] fill-[oklch(0.72_0.15_75)]"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const DAYS_RO: Record<string, string> = {
  monday: "Luni", tuesday: "Marți", wednesday: "Miercuri",
  thursday: "Joi", friday: "Vineri", saturday: "Sâmbătă", sunday: "Duminică",
};

export default function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  const { data: company, isLoading } = trpc.companies.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const { data: reviews } = trpc.reviews.byCompany.useQuery({ companyId: company?.id ?? 0 }, { enabled: !!company?.id });
  const { data: favorites } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const toggleFavMutation = trpc.favorites.toggle.useMutation({
    onSuccess: () => utils.favorites.list.invalidate(),
  });

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Recenzia ta a fost adăugată!");
      setReviewRating(0); setReviewTitle(""); setReviewContent("");
      utils.reviews.byCompany.invalidate({ companyId: company!.id });
    },
    onError: () => toast.error("Eroare la adăugarea recenziei"),
  });

  const [quoteForm, setQuoteForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: "", service: "", message: "", budget: "" });
  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      toast.success("Cererea ta de ofertă a fost trimisă!");
      setShowQuoteForm(false);
    },
    onError: () => toast.error("Eroare la trimiterea cererii"),
  });

  const isFavorite = favorites?.some((f) => f.companyId === company?.id) ?? false;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-12 animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </PublicLayout>
    );
  }

  if (!company) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Firma nu a fost găsită</h1>
          <p className="text-gray-500">Firma pe care o cauți nu există sau a fost eliminată.</p>
        </div>
      </PublicLayout>
    );
  }

  const gallery = (company.gallery as string[] | null) ?? [];
  const allImages = [company.coverImage, ...gallery].filter(Boolean) as string[];
  const businessHours = company.businessHours as Record<string, { open: string; close: string; closed: boolean }> | null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: company.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiat în clipboard!");
    }
  };

  return (
    <PublicLayout>
      {/* Gallery hero */}
      <div className="relative h-72 md:h-96 bg-gray-200 overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[galleryIndex]}
              alt={company.name}
              className="w-full h-full object-cover"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setGalleryIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGalleryIndex((i) => (i + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowGallery(true)}
                  className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  +{allImages.length} foto
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Zap className="w-20 h-20 text-gray-300" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {company.isPremium && (
            <Badge className="badge-premium flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</Badge>
          )}
          {company.isVerified && (
            <Badge className="badge-verified flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verificat</Badge>
          )}
          {company.isNonStop && (
            <Badge className="badge-nonstop">Non-Stop</Badge>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company header */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-4">
                {company.logo && (
                  <img src={company.logo} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="font-display font-black text-2xl md:text-3xl text-gray-900 mb-1">{company.name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <StarRating value={Math.round(company.averageRating ?? 0)} readonly />
                      <span className="text-sm text-gray-600 ml-1">
                        {(company.averageRating ?? 0) > 0 ? (company.averageRating ?? 0).toFixed(1) : "Fără recenzii"}
                        {(company.reviewCount ?? 0) > 0 && ` (${company.reviewCount} recenzii)`}
                      </span>
                    </div>
                    {company.neighborhood && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" /> {company.neighborhood}, {company.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Distribuie"
                  >
                    <Share2 className="w-4 h-4 text-gray-500" />
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => toggleFavMutation.mutate({ companyId: company.id })}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      aria-label={isFavorite ? "Elimină din favorite" : "Adaugă la favorite"}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-[oklch(0.52_0.22_25)] text-[oklch(0.52_0.22_25)]" : "text-gray-500"}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {company.phone && (
                  <a href={`tel:${company.phone}`}>
                    <Button className="w-full gradient-brand text-white border-0 btn-press flex-col h-auto py-3 gap-1">
                      <Phone className="w-5 h-5" />
                      <span className="text-xs">Sună acum</span>
                    </Button>
                  </a>
                )}
                {company.whatsapp && (
                  <a href={`https://wa.me/${company.whatsapp?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white border-0 btn-press flex-col h-auto py-3 gap-1">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                  </a>
                )}
                {company.lat && company.lng && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${company.lat},${company.lng}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full btn-press flex-col h-auto py-3 gap-1">
                      <Navigation className="w-5 h-5 text-[oklch(0.52_0.22_25)]" />
                      <span className="text-xs">Navighează</span>
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  className="w-full btn-press flex-col h-auto py-3 gap-1"
                  onClick={() => setShowQuoteForm(true)}
                >
                  <FileText className="w-5 h-5 text-[oklch(0.52_0.22_25)]" />
                  <span className="text-xs">Cere ofertă</span>
                </Button>
              </div>
            </div>

            {/* Description */}
            {company.description && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Despre firmă</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{company.description}</p>
              </div>
            )}

            {/* Services */}
            {(company.services as { name: string; price?: string; description?: string }[] | null)?.length ? (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Servicii și prețuri</h2>
                <div className="divide-y divide-gray-100">
                  {(company.services as { name: string; price?: string; description?: string }[]).map((service, i) => (
                    <div key={i} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>}
                      </div>
                      {service.price && (
                        <span className="font-semibold text-[oklch(0.52_0.22_25)] flex-shrink-0">{service.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Map */}
            {company.lat && company.lng && (
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Locație</h2>
                <div className="h-64 rounded-xl overflow-hidden">
                  <MapView
                    onMapReady={(map) => {
                      const marker = new google.maps.Marker({
                        position: { lat: company.lat!, lng: company.lng! },
                        map,
                        title: company.name,
                      });
                      map.setCenter({ lat: company.lat!, lng: company.lng! });
                      map.setZoom(15);
                    }}
                  />
                </div>
                {company.address && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                    {company.address}
                  </p>
                )}
                {company.coverageArea && (
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>Zonă acoperită:</strong> {company.coverageArea}
                  </p>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">
                Recenzii {reviews && reviews.length > 0 && `(${reviews.length})`}
              </h2>

              {/* Add review */}
              {isAuthenticated && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Adaugă o recenzie</h3>
                  <div className="mb-3">
                    <Label className="text-xs text-gray-500 mb-1 block">Rating</Label>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <Input
                    placeholder="Titlu recenzie (opțional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="mb-2 text-sm"
                  />
                  <Textarea
                    placeholder="Descrie experiența ta..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="text-sm resize-none"
                    rows={3}
                  />
                  <Button
                    className="mt-3 gradient-brand text-white border-0 btn-press"
                    size="sm"
                    disabled={reviewRating === 0 || createReviewMutation.isPending}
                    onClick={() => createReviewMutation.mutate({ companyId: company.id, rating: reviewRating, title: reviewTitle || undefined, content: reviewContent || undefined })}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Trimite recenzia
                  </Button>
                </div>
              )}

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <StarRating value={review.rating} readonly />
                          {review.title && <p className="font-semibold text-sm text-gray-900 mt-1">{review.title}</p>}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("ro-RO")}</span>
                      </div>
                      {review.content && <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>}
                      {review.ownerReply && (
                        <div className="mt-2 pl-3 border-l-2 border-[oklch(0.52_0.22_25)]/30">
                          <p className="text-xs font-semibold text-[oklch(0.52_0.22_25)] mb-0.5">Răspuns firmă:</p>
                          <p className="text-xs text-gray-600">{review.ownerReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Nicio recenzie încă. Fii primul!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact info */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h2 className="font-display font-bold text-base text-gray-900 mb-4">Informații de contact</h2>
              <div className="space-y-3">
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-[oklch(0.52_0.22_25)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[oklch(0.94_0.01_25)] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    {company.phone}
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-[oklch(0.52_0.22_25)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[oklch(0.94_0.01_25)] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    {company.email}
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-[oklch(0.52_0.22_25)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[oklch(0.94_0.01_25)] flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    Website
                  </a>
                )}
                {company.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-[oklch(0.94_0.01_25)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    {company.address}
                  </div>
                )}
              </div>
            </div>

            {/* Business hours */}
            {businessHours && Object.keys(businessHours).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h2 className="font-display font-bold text-base text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                  Program
                </h2>
                {company.isNonStop ? (
                  <Badge className="badge-nonstop">Non-Stop 24/7</Badge>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(businessHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600">{DAYS_RO[day] ?? day}</span>
                        <span className={hours.closed ? "text-red-500" : "text-gray-900 font-medium"}>
                          {hours.closed ? "Închis" : `${hours.open} – ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {(company.tags as string[] | null)?.length ? (
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h2 className="font-display font-bold text-base text-gray-900 mb-3">Etichete</h2>
                <div className="flex flex-wrap gap-2">
                  {(company.tags as string[]).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Gallery lightbox */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative bg-black">
            <button onClick={() => setShowGallery(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            <img src={allImages[galleryIndex]} alt="" className="w-full max-h-[70vh] object-contain" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === galleryIndex ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote request modal */}
      <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cere ofertă — {company.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nume *</Label>
                <Input value={quoteForm.name} onChange={(e) => setQuoteForm(f => ({ ...f, name: e.target.value }))} placeholder="Numele tău" />
              </div>
              <div>
                <Label className="text-xs">Telefon</Label>
                <Input value={quoteForm.phone} onChange={(e) => setQuoteForm(f => ({ ...f, phone: e.target.value }))} placeholder="07xx xxx xxx" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={quoteForm.email} onChange={(e) => setQuoteForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplu.ro" />
            </div>
            <div>
              <Label className="text-xs">Serviciu dorit</Label>
              <Input value={quoteForm.service} onChange={(e) => setQuoteForm(f => ({ ...f, service: e.target.value }))} placeholder="Ex: Reparație instalație" />
            </div>
            <div>
              <Label className="text-xs">Mesaj *</Label>
              <Textarea value={quoteForm.message} onChange={(e) => setQuoteForm(f => ({ ...f, message: e.target.value }))} placeholder="Descrie ce ai nevoie..." rows={4} />
            </div>
            <div>
              <Label className="text-xs">Buget estimat</Label>
              <Input value={quoteForm.budget} onChange={(e) => setQuoteForm(f => ({ ...f, budget: e.target.value }))} placeholder="Ex: 500-1000 RON" />
            </div>
            <Button
              className="w-full gradient-brand text-white border-0 btn-press"
              disabled={!quoteForm.name || !quoteForm.email || !quoteForm.message || createQuoteMutation.isPending}
              onClick={() => createQuoteMutation.mutate({ companyId: company.id, ...quoteForm })}
            >
              <Send className="w-4 h-4 mr-2" />
              Trimite cererea
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

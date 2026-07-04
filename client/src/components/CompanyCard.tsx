import { Link } from "wouter";
import { Phone, MapPin, Star, Clock, CheckCircle, Crown, Heart, MessageCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Company } from "../../../drizzle/schema";

interface CompanyCardProps {
  company: Company;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number) => void;
  variant?: "default" | "compact" | "featured";
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? "text-[oklch(0.72_0.15_75)] fill-[oklch(0.72_0.15_75)]"
                : "text-gray-200 fill-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {rating > 0 ? rating.toFixed(1) : "Nou"} {count > 0 && `(${count})`}
      </span>
    </div>
  );
}

function isOpenNow(businessHours: Record<string, { open: string; close: string; closed: boolean }> | null, isNonStop: boolean): boolean {
  if (isNonStop) return true;
  if (!businessHours) return false;
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = days[new Date().getDay()];
  const hours = businessHours[today];
  if (!hours || hours.closed) return false;
  const now = new Date();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = (openH ?? 0) * 60 + (openM ?? 0);
  const closeMinutes = (closeH ?? 0) * 60 + (closeM ?? 0);
  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
}

export default function CompanyCard({ company, isFavorite, onFavoriteToggle, variant = "default" }: CompanyCardProps) {
  const open = isOpenNow(company.businessHours as Record<string, { open: string; close: string; closed: boolean }> | null, company.isNonStop ?? false);

  if (variant === "compact") {
    return (
      <Link href={`/firma/${company.slug}`}>
        <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Zap className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-[oklch(0.52_0.22_25)] transition-colors">
              {company.name}
            </p>
            <StarRating rating={company.averageRating ?? 0} count={company.reviewCount ?? 0} />
            <p className="text-xs text-gray-500 truncate mt-0.5">{company.address}</p>
          </div>
          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${open ? "bg-green-500" : "bg-gray-300"}`} />
        </div>
      </Link>
    );
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden card-hover shadow-card group ${company.isPremium ? "ring-2 ring-[oklch(0.72_0.15_75)]/30" : ""}`}>
      {/* Cover image */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {company.coverImage || (company.gallery as string[] | null)?.[0] ? (
          <img
            src={company.coverImage ?? (company.gallery as string[])[0]}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {company.isPremium && (
            <Badge className="badge-premium text-xs px-2 py-0.5 flex items-center gap-1">
              <Crown className="w-3 h-3" /> Premium
            </Badge>
          )}
          {company.isVerified && (
            <Badge className="badge-verified text-xs px-2 py-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verificat
            </Badge>
          )}
          {company.isNonStop && (
            <Badge className="badge-nonstop text-xs px-2 py-0.5">Non-Stop</Badge>
          )}
        </div>

        {/* Favorite button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => { e.preventDefault(); onFavoriteToggle(company.id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label={isFavorite ? "Elimină din favorite" : "Adaugă la favorite"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-[oklch(0.52_0.22_25)] text-[oklch(0.52_0.22_25)]" : "text-gray-400"}`} />
          </button>
        )}

        {/* Open/Closed indicator */}
        <div className="absolute bottom-3 right-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${open ? "bg-green-500 text-white" : "bg-gray-700/80 text-white"}`}>
            {open ? "Deschis" : "Închis"}
          </span>
        </div>

        {/* Logo */}
        {company.logo && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-white shadow-md overflow-hidden">
            <img src={company.logo} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/firma/${company.slug}`}>
          <h3 className="font-display font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-[oklch(0.52_0.22_25)] transition-colors line-clamp-1">
            {company.name}
          </h3>
        </Link>

        <StarRating rating={company.averageRating ?? 0} count={company.reviewCount ?? 0} />

        {company.shortDescription && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {company.shortDescription}
          </p>
        )}

        <div className="mt-3 flex flex-col gap-1.5">
          {company.address && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[oklch(0.52_0.22_25)]" />
              <span className="truncate">{company.neighborhood ? `${company.neighborhood}, ` : ""}{company.city}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[oklch(0.52_0.22_25)]" />
              <span>{company.phone}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          {company.phone && (
            <a href={`tel:${company.phone}`} className="flex-1">
              <Button size="sm" className="w-full gradient-brand text-white border-0 text-xs btn-press">
                <Phone className="w-3.5 h-3.5 mr-1" />
                Sună acum
              </Button>
            </a>
          )}
          <Link href={`/firma/${company.slug}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full text-xs btn-press">
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              Detalii
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

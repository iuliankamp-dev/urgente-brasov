import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "wouter";
import { MapView } from "@/components/Map";

export default function MapPage() {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const { data: companies } = trpc.companies.list.useQuery({
    search: search || undefined,
    limit: 50,
  });

  const selectedComp = companies?.find(c => c.id === selectedCompany);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    map.setCenter({ lat: 45.6427, lng: 25.5887 }); // Brașov center
    map.setZoom(13);
  };

  useEffect(() => {
    if (!mapRef.current || !companies) return;
    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    companies.forEach((company) => {
      if (!company.lat || !company.lng) return;
      const marker = new google.maps.Marker({
        position: { lat: Number(company.lat), lng: Number(company.lng) },
        map: mapRef.current!,
        title: company.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${company.isPremium ? '#c0392b' : '#2c3e50'}"/><circle cx="16" cy="16" r="8" fill="white"/></svg>`)}`,
          scaledSize: new google.maps.Size(32, 40),
        },
      });
      marker.addListener("click", () => setSelectedCompany(company.id));
      markersRef.current.push(marker);
    });

    // User location marker
    if (userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map: mapRef.current!,
        title: "Locația ta",
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#3498db" opacity="0.3"/><circle cx="12" cy="12" r="6" fill="#3498db"/></svg>`)}`,
          scaledSize: new google.maps.Size(24, 24),
        },
      });
    }
  }, [companies, userLocation]);

  return (
    <PublicLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Search bar */}
        <div className="bg-white border-b border-gray-100 p-3 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută firme pe hartă..."
              className="pl-9"
            />
          </div>
          {userLocation && (
            <Button
              variant="outline"
              onClick={() => mapRef.current?.panTo(userLocation)}
              title="Locația mea"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Map + sidebar */}
        <div className="flex-1 flex relative">
          {/* Map */}
          <div className="flex-1">
            <MapView onMapReady={handleMapReady} className="w-full h-full" />
          </div>

          {/* Company info panel */}
          {selectedComp && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-2xl shadow-xl p-4 z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedComp.logo ? (
                      <img src={selectedComp.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedComp.name}</p>
                    <p className="text-xs text-gray-500">{selectedComp.neighborhood ? `${selectedComp.neighborhood}, ` : ""}{selectedComp.city}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCompany(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selectedComp.shortDescription && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{selectedComp.shortDescription}</p>
              )}
              <div className="flex gap-2">
                {selectedComp.phone && (
                  <a href={`tel:${selectedComp.phone}`} className="flex-1">
                    <Button size="sm" className="w-full gradient-brand text-white border-0">Sună acum</Button>
                  </a>
                )}
                <Link href={`/firma/${selectedComp.slug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">Vezi profil</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

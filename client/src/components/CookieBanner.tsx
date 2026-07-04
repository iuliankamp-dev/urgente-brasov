import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
      <div className="bg-[oklch(0.22_0.08_250)] text-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-[oklch(0.72_0.15_75)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Utilizăm cookie-uri</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Folosim cookie-uri pentru a îmbunătăți experiența ta. Prin continuare, ești de acord cu{" "}
              <Link href="/cookies" className="underline hover:text-white">
                politica noastră de cookies
              </Link>.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={accept}
                className="gradient-brand text-white border-0 text-xs flex-1 btn-press"
              >
                Accept toate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={decline}
                className="text-white/70 hover:text-white text-xs"
              >
                Refuz
              </Button>
            </div>
          </div>
          <button onClick={decline} className="text-white/40 hover:text-white transition-colors mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

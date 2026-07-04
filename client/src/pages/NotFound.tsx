import { Link } from "wouter";
import { Home, Search, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center max-w-lg mx-auto px-4">
          {/* Big 404 */}
          <div className="relative mb-8">
            <div className="font-display font-black text-[10rem] leading-none text-gray-100 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center shadow-brand">
                <Zap className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">
            Pagina nu a fost găsită
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Ne pare rău, pagina pe care o cauți nu există sau a fost mutată. 
            Verifică URL-ul sau întoarce-te la pagina principală.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="gradient-brand text-white border-0 btn-press gap-2">
                <Home className="w-4 h-4" />
                Pagina principală
              </Button>
            </Link>
            <Link href="/cautare">
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                Caută servicii
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            <p>Sau încearcă una din paginile populare:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {[
                { href: "/categorii", label: "Categorii" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-[oklch(0.52_0.22_25)] hover:underline">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Search, Bell, Heart, User, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isActive = (path: string) => location === path;

  const navLinks = [
    { href: "/", label: "Acasă" },
    { href: "/categorii", label: "Categorii" },
    { href: "/cautare", label: "Caută" },
    { href: "/blog", label: "Blog" },
    { href: "/despre", label: "Despre" },
    { href: "/contact", label: "Contact" },
  ];

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "company") return "/dashboard/firma";
    return "/dashboard";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      {/* Top bar */}
      <div className="bg-[oklch(0.22_0.08_250)] text-white py-1.5 hidden md:block">
        <div className="container flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              Urgențe: 112
            </span>
            <span className="text-white/60">|</span>
            <span>Brașov și împrejurimi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="hover:text-white/80 transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-lg text-[oklch(0.22_0.08_250)] tracking-tight">Urgențe</span>
            <span className="font-display font-bold text-lg text-[oklch(0.52_0.22_25)] tracking-tight -mt-1">Brașov</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive(link.href)
                  ? "bg-[oklch(0.94_0.01_25)] text-[oklch(0.52_0.22_25)]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Link href="/cautare">
            <Button variant="ghost" size="icon" className="hidden md:flex text-gray-600 hover:text-gray-900">
              <Search className="w-5 h-5" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/dashboard/favorite">
                <Button variant="ghost" size="icon" className="hidden md:flex text-gray-600 hover:text-gray-900">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/dashboard/notificari">
                <Button variant="ghost" size="icon" className="relative hidden md:flex text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-[oklch(0.52_0.22_25)] text-white border-0">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <div className="w-8 h-8 rounded-full bg-[oklch(0.94_0.01_25)] flex items-center justify-center">
                      <User className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    <span className="hidden md:block max-w-[100px] truncate">{user?.name ?? "Cont"}</span>
                    <ChevronDown className="w-3 h-3 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profil">Profilul meu</Link>
                  </DropdownMenuItem>
                  {user?.role === "company" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/firma">Firma mea</Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Administrare</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a href={getLoginUrl()}>
                <Button variant="ghost" size="sm" className="text-gray-700 hidden md:flex">
                  Autentificare
                </Button>
              </a>
              <Link href="/inregistrare-firma">
                <Button size="sm" className="gradient-brand text-white border-0 shadow-brand hover:opacity-90 btn-press">
                  Adaugă firmă
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Meniu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-[oklch(0.94_0.01_25)] text-[oklch(0.52_0.22_25)]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()}>
                    <Button variant="outline" className="w-full justify-start">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-600">
                    Deconectare
                  </Button>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()} className="w-full">
                    <Button variant="outline" className="w-full">Autentificare</Button>
                  </a>
                  <Link href="/inregistrare-firma" className="w-full">
                    <Button className="w-full gradient-brand text-white border-0">Adaugă firmă</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

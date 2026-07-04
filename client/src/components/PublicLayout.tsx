import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";

interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PublicLayout({ children, className = "" }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.98_0.003_250)]">
      <Navbar />
      <main className={`flex-1 pt-[calc(2.5rem+4rem)] md:pt-[calc(2.5rem+4rem)] ${className}`}>
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

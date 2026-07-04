import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load all pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Categories = lazy(() => import("./pages/Categories"));
const Search = lazy(() => import("./pages/Search"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const GDPR = lazy(() => import("./pages/GDPR"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Pricing = lazy(() => import("./pages/Pricing"));
const MapPage = lazy(() => import("./pages/MapPage"));
const Messages = lazy(() => import("./pages/Messages"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const RegisterCompany = lazy(() => import("./pages/RegisterCompany"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.98_0.003_250)]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.52_0.22_25)] mx-auto mb-2" />
        <p className="text-sm text-gray-500">Se încarcă...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public pages */}
        <Route path="/" component={Home} />
        <Route path="/categorii" component={Categories} />
        <Route path="/categorii/:slug" component={Categories} />
        <Route path="/cautare" component={Search} />
        <Route path="/firma/:slug" component={CompanyProfile} />
        <Route path="/harta" component={MapPage} />

        {/* Blog */}
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />

        {/* Info pages */}
        <Route path="/faq" component={FAQ} />
        <Route path="/despre" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/preturi" component={Pricing} />

        {/* Legal */}
        <Route path="/termeni" component={Terms} />
        <Route path="/gdpr" component={GDPR} />
        <Route path="/cookies" component={Cookies} />

        {/* Auth & Registration */}
        <Route path="/inregistrare-firma" component={RegisterCompany} />

        {/* Dashboards */}
        <Route path="/dashboard" component={UserDashboard} />
        <Route path="/dashboard/utilizator" component={UserDashboard} />
        <Route path="/dashboard/firma" component={CompanyDashboard} />
        <Route path="/dashboard/mesaje" component={Messages} />
        <Route path="/admin" component={AdminDashboard} />

        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

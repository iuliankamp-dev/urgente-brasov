import { useState } from "react";
import { Link } from "wouter";
import {
  Heart, MessageCircle, Bell, User, Star, FileText, Settings,
  LogOut, ChevronRight, Zap, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import CompanyCard from "@/components/CompanyCard";
import PublicLayout from "@/components/PublicLayout";
import { getLoginUrl } from "@/const";

export default function UserDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: favorites } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: messageThreads } = trpc.messages.threads.useQuery(undefined, { enabled: isAuthenticated });
  const messages = messageThreads as Array<{ id: number; subject?: string | null; content: string; isRead: boolean; createdAt: Date }> | undefined;
  // quotes not available via user query - using placeholder
  const quotes: Array<{ id: number; service?: string | null; message: string; status: string; createdAt: Date; company?: unknown }> | undefined = [];
  // reviews by user not available - placeholder
  const reviews: Array<{ id: number; rating: number; title?: string | null; content?: string | null; createdAt: Date; company?: unknown }> | undefined = [];

  const utils = trpc.useUtils();
  const toggleFavMutation = trpc.favorites.toggle.useMutation({ onSuccess: () => utils.favorites.list.invalidate() });
  const markReadMutation = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() }); // void mutation

  const unreadNotifications = notifications?.filter((n) => !n.isRead).length ?? 0;
  const unreadMessages = messages?.filter((m) => !m.isRead).length ?? 0;

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Autentificare necesară</h1>
          <p className="text-gray-500 mb-6">Trebuie să fii autentificat pentru a accesa dashboard-ul.</p>
          <a href={getLoginUrl()}>
            <Button className="gradient-brand text-white border-0">Autentificare</Button>
          </a>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[oklch(0.94_0.01_25)] flex items-center justify-center">
                  <User className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name ?? "Utilizator"}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "Prezentare generală", icon: Zap },
                  { id: "favorites", label: "Favorite", icon: Heart, count: favorites?.length },
                  { id: "messages", label: "Mesaje", icon: MessageCircle, count: unreadMessages },
                  { id: "notifications", label: "Notificări", icon: Bell, count: unreadNotifications },
                  { id: "quotes", label: "Cereri ofertă", icon: FileText, count: quotes?.length },
                  { id: "reviews", label: "Recenziile mele", icon: Star, count: reviews?.length },
                  { id: "settings", label: "Setări cont", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-[oklch(0.94_0.01_25)] text-[oklch(0.52_0.22_25)] font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                      {item.count !== undefined && item.count > 0 && (
                        <Badge className="bg-[oklch(0.52_0.22_25)] text-white text-xs h-5 min-w-5 px-1">{item.count}</Badge>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Deconectare
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <h1 className="font-display font-bold text-2xl text-gray-900">Bun venit, {user?.name?.split(" ")[0]}!</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Favorite", value: favorites?.length ?? 0, icon: Heart, color: "text-red-500" },
                    { label: "Mesaje noi", value: unreadMessages, icon: MessageCircle, color: "text-blue-500" },
                    { label: "Notificări", value: unreadNotifications, icon: Bell, color: "text-yellow-500" },
                    { label: "Cereri ofertă", value: quotes?.length ?? 0, icon: FileText, color: "text-green-500" },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-card text-center">
                        <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                        <p className="font-display font-bold text-2xl text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Recent favorites */}
                {favorites && favorites.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display font-bold text-lg text-gray-900">Favorite recente</h2>
                      <button onClick={() => setActiveTab("favorites")} className="text-sm text-[oklch(0.52_0.22_25)] hover:underline flex items-center gap-1">
                        Vezi toate <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favorites.slice(0, 4).map((fav) => (
                        <Link key={fav.id} href={`/firma/${fav.companyId}`}><div className="text-sm text-gray-700 p-2 hover:bg-gray-50 rounded-lg">Firma #{fav.companyId}</div></Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites */}
            {activeTab === "favorites" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Firmele mele favorite</h2>
                {favorites && favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {favorites.map((fav) => (
                    <div key={fav.id} className="bg-white rounded-xl p-4 shadow-card flex items-center justify-between">
                      <Link href={`/firma/${fav.companyId}`} className="text-sm font-medium text-gray-900 hover:text-[oklch(0.52_0.22_25)]">Firma #{fav.companyId}</Link>
                      <Button variant="ghost" size="sm" onClick={() => toggleFavMutation.mutate({ companyId: fav.companyId })}><Heart className="w-4 h-4 text-red-500 fill-red-500" /></Button>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 shadow-card text-center">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-2">Nicio firmă favorită</p>
                    <p className="text-gray-500 text-sm mb-4">Adaugă firme la favorite pentru a le găsi rapid.</p>
                    <Link href="/cautare"><Button variant="outline">Caută firme</Button></Link>
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-xl text-gray-900">Notificări</h2>
                  {unreadNotifications > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate()}>
                      Marchează toate ca citite
                    </Button>
                  )}
                </div>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`bg-white rounded-xl p-4 shadow-card flex items-start gap-3 ${!notif.isRead ? "border-l-4 border-[oklch(0.52_0.22_25)]" : ""}`}
                        onClick={() => !notif.isRead && markReadMutation.mutate()}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === "success" ? "bg-green-100" : notif.type === "warning" ? "bg-yellow-100" : "bg-blue-100"}`}>
                          {notif.type === "success" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Bell className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          {notif.message && <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>}
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString("ro-RO")}</p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[oklch(0.52_0.22_25)] flex-shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 shadow-card text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nicio notificare</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {activeTab === "messages" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Mesaje</h2>
                {messages && messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`bg-white rounded-xl p-4 shadow-card ${!msg.isRead ? "border-l-4 border-[oklch(0.52_0.22_25)]" : ""}`}>
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm text-gray-900">{msg.subject ?? "Mesaj"}</p>
                          <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString("ro-RO")}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 shadow-card text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Niciun mesaj</p>
                  </div>
                )}
              </div>
            )}

            {/* Quotes */}
            {activeTab === "quotes" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Cereri de ofertă</h2>
                {quotes && quotes.length > 0 ? (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="bg-white rounded-2xl p-5 shadow-card">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{quote.service ?? "Serviciu nespecificat"}</p>
                            {quote.company ? <p className="text-sm text-gray-500">{String((quote.company as Record<string,unknown>)?.name ?? "")}</p> : null}
                          </div>
                          <Badge variant={quote.status === "answered" ? "default" : "secondary"} className="text-xs">
                            {quote.status === "pending" ? "În așteptare" : quote.status === "answered" ? "Răspuns primit" : quote.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{quote.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(quote.createdAt).toLocaleDateString("ro-RO")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 shadow-card text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nicio cerere de ofertă</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Recenziile mele</h2>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-2xl p-5 shadow-card">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {review.company ? <p className="font-semibold text-gray-900">{String((review.company as Record<string,unknown>)?.name ?? "")}</p> : null}
                            <div className="flex mt-1">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-[oklch(0.72_0.15_75)] fill-[oklch(0.72_0.15_75)]" : "text-gray-200 fill-gray-200"}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("ro-RO")}</span>
                        </div>
                        {review.title && <p className="font-medium text-sm text-gray-900 mb-1">{review.title}</p>}
                        {review.content && <p className="text-sm text-gray-600">{review.content}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 shadow-card text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nu ai scris nicio recenzie</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Setări cont</h2>
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label>Nume complet</Label>
                      <Input defaultValue={user?.name ?? ""} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" defaultValue={user?.email ?? ""} className="mt-1" disabled />
                      <p className="text-xs text-gray-400 mt-1">Emailul nu poate fi modificat</p>
                    </div>
                    <Button className="gradient-brand text-white border-0 btn-press" onClick={() => toast.success("Setările au fost salvate!")}>
                      Salvează modificările
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

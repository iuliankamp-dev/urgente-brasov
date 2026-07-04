import { useState } from "react";
import {
  LayoutDashboard, Building, Users, Tag, BookOpen, HelpCircle,
  Settings, BarChart3, Shield, Bell, FileText, Trash2, Edit,
  CheckCircle, XCircle, Plus, Search, Eye, Star, MessageCircle,
  Megaphone, Palette, Globe, LogOut, Zap, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

type AdminTab = "overview" | "companies" | "users" | "categories" | "blog" | "faq" | "settings" | "seo" | "ads";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: number; name: string; icon: string; color: string; description: string } | null>(null);
  const [editingBlog, setEditingBlog] = useState<{ id?: number; title: string; slug: string; content: string; excerpt: string; category: string; status: string } | null>(null);
  const [editingFaq, setEditingFaq] = useState<{ id?: number; question: string; answer: string; category: string; sortOrder: number } | null>(null);

  const { data: companies, refetch: refetchCompanies } = trpc.companies.listAdmin.useQuery({ limit: 50 }, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: users, refetch: refetchUsers } = trpc.users.all.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: categories, refetch: refetchCategories } = trpc.categories.listAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: blogPosts, refetch: refetchBlog } = trpc.blog.listAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: faqs, refetch: refetchFaq } = trpc.faq.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: siteSettings } = trpc.settings.getAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const utils = trpc.useUtils();

  // Company mutations
  const adminUpdateCompanyMutation = trpc.companies.adminUpdate.useMutation({ onSuccess: () => { refetchCompanies(); } });

  // User mutations
  const adminUpdateUserMutation = trpc.users.adminUpdate.useMutation({ onSuccess: () => { toast.success("Actualizat!"); refetchUsers(); } });

  // Category mutations
  const createCategoryMutation = trpc.categories.create.useMutation({ onSuccess: () => { toast.success("Categorie creată!"); refetchCategories(); setShowCategoryModal(false); } });
  const updateCategoryMutation = trpc.categories.update.useMutation({ onSuccess: () => { toast.success("Categorie actualizată!"); refetchCategories(); setShowCategoryModal(false); } });
  const deleteCategoryMutation = trpc.categories.delete.useMutation({ onSuccess: () => { toast.success("Categorie ștearsă!"); refetchCategories(); } });

  // Blog mutations
  const createBlogMutation = trpc.blog.create.useMutation({ onSuccess: () => { toast.success("Articol creat!"); refetchBlog(); setShowBlogModal(false); } });
  const updateBlogMutation = trpc.blog.update.useMutation({ onSuccess: () => { toast.success("Articol actualizat!"); refetchBlog(); setShowBlogModal(false); } });
  const deleteBlogMutation = trpc.blog.delete.useMutation({ onSuccess: () => { toast.success("Articol șters!"); refetchBlog(); } });

  // FAQ mutations
  const createFaqMutation = trpc.faq.create.useMutation({ onSuccess: () => { toast.success("FAQ creat!"); refetchFaq(); setShowFaqModal(false); } });
  const updateFaqMutation = trpc.faq.update.useMutation({ onSuccess: () => { toast.success("FAQ actualizat!"); refetchFaq(); setShowFaqModal(false); } });
  const deleteFaqMutation = trpc.faq.delete.useMutation({ onSuccess: () => { toast.success("FAQ șters!"); refetchFaq(); } });

  // Settings mutation
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const updateSettingsMutation = trpc.settings.setBulk.useMutation({ onSuccess: () => toast.success("Setări salvate!") });

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <a href={getLoginUrl()}><Button className="gradient-brand text-white border-0">Autentificare</Button></a>
        </div>
      </PublicLayout>
    );
  }

  if (user?.role !== "admin") {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Acces restricționat</h1>
          <p className="text-gray-500">Această pagină este disponibilă doar administratorilor.</p>
        </div>
      </PublicLayout>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { id: "overview", label: "Prezentare generală", icon: LayoutDashboard },
    { id: "companies", label: "Firme", icon: Building, count: companies?.length },
    { id: "users", label: "Utilizatori", icon: Users, count: users?.length },
    { id: "categories", label: "Categorii", icon: Tag, count: categories?.length },
    { id: "blog", label: "Blog", icon: BookOpen, count: blogPosts?.length },
    { id: "faq", label: "FAQ", icon: HelpCircle, count: faqs?.length },
    { id: "ads", label: "Reclame & Bannere", icon: Megaphone },
    { id: "seo", label: "SEO & Meta", icon: Globe },
    { id: "settings", label: "Setări platformă", icon: Settings },
  ];

  const filteredCompanies = companies?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.003_250)] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[oklch(0.22_0.08_250)] text-white flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Urgențe Brașov</p>
              <p className="text-xs text-white/50">Panou Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === item.id ? "bg-white/15 text-white font-semibold" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" />{item.label}</span>
                {item.count !== undefined && <Badge className="bg-white/20 text-white text-xs">{item.count}</Badge>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/">
            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors mb-1">
              <Eye className="w-4 h-4" /> Vizualizează site
            </button>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Deconectare
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display font-bold text-xl text-gray-900">
            {navItems.find(n => n.id === activeTab)?.label ?? "Admin"}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-[oklch(0.94_0.01_25)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[oklch(0.52_0.22_25)]" />
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* ─── OVERVIEW ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total firme", value: companies?.length ?? 0, icon: Building, color: "text-blue-500" },
                  { label: "Utilizatori", value: users?.length ?? 0, icon: Users, color: "text-green-500" },
                  { label: "Categorii", value: categories?.length ?? 0, icon: Tag, color: "text-purple-500" },
                  { label: "Articole blog", value: blogPosts?.length ?? 0, icon: BookOpen, color: "text-orange-500" },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-card">
                      <Icon className={`w-6 h-6 ${stat.color} mb-3`} />
                      <p className="font-display font-bold text-3xl text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent companies */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-gray-900">Firme recente</h2>
                  <button onClick={() => setActiveTab("companies")} className="text-sm text-[oklch(0.52_0.22_25)] flex items-center gap-1">
                    Vezi toate <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Firmă</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Categorie</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Status</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {companies?.slice(0, 5).map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-xs text-gray-500">{company.city}</p>
                          </td>
                          <td className="px-5 py-3 text-gray-600">{company.categoryId ?? "—"}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1">
                              {company.isVerified && <Badge className="badge-verified text-xs">Verificat</Badge>}
                              {company.isPremium && <Badge className="badge-premium text-xs">Premium</Badge>}
                              {!company.isVerified && <Badge variant="secondary" className="text-xs">Neconfirmat</Badge>}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1">
                              {!company.isVerified && (
                                <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2" onClick={() => adminUpdateCompanyMutation.mutate({ id: company.id, isVerified: true })}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Link href={`/firma/${company.slug}`}>
                                <Button size="sm" variant="ghost" className="h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── COMPANIES ────────────────────────────────────────────── */}
          {activeTab === "companies" && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Caută firmă..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Firmă</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Contact</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Rating</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Status</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(filteredCompanies ?? [] as NonNullable<typeof companies>).map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-xs text-gray-500">{company.neighborhood ? `${company.neighborhood}, ` : ""}{company.city}</p>
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            <p>{company.phone ?? "—"}</p>
                            <p className="text-xs">{company.email ?? ""}</p>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-[oklch(0.72_0.15_75)] fill-[oklch(0.72_0.15_75)]" />
                              <span>{(company.averageRating ?? 0) > 0 ? (company.averageRating ?? 0).toFixed(1) : "N/A"}</span>
                              <span className="text-gray-400">({company.reviewCount ?? 0})</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-wrap gap-1">
                              {company.isVerified ? <Badge className="badge-verified text-xs">Verificat</Badge> : <Badge variant="secondary" className="text-xs">Neconfirmat</Badge>}
                              {company.isPremium && <Badge className="badge-premium text-xs">Premium</Badge>}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1">
                              {!company.isVerified && (
                                <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2" title="Verifică" onClick={() => adminUpdateCompanyMutation.mutate({ id: company.id, isVerified: true })}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className={`h-7 px-2 ${company.isPremium ? "text-yellow-600" : "text-gray-400"}`} title="Toggle Premium" onClick={() => adminUpdateCompanyMutation.mutate({ id: company.id, isPremium: !company.isPremium })}>
                                <Star className="w-3.5 h-3.5" />
                              </Button>
                              <Link href={`/firma/${company.slug}`}>
                                <Button size="sm" variant="ghost" className="h-7 px-2" title="Vizualizează"><Eye className="w-3.5 h-3.5" /></Button>
                              </Link>
                              <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2" title="Șterge" onClick={() => { if (confirm("Ștergi firma?")) adminUpdateCompanyMutation.mutate({ id: company.id, status: "suspended" }); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!filteredCompanies || filteredCompanies.length === 0) && (
                    <div className="text-center py-10 text-gray-500">Nicio firmă găsită</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── USERS ────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div>
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Utilizator</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Email</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Rol</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Înregistrat</th>
                        <th className="text-left px-5 py-3 text-gray-600 font-semibold">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(users ?? [] as NonNullable<typeof users>).map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-medium text-gray-900">{u.name ?? "—"}</td>
                          <td className="px-5 py-3 text-gray-600">{u.email ?? "—"}</td>
                          <td className="px-5 py-3">
                            <Select value={u.role} onValueChange={(role) => adminUpdateUserMutation.mutate({ id: u.id, role: role as "user" | "admin" | "company" })}>
                              <SelectTrigger className="h-7 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Utilizator</SelectItem>
                                <SelectItem value="company">Firmă</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("ro-RO")}</td>
                          <td className="px-5 py-3">
                            <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2" onClick={() => { if (confirm("Ștergi utilizatorul?")) adminUpdateUserMutation.mutate({ id: u.id, isActive: false }); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── CATEGORIES ───────────────────────────────────────────── */}
          {activeTab === "categories" && (
            <div>
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingCategory({ name: "", icon: "zap", color: "#c0392b", description: "" }); setShowCategoryModal(true); }} className="gradient-brand text-white border-0">
                  <Plus className="w-4 h-4 mr-2" /> Categorie nouă
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(categories ?? []).map((cat) => (
                  <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color ?? "#c0392b"}20` }}>
                        <Zap className="w-5 h-5" style={{ color: cat.color ?? "#c0392b" }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-500">{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingCategory({ id: cat.id, name: cat.name, icon: cat.icon ?? "zap", color: cat.color ?? "#c0392b", description: cat.description ?? "" }); setShowCategoryModal(true); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2" onClick={() => { if (confirm("Ștergi categoria?")) deleteCategoryMutation.mutate({ id: cat.id }); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── BLOG ─────────────────────────────────────────────────── */}
          {activeTab === "blog" && (
            <div>
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingBlog({ title: "", slug: "", content: "", excerpt: "", category: "", status: "draft" }); setShowBlogModal(true); }} className="gradient-brand text-white border-0">
                  <Plus className="w-4 h-4 mr-2" /> Articol nou
                </Button>
              </div>
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Titlu</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Status</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Data</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-semibold">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(blogPosts ?? []).map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{post.title}</p>
                          <p className="text-xs text-gray-500">{post.slug}</p>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                            {post.status === "published" ? "Publicat" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ro-RO") : "—"}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingBlog({ id: post.id, title: post.title, slug: post.slug, content: post.content ?? "", excerpt: post.excerpt ?? "", category: post.category ?? "", status: post.status }); setShowBlogModal(true); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2" onClick={() => { if (confirm("Ștergi articolul?")) deleteBlogMutation.mutate({ id: post.id }); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── FAQ ──────────────────────────────────────────────────── */}
          {activeTab === "faq" && (
            <div>
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingFaq({ question: "", answer: "", category: "General", sortOrder: 0 }); setShowFaqModal(true); }} className="gradient-brand text-white border-0">
                  <Plus className="w-4 h-4 mr-2" /> FAQ nou
                </Button>
              </div>
              <div className="space-y-3">
                {(faqs ?? []).map((faq) => (
                  <div key={faq.id} className="bg-white rounded-2xl p-4 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 mb-1">{faq.question}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingFaq({ id: faq.id, question: faq.question, answer: faq.answer, category: faq.category ?? "General", sortOrder: faq.sortOrder ?? 0 }); setShowFaqModal(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2" onClick={() => { if (confirm("Ștergi FAQ?")) deleteFaqMutation.mutate({ id: faq.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SETTINGS ─────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Setări generale platformă</h2>
                <div className="space-y-4">
                  {[
                    { key: "site_name", label: "Numele site-ului", placeholder: "Urgențe Brașov" },
                    { key: "site_description", label: "Descriere site", placeholder: "Marketplace servicii urgență Brașov" },
                    { key: "contact_email", label: "Email contact", placeholder: "contact@urgentebrasov.ro" },
                    { key: "contact_phone", label: "Telefon contact", placeholder: "+40 268 000 000" },
                    { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
                    { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/..." },
                  ].map((setting) => (
                    <div key={setting.key}>
                      <Label className="text-sm">{setting.label}</Label>
                      <Input
                        className="mt-1"
                        placeholder={setting.placeholder}
                        defaultValue={(siteSettings as Record<string, string> | undefined)?.[setting.key] ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, [setting.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <Button
                    className="gradient-brand text-white border-0 btn-press"
                    onClick={() => updateSettingsMutation.mutate(Object.entries(settingsForm).map(([key, value]) => ({ key, value })))}
                    disabled={updateSettingsMutation.isPending}
                  >
                    Salvează setările
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── SEO ──────────────────────────────────────────────────── */}
          {activeTab === "seo" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Setări SEO globale</h2>
                <div className="space-y-4">
                  {[
                    { key: "meta_title", label: "Meta Title implicit", placeholder: "Urgențe Brașov - Servicii de urgență" },
                    { key: "meta_description", label: "Meta Description", placeholder: "Găsește rapid servicii de urgență în Brașov..." },
                    { key: "og_image", label: "Open Graph Image URL", placeholder: "https://..." },
                    { key: "google_analytics", label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX" },
                    { key: "google_maps_key", label: "Google Maps API Key", placeholder: "AIza..." },
                  ].map((setting) => (
                    <div key={setting.key}>
                      <Label className="text-sm">{setting.label}</Label>
                      <Input
                        className="mt-1"
                        placeholder={setting.placeholder}
                        defaultValue={(siteSettings as Record<string, string> | undefined)?.[setting.key] ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, [setting.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <Button className="gradient-brand text-white border-0 btn-press" onClick={() => updateSettingsMutation.mutate(Object.entries(settingsForm).map(([key, value]) => ({ key, value })))}>
                    Salvează setările SEO
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── ADS ──────────────────────────────────────────────────── */}
          {activeTab === "ads" && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Reclame & Bannere</h2>
                <p className="text-gray-500 text-sm mb-4">Gestionează bannerele și reclamele afișate pe platformă.</p>
                <div className="space-y-4">
                  {[
                    { key: "banner_top", label: "Banner top pagină (HTML/URL imagine)", placeholder: "<img src='...' />" },
                    { key: "banner_sidebar", label: "Banner sidebar (HTML/URL imagine)", placeholder: "<img src='...' />" },
                    { key: "banner_footer", label: "Banner footer (HTML/URL imagine)", placeholder: "<img src='...' />" },
                    { key: "adsense_code", label: "Google AdSense Code", placeholder: "<script>..." },
                  ].map((setting) => (
                    <div key={setting.key}>
                      <Label className="text-sm">{setting.label}</Label>
                      <Textarea
                        className="mt-1 text-xs font-mono"
                        placeholder={setting.placeholder}
                        rows={3}
                        defaultValue={(siteSettings as Record<string, string> | undefined)?.[setting.key] ?? ""}
                        onChange={(e) => setSettingsForm(f => ({ ...f, [setting.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <Button className="gradient-brand text-white border-0 btn-press" onClick={() => updateSettingsMutation.mutate(Object.entries(settingsForm).map(([key, value]) => ({ key, value })))}>
                    Salvează reclamele
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODALS ───────────────────────────────────────────────────── */}

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingCategory?.id ? "Editează categoria" : "Categorie nouă"}</DialogTitle></DialogHeader>
          {editingCategory && (
            <div className="space-y-3">
              <div><Label>Nume *</Label><Input value={editingCategory.name} onChange={(e) => setEditingCategory(c => c ? { ...c, name: e.target.value } : c)} className="mt-1" /></div>
              <div><Label>Icon (lucide name)</Label><Input value={editingCategory.icon} onChange={(e) => setEditingCategory(c => c ? { ...c, icon: e.target.value } : c)} className="mt-1" placeholder="zap, car, wrench..." /></div>
              <div><Label>Culoare</Label><Input type="color" value={editingCategory.color} onChange={(e) => setEditingCategory(c => c ? { ...c, color: e.target.value } : c)} className="mt-1 h-10" /></div>
              <div><Label>Descriere</Label><Textarea value={editingCategory.description} onChange={(e) => setEditingCategory(c => c ? { ...c, description: e.target.value } : c)} className="mt-1" rows={3} /></div>
              <Button className="w-full gradient-brand text-white border-0" onClick={() => {
                if (editingCategory.id) {
                  updateCategoryMutation.mutate({ id: editingCategory.id, name: editingCategory.name, icon: editingCategory.icon, color: editingCategory.color, description: editingCategory.description });
                } else {
                  createCategoryMutation.mutate({ name: editingCategory.name, icon: editingCategory.icon, color: editingCategory.color, description: editingCategory.description });
                }
              }}>
                {editingCategory.id ? "Actualizează" : "Creează categoria"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Blog Modal */}
      <Dialog open={showBlogModal} onOpenChange={setShowBlogModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingBlog?.id ? "Editează articolul" : "Articol nou"}</DialogTitle></DialogHeader>
          {editingBlog && (
            <div className="space-y-3">
              <div><Label>Titlu *</Label><Input value={editingBlog.title} onChange={(e) => setEditingBlog(b => b ? { ...b, title: e.target.value, slug: b.slug || e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : b)} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={editingBlog.slug} onChange={(e) => setEditingBlog(b => b ? { ...b, slug: e.target.value } : b)} className="mt-1" /></div>
              <div><Label>Extras</Label><Textarea value={editingBlog.excerpt} onChange={(e) => setEditingBlog(b => b ? { ...b, excerpt: e.target.value } : b)} className="mt-1" rows={2} /></div>
              <div><Label>Conținut *</Label><Textarea value={editingBlog.content} onChange={(e) => setEditingBlog(b => b ? { ...b, content: e.target.value } : b)} className="mt-1" rows={8} /></div>
              <div><Label>Categorie</Label><Input value={editingBlog.category} onChange={(e) => setEditingBlog(b => b ? { ...b, category: e.target.value } : b)} className="mt-1" placeholder="Sfaturi, Urgențe, Auto..." /></div>
              <div>
                <Label>Status</Label>
                <Select value={editingBlog.status} onValueChange={(v) => setEditingBlog(b => b ? { ...b, status: v } : b)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Publicat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full gradient-brand text-white border-0" onClick={() => {
                if (editingBlog.id) {
                  updateBlogMutation.mutate({ id: editingBlog.id, title: editingBlog.title, content: editingBlog.content, excerpt: editingBlog.excerpt, category: editingBlog.category, status: editingBlog.status as "draft" | "published" });
                } else {
                  createBlogMutation.mutate({ title: editingBlog.title, content: editingBlog.content, excerpt: editingBlog.excerpt, category: editingBlog.category, status: editingBlog.status as "draft" | "published" });
                }
              }}>
                {editingBlog.id ? "Actualizează" : "Publică articolul"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FAQ Modal */}
      <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingFaq?.id ? "Editează FAQ" : "FAQ nou"}</DialogTitle></DialogHeader>
          {editingFaq && (
            <div className="space-y-3">
              <div><Label>Întrebare *</Label><Input value={editingFaq.question} onChange={(e) => setEditingFaq(f => f ? { ...f, question: e.target.value } : f)} className="mt-1" /></div>
              <div><Label>Răspuns *</Label><Textarea value={editingFaq.answer} onChange={(e) => setEditingFaq(f => f ? { ...f, answer: e.target.value } : f)} className="mt-1" rows={4} /></div>
              <div><Label>Categorie</Label><Input value={editingFaq.category} onChange={(e) => setEditingFaq(f => f ? { ...f, category: e.target.value } : f)} className="mt-1" /></div>
              <Button className="w-full gradient-brand text-white border-0" onClick={() => {
                if (editingFaq.id) {
                  updateFaqMutation.mutate({ id: editingFaq.id, question: editingFaq.question, answer: editingFaq.answer, category: editingFaq.category });
                } else {
                  createFaqMutation.mutate({ question: editingFaq.question, answer: editingFaq.answer, category: editingFaq.category });
                }
              }}>
                {editingFaq.id ? "Actualizează" : "Creează FAQ"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

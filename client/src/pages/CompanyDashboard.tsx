import { useState, useRef } from "react";
import {
  Building, Star, MessageCircle, FileText, Settings, BarChart3,
  Upload, Plus, Trash2, Eye, Edit, CheckCircle, Clock, LogOut, Zap, Phone, Globe, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function CompanyDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: myCompany, refetch: refetchCompany } = trpc.companies.myCompany.useQuery(undefined, { enabled: isAuthenticated });
  const { data: quotes } = trpc.quotes.byCompany.useQuery(
    { companyId: myCompany?.id ?? 0 },
    { enabled: !!myCompany?.id }
  );
  const { data: reviews } = trpc.reviews.byCompany.useQuery(
    { companyId: myCompany?.id ?? 0 },
    { enabled: !!myCompany?.id }
  );

  const utils = trpc.useUtils();

  const [editForm, setEditForm] = useState({
    name: myCompany?.name ?? "",
    shortDescription: myCompany?.shortDescription ?? "",
    description: myCompany?.description ?? "",
    phone: myCompany?.phone ?? "",
    whatsapp: myCompany?.whatsapp ?? "",
    email: myCompany?.email ?? "",
    website: myCompany?.website ?? "",
    address: myCompany?.address ?? "",
    city: myCompany?.city ?? "Brașov",
    neighborhood: myCompany?.neighborhood ?? "",
    coverageArea: myCompany?.coverageArea ?? "",
    isNonStop: myCompany?.isNonStop ?? false,
  });

  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => { toast.success("Profilul a fost actualizat!"); refetchCompany(); },
    onError: () => toast.error("Eroare la actualizare"),
  });

  const getUploadUrlMutation = trpc.upload.getUploadUrl.useMutation();

  const handleFileUploadDirect = async (file: File) => {
    try {
      const result = await getUploadUrlMutation.mutateAsync({ filename: file.name, contentType: file.type });
      await fetch(result.url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      const imageUrl = result.url.split('?')[0];
      if (!myCompany) return;
      const gallery = (myCompany.gallery as string[] | null) ?? [];
      updateMutation.mutate({ id: myCompany.id, gallery: [...gallery, imageUrl] });
    } catch { toast.error('Eroare la upload'); }
  };

  const replyMutation = trpc.reviews.reply.useMutation({
    onSuccess: () => { toast.success("Răspuns trimis!"); utils.reviews.byCompany.invalidate(); },
  });

  const quoteStatusMutation = trpc.quotes.updateStatus.useMutation({
    onSuccess: () => utils.quotes.byCompany.invalidate({ companyId: myCompany?.id ?? 0 }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUploadDirect(file);
  };

  const handleSave = () => {
    if (!myCompany) return;
    updateMutation.mutate({ id: myCompany.id, ...editForm });
  };

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Autentificare necesară</h1>
          <a href={getLoginUrl()}><Button className="gradient-brand text-white border-0">Autentificare</Button></a>
        </div>
      </PublicLayout>
    );
  }

  const navItems = [
    { id: "overview", label: "Prezentare", icon: BarChart3 },
    { id: "profile", label: "Profil firmă", icon: Building },
    { id: "gallery", label: "Galerie foto", icon: Upload },
    { id: "reviews", label: "Recenzii", icon: Star, count: reviews?.length },
    { id: "quotes", label: "Cereri ofertă", icon: FileText, count: quotes?.filter(q => q.status === "new").length },
    { id: "messages", label: "Mesaje", icon: MessageCircle },
    { id: "settings", label: "Setări", icon: Settings },
  ];

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.94_0.01_25)] flex items-center justify-center overflow-hidden">
                  {myCompany?.logo ? <img src={myCompany.logo} alt="" className="w-full h-full object-cover" /> : <Building className="w-6 h-6 text-[oklch(0.52_0.22_25)]" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{myCompany?.name ?? user?.name ?? "Firma mea"}</p>
                  <p className="text-xs text-gray-500">Dashboard Firmă</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        activeTab === item.id ? "bg-[oklch(0.94_0.01_25)] text-[oklch(0.52_0.22_25)] font-semibold" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" />{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <Badge className="bg-[oklch(0.52_0.22_25)] text-white text-xs h-5 min-w-5 px-1">{item.count}</Badge>
                      )}
                    </button>
                  );
                })}
                {myCompany && (
                  <Link href={`/firma/${myCompany.slug}`}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                      <Eye className="w-4 h-4" /> Vezi profilul public
                    </button>
                  </Link>
                )}
                <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-2">
                  <LogOut className="w-4 h-4" /> Deconectare
                </button>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3">
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard Firmă</h1>
                {!myCompany ? (
                  <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Nu ai o firmă înregistrată</h2>
                    <p className="text-gray-500 mb-4">Înregistrează-ți firma pentru a apărea în rezultatele de căutare.</p>
                    <Link href="/inregistrare-firma"><Button className="gradient-brand text-white border-0">Înregistrează firma</Button></Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Recenzii", value: reviews?.length ?? 0, icon: Star, color: "text-yellow-500" },
                        { label: "Rating mediu", value: myCompany.averageRating ? myCompany.averageRating.toFixed(1) : "N/A", icon: Star, color: "text-yellow-500" },
                        { label: "Cereri ofertă", value: quotes?.length ?? 0, icon: FileText, color: "text-blue-500" },
                        { label: "Status", value: myCompany.isVerified ? "Verificat" : "Neconfirmat", icon: CheckCircle, color: "text-green-500" },
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
                    <div className="bg-white rounded-2xl p-5 shadow-card">
                      <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Starea profilului</h2>
                      <div className="space-y-2">
                        {[
                          { label: "Logo adăugat", done: !!myCompany.logo },
                          { label: "Descriere completată", done: !!myCompany.description },
                          { label: "Telefon adăugat", done: !!myCompany.phone },
                          { label: "Adresă completată", done: !!myCompany.address },
                          { label: "Galerie foto (min. 3)", done: ((myCompany.gallery as string[] | null)?.length ?? 0) >= 3 },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-sm">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? "bg-green-500" : "bg-gray-200"}`}>
                              {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <span className={item.done ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profile edit */}
            {activeTab === "profile" && myCompany && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Editează profilul firmei</h2>
                <div className="bg-white rounded-2xl p-6 shadow-card space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Numele firmei *</Label>
                      <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="07xx xxx xxx" />
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input value={editForm.whatsapp} onChange={(e) => setEditForm(f => ({ ...f, whatsapp: e.target.value }))} className="mt-1" placeholder="+40 7xx xxx xxx" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input value={editForm.website} onChange={(e) => setEditForm(f => ({ ...f, website: e.target.value }))} className="mt-1" placeholder="https://..." />
                    </div>
                    <div>
                      <Label>Cartier</Label>
                      <Input value={editForm.neighborhood} onChange={(e) => setEditForm(f => ({ ...f, neighborhood: e.target.value }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Adresă</Label>
                    <Input value={editForm.address} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Scurtă descriere (max 160 caractere)</Label>
                    <Input value={editForm.shortDescription} onChange={(e) => setEditForm(f => ({ ...f, shortDescription: e.target.value }))} className="mt-1" maxLength={160} />
                  </div>
                  <div>
                    <Label>Descriere completă</Label>
                    <Textarea value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="mt-1" rows={5} />
                  </div>
                  <div>
                    <Label>Zonă acoperită</Label>
                    <Input value={editForm.coverageArea} onChange={(e) => setEditForm(f => ({ ...f, coverageArea: e.target.value }))} className="mt-1" placeholder="Ex: Brașov, Ghimbav, Cristian" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editForm.isNonStop} onCheckedChange={(v) => setEditForm(f => ({ ...f, isNonStop: v }))} />
                    <Label>Program Non-Stop 24/7</Label>
                  </div>
                  <Button onClick={handleSave} className="gradient-brand text-white border-0 btn-press" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Se salvează..." : "Salvează modificările"}
                  </Button>
                </div>
              </div>
            )}

            {/* Gallery */}
            {activeTab === "gallery" && myCompany && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-xl text-gray-900">Galerie foto</h2>
                  <Button onClick={() => fileInputRef.current?.click()} className="gradient-brand text-white border-0 btn-press" disabled={getUploadUrlMutation.isPending}>
                    <Upload className="w-4 h-4 mr-2" />
                    {getUploadUrlMutation.isPending ? "Se încarcă..." : "Adaugă foto"}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {((myCompany.gallery as string[] | null) ?? []).map((img, i) => (
                    <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const gallery = (myCompany.gallery as string[]).filter((_, idx) => idx !== i);
                          updateMutation.mutate({ id: myCompany.id, gallery });
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {((myCompany.gallery as string[] | null) ?? []).length === 0 && (
                    <div className="col-span-3 bg-white rounded-2xl p-10 shadow-card text-center">
                      <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nicio fotografie adăugată</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Recenzii clienți</h2>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} onReply={(reviewId, reply) => replyMutation.mutate({ reviewId, reply })} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 shadow-card text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nicio recenzie primită</p>
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
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{quote.name}</p>
                            <p className="text-sm text-gray-500">{quote.email} {quote.phone && `• ${quote.phone}`}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={quote.status === "new" ? "default" : "secondary"} className="text-xs">
                              {quote.status === "new" ? "Nou" : quote.status === "read" ? "Citit" : quote.status === "replied" ? "Răspuns" : "Închis"}
                            </Badge>
                            <span className="text-xs text-gray-400">{new Date(quote.createdAt).toLocaleDateString("ro-RO")}</span>
                          </div>
                        </div>
                        {quote.service && <p className="text-sm font-medium text-gray-700 mb-1">Serviciu: {quote.service}</p>}
                        <p className="text-sm text-gray-600 mb-3">{quote.message}</p>
                        {quote.budget && <p className="text-sm text-gray-500">Buget: {quote.budget}</p>}
                        <div className="flex gap-2 mt-3">
                          {quote.email && <a href={`mailto:${quote.email}`}><Button size="sm" variant="outline">Răspunde email</Button></a>}
                          {quote.phone && <a href={`tel:${quote.phone}`}><Button size="sm" className="gradient-brand text-white border-0">Sună acum</Button></a>}
                          {quote.status === "new" && (
                            <Button size="sm" variant="ghost" onClick={() => quoteStatusMutation.mutate({ id: quote.id, status: "read" })}>
                              Marchează citit
                            </Button>
                          )}
                        </div>
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

            {/* Settings */}
            {activeTab === "settings" && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5">Setări cont</h2>
                <div className="bg-white rounded-2xl p-6 shadow-card space-y-4 max-w-md">
                  <div>
                    <Label>Nume utilizator</Label>
                    <Input defaultValue={user?.name ?? ""} className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" defaultValue={user?.email ?? ""} className="mt-1" disabled />
                  </div>
                  <Button className="gradient-brand text-white border-0 btn-press" onClick={() => toast.success("Setările au fost salvate!")}>
                    Salvează
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function ReviewCard({ review, onReply }: { review: { id: number; rating: number; title?: string | null; content?: string | null; ownerReply?: string | null; createdAt: Date }; onReply: (id: number, reply: string) => void }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(review.ownerReply ?? "");

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between mb-2">
        <div className="flex">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-[oklch(0.72_0.15_75)] fill-[oklch(0.72_0.15_75)]" : "text-gray-200 fill-gray-200"}`} />
          ))}
        </div>
        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("ro-RO")}</span>
      </div>
      {review.title && <p className="font-semibold text-sm text-gray-900 mb-1">{review.title}</p>}
      {review.content && <p className="text-sm text-gray-600 mb-3">{review.content}</p>}
      {review.ownerReply ? (
        <div className="pl-3 border-l-2 border-[oklch(0.52_0.22_25)]/30 mb-2">
          <p className="text-xs font-semibold text-[oklch(0.52_0.22_25)] mb-0.5">Răspunsul tău:</p>
          <p className="text-xs text-gray-600">{review.ownerReply}</p>
        </div>
      ) : (
        <>
          {!showReply ? (
            <Button size="sm" variant="ghost" onClick={() => setShowReply(true)} className="text-xs">
              <Edit className="w-3 h-3 mr-1" /> Răspunde
            </Button>
          ) : (
            <div className="mt-2 space-y-2">
              <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Scrie răspunsul tău..." rows={3} className="text-sm" />
              <div className="flex gap-2">
                <Button size="sm" className="gradient-brand text-white border-0" onClick={() => { onReply(review.id, replyText); setShowReply(false); }} disabled={!replyText.trim()}>Trimite</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>Anulează</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

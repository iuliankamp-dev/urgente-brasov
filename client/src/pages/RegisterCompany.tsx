import { useState } from "react";
import { Building, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function RegisterCompany() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    phone: "",
    email: "",
    address: "",
    city: "Brașov",
    neighborhood: "",
    description: "",
    website: "",
    whatsapp: "",
  });

  const { data: categories } = trpc.categories.list.useQuery();

  const createMutation = trpc.companies.create.useMutation({
    onSuccess: (data) => {
      toast.success("Firma a fost înregistrată cu succes!");
      navigate("/dashboard/firma");
    },
    onError: (err) => toast.error(err.message || "Eroare la înregistrare"),
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Numele firmei este obligatoriu"); return; }
    createMutation.mutate({
      name: form.name,
      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      city: form.city,
      neighborhood: form.neighborhood || undefined,
      description: form.description || undefined,
      website: form.website || undefined,
      whatsapp: form.whatsapp || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Autentificare necesară</h1>
          <p className="text-gray-500 mb-6">Trebuie să fii autentificat pentru a înregistra o firmă.</p>
          <a href={getLoginUrl()}><Button className="gradient-brand text-white border-0">Autentificare</Button></a>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Înregistrează-ți firma</h1>
          <p className="text-gray-500">Completează informațiile firmei tale pentru a apărea în rezultatele de căutare.</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${s <= step ? "gradient-brand text-white" : "bg-gray-100 text-gray-400"}`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-[oklch(0.52_0.22_25)]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Informații de bază</h2>
              <div>
                <Label>Numele firmei *</Label>
                <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Ex: Service Auto Brașov" />
              </div>
              <div>
                <Label>Categorie</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selectează categoria" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Telefon</Label>
                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" placeholder="07xx xxx xxx" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" placeholder="contact@firma.ro" />
              </div>
              <Button onClick={() => setStep(2)} className="w-full gradient-brand text-white border-0 btn-press" disabled={!form.name.trim()}>
                Continuă <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Locație și contact</h2>
              <div>
                <Label>Adresă</Label>
                <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1" placeholder="Str. Exemplu, nr. 1" />
              </div>
              <div>
                <Label>Cartier</Label>
                <Input value={form.neighborhood} onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="mt-1" placeholder="Ex: Astra, Bartolomeu, Tractorul..." />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} className="mt-1" placeholder="+40 7xx xxx xxx" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} className="mt-1" placeholder="https://firma.ro" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Înapoi</Button>
                <Button onClick={() => setStep(3)} className="flex-1 gradient-brand text-white border-0 btn-press">
                  Continuă <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Descriere firmă</h2>
              <div>
                <Label>Descriere</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1"
                  rows={5}
                  placeholder="Descrie serviciile oferite, experiența, avantajele firmei tale..."
                />
              </div>
              <div className="bg-[oklch(0.97_0.01_25)] rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Rezumat înregistrare:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Firmă:</span> {form.name}</p>
                  {form.phone && <p><span className="font-medium">Telefon:</span> {form.phone}</p>}
                  {form.address && <p><span className="font-medium">Adresă:</span> {form.address}, {form.city}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Înapoi</Button>
                <Button onClick={handleSubmit} className="flex-1 gradient-brand text-white border-0 btn-press" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Se înregistrează..." : "Înregistrează firma"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

import { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const sendMutation = trpc.contact.send.useMutation({
    onSuccess: () => { setSent(true); toast.success("Mesajul tău a fost trimis!"); },
    onError: () => toast.error("Eroare la trimiterea mesajului. Încearcă din nou."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Completează toate câmpurile obligatorii");
      return;
    }
    sendMutation.mutate(form);
  };

  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Contactează-ne</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Suntem aici să te ajutăm. Trimite-ne un mesaj și îți răspundem în cel mai scurt timp.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Telefon", value: "+40 268 000 000", href: "tel:+40268000000" },
                { icon: Mail, label: "Email", value: "contact@urgentebrasov.ro", href: "mailto:contact@urgentebrasov.ro" },
                { icon: MapPin, label: "Adresă", value: "Brașov, România", href: undefined },
              ].map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="bg-white rounded-2xl p-5 shadow-card flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[oklch(0.94_0.01_25)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[oklch(0.52_0.22_25)]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                      <p className="font-semibold text-gray-900">{item.value}</p>
                    </div>
                  </div>
                );
                return item.href ? <a key={item.label} href={item.href}>{content}</a> : <div key={item.label}>{content}</div>;
              })}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                {sent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Mesaj trimis!</h2>
                    <p className="text-gray-500">Îți vom răspunde în cel mai scurt timp posibil.</p>
                    <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                      Trimite alt mesaj
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Trimite un mesaj</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Nume *</Label>
                        <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Numele tău" required />
                      </div>
                      <div>
                        <Label className="text-sm">Telefon</Label>
                        <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07xx xxx xxx" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplu.ro" required />
                    </div>
                    <div>
                      <Label className="text-sm">Subiect</Label>
                      <Input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subiectul mesajului" />
                    </div>
                    <div>
                      <Label className="text-sm">Mesaj *</Label>
                      <Textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Scrie mesajul tău..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full gradient-brand text-white border-0 btn-press" disabled={sendMutation.isPending}>
                      <Send className="w-4 h-4 mr-2" />
                      {sendMutation.isPending ? "Se trimite..." : "Trimite mesajul"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

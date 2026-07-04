import PublicLayout from "@/components/PublicLayout";

export default function GDPR() {
  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Politică de Confidențialitate</h1>
          <p className="text-white/70">Ultima actualizare: Iulie 2026 — Conform GDPR (Regulamentul UE 2016/679)</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="bg-white rounded-2xl p-8 shadow-card prose prose-gray max-w-none">
            <h2>1. Cine suntem</h2>
            <p>Urgențe Brașov este operatorul de date cu caracter personal. Datele tale sunt prelucrate în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația română aplicabilă.</p>
            <h2>2. Ce date colectăm</h2>
            <p>Colectăm următoarele categorii de date: date de identificare (nume, email, telefon), date de utilizare (paginile vizitate, căutările efectuate), date tehnice (adresa IP, tipul browserului) și conținut generat de utilizatori (recenzii, mesaje).</p>
            <h2>3. Scopul prelucrării</h2>
            <p>Datele tale sunt prelucrate pentru: furnizarea serviciilor platformei, comunicarea cu utilizatorii, îmbunătățirea serviciilor, respectarea obligațiilor legale și marketing (cu consimțământul tău).</p>
            <h2>4. Temeiul legal</h2>
            <p>Prelucrăm datele tale în baza: executării contractului (furnizarea serviciilor), consimțământului tău, interesului nostru legitim și obligațiilor legale.</p>
            <h2>5. Drepturile tale</h2>
            <p>Conform GDPR, ai următoarele drepturi: dreptul de acces, dreptul la rectificare, dreptul la ștergere ("dreptul de a fi uitat"), dreptul la restricționarea prelucrării, dreptul la portabilitatea datelor și dreptul de a te opune prelucrării.</p>
            <h2>6. Retenția datelor</h2>
            <p>Păstrăm datele tale atât timp cât este necesar pentru scopurile menționate sau conform cerințelor legale. Datele contului sunt șterse la cerere sau după 3 ani de inactivitate.</p>
            <h2>7. Securitatea datelor</h2>
            <p>Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor tale împotriva accesului neautorizat, pierderii sau distrugerii.</p>
            <h2>8. Contact DPO</h2>
            <p>Pentru exercitarea drepturilor tale sau orice întrebări legate de prelucrarea datelor, contactează-ne la: gdpr@urgentebrasov.ro</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

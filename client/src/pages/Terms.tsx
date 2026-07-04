import PublicLayout from "@/components/PublicLayout";

export default function Terms() {
  return (
    <PublicLayout>
      <section className="bg-[oklch(0.22_0.08_250)] text-white py-14">
        <div className="container text-center">
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3">Termeni și Condiții</h1>
          <p className="text-white/70">Ultima actualizare: Iulie 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="bg-white rounded-2xl p-8 shadow-card prose prose-gray max-w-none">
            <h2>1. Acceptarea termenilor</h2>
            <p>Prin accesarea și utilizarea platformei Urgențe Brașov, ești de acord cu prezentele Termeni și Condiții. Dacă nu ești de acord cu acești termeni, te rugăm să nu utilizezi platforma.</p>
            <h2>2. Descrierea serviciului</h2>
            <p>Urgențe Brașov este o platformă online care facilitează conectarea utilizatorilor cu furnizori de servicii locali din Brașov și împrejurimi. Platforma nu furnizează direct servicii și nu este responsabilă pentru calitatea serviciilor prestate de firmele listate.</p>
            <h2>3. Înregistrarea contului</h2>
            <p>Pentru a accesa anumite funcționalități, trebuie să creezi un cont. Ești responsabil pentru menținerea confidențialității datelor de autentificare și pentru toate activitățile desfășurate prin contul tău.</p>
            <h2>4. Conținut generat de utilizatori</h2>
            <p>Recenziile, comentariile și alte conținuturi postate de utilizatori trebuie să fie corecte, oneste și să nu încalce drepturile terților. Ne rezervăm dreptul de a elimina orice conținut care încalcă aceste reguli.</p>
            <h2>5. Proprietate intelectuală</h2>
            <p>Toate drepturile de proprietate intelectuală asupra platformei și conținutului acesteia aparțin Urgențe Brașov. Este interzisă reproducerea sau utilizarea acestora fără acordul nostru scris.</p>
            <h2>6. Limitarea răspunderii</h2>
            <p>Urgențe Brașov nu este responsabilă pentru daunele directe sau indirecte rezultate din utilizarea platformei sau a serviciilor furnizorilor listați.</p>
            <h2>7. Modificarea termenilor</h2>
            <p>Ne rezervăm dreptul de a modifica acești termeni în orice moment. Modificările vor fi comunicate prin email și/sau prin afișarea pe platformă.</p>
            <h2>8. Contact</h2>
            <p>Pentru orice întrebări legate de acești termeni, ne poți contacta la: contact@urgentebrasov.ro</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

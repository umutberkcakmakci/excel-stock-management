import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function LetterPage() {
  const { letter } = useParams<{ letter: string }>();
  const { records, hasData } = useData();
  const navigate = useNavigate();

  const decodedLetter = decodeURIComponent(letter ?? '');

  // Get unique companies starting with this letter
  const companies = useMemo(() => {
    if (!hasData || !decodedLetter) return [];

    const companyMap = new Map<string, { il: string; sektor: string; count: number }>();

    records.forEach((r) => {
      if (!r.firmaAdi) return;
      const firstLetter = r.firmaAdi.charAt(0).toLocaleUpperCase('tr-TR');
      if (firstLetter !== decodedLetter) return;

      const key = r.firmaAdi.toLocaleUpperCase('tr-TR');
      if (!companyMap.has(key)) {
        companyMap.set(key, {
          il: r.il || '',
          sektor: r.sektor || '',
          count: 1,
        });
      } else {
        const existing = companyMap.get(key)!;
        existing.count += 1;
        if (!existing.il && r.il) existing.il = r.il;
        if (!existing.sektor && r.sektor) existing.sektor = r.sektor;
      }
    });

    // Return sorted by name, with display name (original case)
    const displayNames = new Map<string, string>();
    records.forEach((r) => {
      if (!r.firmaAdi) return;
      const key = r.firmaAdi.toLocaleUpperCase('tr-TR');
      if (!displayNames.has(key)) displayNames.set(key, r.firmaAdi);
    });

    return Array.from(companyMap.entries())
      .map(([key, info]) => ({
        key,
        displayName: displayNames.get(key) || key,
        il: info.il,
        sektor: info.sektor,
        count: info.count,
      }))
      .sort((a, b) => a.key.localeCompare(b.key, 'tr-TR'));
  }, [records, decodedLetter, hasData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/data')}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Geri Dön"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-blue-700/40">
              {decodedLetter}
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">"{decodedLetter}" ile Başlayan Firmalar</h1>
              <p className="text-blue-300 text-xs">{companies.length} firma bulundu</p>
            </div>
          </div>
        </div>
      </header>

      {/* Companies List */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">
        {companies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Bu harfle başlayan firma bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <button
                key={company.key}
                onClick={() =>
                  navigate(
                    `/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(company.key)}`
                  )
                }
                className="group text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 p-5 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-300 font-bold text-lg">{decodedLetter}</span>
                  </div>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-lg flex-shrink-0">
                    {company.count} kayıt
                  </span>
                </div>

                <h3 className="text-white font-semibold text-base leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
                  {company.displayName}
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {company.il && (
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {company.il}
                    </span>
                  )}
                  {company.sektor && (
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125-.504 1.125 1.125V21" />
                      </svg>
                      {company.sektor}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center text-blue-400/60 text-xs group-hover:text-blue-300 transition-colors">
                  <span>Stok kodlarını görüntüle</span>
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

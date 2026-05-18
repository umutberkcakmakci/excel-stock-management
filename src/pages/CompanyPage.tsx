import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { parseDateForSort } from '../utils/excelParser';

export default function CompanyPage() {
  const { letter, companyKey } = useParams<{ letter: string; companyKey: string }>();
  const { records, hasData } = useData();
  const navigate = useNavigate();

  const decodedLetter = decodeURIComponent(letter ?? '');
  const decodedCompanyKey = decodeURIComponent(companyKey ?? '');

  // Get company display info
  const companyInfo = useMemo(() => {
    const rec = records.find(
      (r) => r.firmaAdi?.toLocaleUpperCase('tr-TR') === decodedCompanyKey
    );
    return rec
      ? { displayName: rec.firmaAdi, il: rec.il, sektor: rec.sektor }
      : { displayName: decodedCompanyKey, il: '', sektor: '' };
  }, [records, decodedCompanyKey]);

  // Get stock codes for this company, sorted by newest faturaTarihi
  const stockCodes = useMemo(() => {
    if (!hasData) return [];

    const companyRecords = records.filter(
      (r) => r.firmaAdi?.toLocaleUpperCase('tr-TR') === decodedCompanyKey
    );

    // Group by stok kodu, keep newest date per stock code for sorting
    const stokMap = new Map<
      string,
      { stokKodu: string; urunIsmi: string; count: number; newestDate: Date; records: typeof companyRecords }
    >();

    companyRecords.forEach((r) => {
      const key = r.stokKodu || '(Belirsiz)';
      const d = parseDateForSort(r.faturaTarihi);
      if (!stokMap.has(key)) {
        stokMap.set(key, {
          stokKodu: key,
          urunIsmi: r.urunIsmi || '',
          count: 1,
          newestDate: d,
          records: [r],
        });
      } else {
        const existing = stokMap.get(key)!;
        existing.count += 1;
        existing.records.push(r);
        if (d > existing.newestDate) {
          existing.newestDate = d;
          if (!existing.urunIsmi && r.urunIsmi) existing.urunIsmi = r.urunIsmi;
        }
      }
    });

    return Array.from(stokMap.values()).sort(
      (a, b) => b.newestDate.getTime() - a.newestDate.getTime()
    );
  }, [records, decodedCompanyKey, hasData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() =>
              navigate(`/data/letter/${encodeURIComponent(decodedLetter)}`)
            }
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Geri Dön"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg truncate">{companyInfo.displayName}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {companyInfo.il && (
                <span className="flex items-center gap-1 text-xs text-blue-300">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {companyInfo.il}
                </span>
              )}
              {companyInfo.sektor && (
                <span className="flex items-center gap-1 text-xs text-blue-300">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125-.504 1.125 1.125V21" />
                  </svg>
                  {companyInfo.sektor}
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-lg">{stockCodes.length}</p>
            <p className="text-white/40 text-xs">stok kodu</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">
        {/* Sort info */}
        <div className="mb-4 flex items-center gap-2 text-xs text-white/40">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          Fatura tarihine göre sıralanmış (yeniden eskiye)
        </div>

        {stockCodes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Bu firmaya ait stok kodu bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stockCodes.map((sk, idx) => (
              <button
                key={sk.stokKodu + idx}
                onClick={() =>
                  navigate(
                    `/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}/stock/${encodeURIComponent(sk.stokKodu)}`
                  )
                }
                className="group w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-600/20 hover:border-blue-500/40 p-5 transition-all duration-200 cursor-pointer active:scale-[0.99] flex items-center gap-4"
              >
                {/* Index badge */}
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-300 font-bold text-sm">#{idx + 1}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-white font-bold text-base">{sk.stokKodu}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-400/20">
                      {sk.count} kayıt
                    </span>
                  </div>
                  {sk.urunIsmi && (
                    <p className="text-white/60 text-sm mt-0.5 truncate">{sk.urunIsmi}</p>
                  )}
                  <p className="text-white/30 text-xs mt-1">
                    Son fatura: {sk.newestDate.getTime() === 0 ? '—' : sk.newestDate.toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

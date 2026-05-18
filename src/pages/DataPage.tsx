import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');

function getFirstLetter(name: string): string {
  if (!name) return '#';
  return name.charAt(0).toLocaleUpperCase('tr-TR');
}

export default function DataPage() {
  const { records, fileName, hasData } = useData();
  const navigate = useNavigate();

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.firmaAdi) set.add(getFirstLetter(r.firmaAdi));
    });
    return set;
  }, [records]);

  const stats = useMemo(() => {
    const firms = new Set(records.map((r) => r.firmaAdi?.toLocaleUpperCase('tr-TR')));
    const codes = new Set(records.map((r) => r.stokKodu));
    const cities = new Set(records.map((r) => r.il?.toLocaleUpperCase('tr-TR')).filter(Boolean));
    const sectors = new Set(records.map((r) => r.sektor?.toLocaleUpperCase('tr-TR')).filter(Boolean));
    return {
      firms: firms.size,
      codes: codes.size,
      cities: cities.size,
      sectors: sectors.size,
    };
  }, [records]);

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/60 text-lg">Henüz veri yüklenmedi.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer"
          >
            Excel Dosyası Yükle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Dosya Yükle"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125-.504 1.125 1.125V21" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg">Firma Dizini</h1>
              <p className="text-blue-300 text-xs truncate">{fileName}</p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-lg">{records.length}</p>
            <p className="text-white/40 text-xs">toplam kayıt</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Instruction */}
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Bir harfe tıklayarak o harfle başlayan firmaları listeleyin
          </p>
        </div>

        {/* Alphabet Grid */}
        <div className="flex flex-wrap justify-center gap-2">
          {ALPHABET.map((letter) => {
            const isAvailable = availableLetters.has(letter);
            return (
              <button
                key={letter}
                disabled={!isAvailable}
                onClick={() =>
                  isAvailable &&
                  navigate(`/data/letter/${encodeURIComponent(letter)}`)
                }
                className={[
                  'w-12 h-12 rounded-xl text-lg font-bold transition-all duration-150',
                  isAvailable
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-700/30 hover:scale-110 cursor-pointer active:scale-95'
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5',
                ].join(' ')}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {[
            { label: 'Firma Sayısı', value: stats.firms, icon: '🏢' },
            { label: 'Stok Kodu', value: stats.codes, icon: '📦' },
            { label: 'Şehir', value: stats.cities, icon: '📍' },
            { label: 'Sektör', value: stats.sectors, icon: '🏭' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Active letters summary */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
            Mevcut Harfler ({availableLetters.size})
          </p>
          <div className="flex flex-wrap gap-2">
            {ALPHABET.filter((l) => availableLetters.has(l)).map((letter) => (
              <button
                key={letter}
                onClick={() => navigate(`/data/letter/${encodeURIComponent(letter)}`)}
                className="w-8 h-8 rounded-lg bg-blue-600/30 hover:bg-blue-500/50 text-blue-200 text-sm font-bold transition-colors cursor-pointer"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

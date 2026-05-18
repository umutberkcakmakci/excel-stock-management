import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { parseDateForSort } from '../utils/excelParser';
import { StokKaydi } from '../types';

interface InfoBadgeProps {
  label: string;
  value?: string | number | null;
  onClick?: () => void;
  highlight?: boolean;
}

function InfoBadge({ label, value, onClick, highlight }: InfoBadgeProps) {
  const displayVal = value !== undefined && value !== null && String(value).trim() !== ''
    ? String(value)
    : null;

  if (!displayVal) {
    return (
      <div className="flex flex-col gap-0.5 bg-white/3 border border-white/5 rounded-xl px-3 py-2 opacity-40">
        <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-white/30 text-sm">—</span>
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={[
          'group/badge flex flex-col gap-0.5 rounded-xl px-3 py-2 cursor-pointer transition-all text-left border',
          highlight
            ? 'bg-blue-600/25 hover:bg-blue-500/40 border-blue-500/40 hover:border-blue-400/60'
            : 'bg-blue-600/15 hover:bg-blue-500/30 border-blue-500/20 hover:border-blue-400/40',
        ].join(' ')}
        title={`"${displayVal}" ile ilgili tüm kayıtları gör`}
      >
        <span className="text-blue-400/80 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
          {label}
          <svg
            className="w-2.5 h-2.5 text-blue-400/60 group-hover/badge:text-blue-300 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
        <span className="text-white text-sm font-semibold">{displayVal}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
      <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-white text-sm font-medium">{displayVal}</span>
    </div>
  );
}

export default function StockCodePage() {
  const { letter, companyKey, stockCode } = useParams<{
    letter: string;
    companyKey: string;
    stockCode: string;
  }>();
  const { records, hasData } = useData();
  const navigate = useNavigate();

  const decodedLetter = decodeURIComponent(letter ?? '');
  const decodedCompanyKey = decodeURIComponent(companyKey ?? '');
  const decodedStockCode = decodeURIComponent(stockCode ?? '');

  const companyInfo = useMemo(() => {
    const rec = records.find(
      (r) => r.firmaAdi?.toLocaleUpperCase('tr-TR') === decodedCompanyKey
    );
    return {
      displayName: rec?.firmaAdi || decodedCompanyKey,
      il: rec?.il || '',
      sektor: rec?.sektor || '',
    };
  }, [records, decodedCompanyKey]);

  // Filter + sort by faturaTarihi descending
  const stockRecords = useMemo((): StokKaydi[] => {
    if (!hasData) return [];
    return records
      .filter(
        (r) =>
          r.firmaAdi?.toLocaleUpperCase('tr-TR') === decodedCompanyKey &&
          (r.stokKodu || '(Belirsiz)') === decodedStockCode
      )
      .sort(
        (a, b) =>
          parseDateForSort(b.faturaTarihi).getTime() -
          parseDateForSort(a.faturaTarihi).getTime()
      );
  }, [records, decodedCompanyKey, decodedStockCode, hasData]);

  function goToDetail(
    type: 'lotNo' | 'faturaNo' | 'siparisNo' | 'yetkili',
    value: string
  ) {
    if (!value || !value.trim()) return;
    navigate(
      `/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}/stock/${encodeURIComponent(decodedStockCode)}/detail/${type}/${encodeURIComponent(value.trim())}`
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() =>
              navigate(
                `/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}`
              )
            }
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Geri Dön"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-lg">
                {decodedStockCode}
              </span>
              <span className="text-white/40 text-xs">{stockRecords.length} kayıt</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5 truncate">{companyInfo.displayName}</p>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-white/30 flex-wrap">
          <button onClick={() => navigate('/data')} className="hover:text-white/60 transition-colors cursor-pointer">Dizin</button>
          <span>›</span>
          <button onClick={() => navigate(`/data/letter/${encodeURIComponent(decodedLetter)}`)} className="hover:text-white/60 transition-colors cursor-pointer">{decodedLetter}</button>
          <span>›</span>
          <button
            onClick={() => navigate(`/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}`)}
            className="hover:text-white/60 transition-colors cursor-pointer truncate max-w-[150px]"
          >
            {companyInfo.displayName}
          </button>
          <span>›</span>
          <span className="text-white/60">{decodedStockCode}</span>
        </div>
      </div>

      {/* Info banner */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-3">
        <div className="rounded-xl bg-blue-500/10 border border-blue-400/20 px-4 py-2.5 flex items-center gap-2 text-xs text-blue-300">
          <svg className="w-4 h-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <span className="text-blue-200 font-semibold">Lot No</span>,{' '}
            <span className="text-blue-200 font-semibold">Fatura No</span>,{' '}
            <span className="text-blue-200 font-semibold">Sipariş No</span> ve{' '}
            <span className="text-blue-200 font-semibold">Yetkili</span> alanlarına tıklayarak ilgili tüm kayıtları görüntüleyebilirsiniz.
          </span>
        </div>
      </div>

      {/* Sort label */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-3">
        <div className="flex items-center gap-2 text-xs text-white/30">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          Fatura tarihine göre sıralanmış (yeniden eskiye)
        </div>
      </div>

      {/* Records */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-4 space-y-5 pb-10">
        {stockRecords.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Bu stok koduna ait kayıt bulunamadı.</p>
          </div>
        ) : (
          stockRecords.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              {/* Record header bar */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10 bg-white/3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white/30 font-bold text-sm flex-shrink-0">#{idx + 1}</span>
                  {rec.urunIsmi && (
                    <span className="text-white font-semibold text-sm truncate">{rec.urunIsmi}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {rec.faturaTarihi && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg whitespace-nowrap">
                      📅 {rec.faturaTarihi}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Main info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <InfoBadge label="Ürün İsmi" value={rec.urunIsmi} />
                  <InfoBadge label="Miktar" value={String(rec.miktar ?? '')} />
                  <InfoBadge label="Fatura Tarihi" value={rec.faturaTarihi} />
                  <InfoBadge label="Son Kul. Tarihi" value={rec.sonKulTarihi} />
                  <InfoBadge label="Bizden İlgilisi" value={rec.bizdenIlgilisi} />
                </div>

                {/* Clickable fields section */}
                <div>
                  <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-2">
                    Detay için tıklayın
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <InfoBadge
                      label="Lot No"
                      value={rec.lotNo}
                      onClick={rec.lotNo?.trim() ? () => goToDetail('lotNo', rec.lotNo) : undefined}
                    />
                    <InfoBadge
                      label="Fatura No"
                      value={rec.faturaNo}
                      onClick={rec.faturaNo?.trim() ? () => goToDetail('faturaNo', rec.faturaNo) : undefined}
                    />
                    <InfoBadge
                      label="Sipariş No"
                      value={rec.siparisNumarasi}
                      onClick={rec.siparisNumarasi?.trim() ? () => goToDetail('siparisNo', rec.siparisNumarasi) : undefined}
                    />
                    <InfoBadge
                      label="Yetkili"
                      value={rec.yetkili}
                      onClick={rec.yetkili?.trim() ? () => goToDetail('yetkili', rec.yetkili) : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

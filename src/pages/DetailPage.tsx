import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { parseDateForSort } from '../utils/excelParser';
import { StokKaydi } from '../types';

type DetailType = 'lotNo' | 'faturaNo' | 'siparisNo' | 'yetkili';

const DETAIL_LABELS: Record<DetailType, string> = {
  lotNo: 'Lot No',
  faturaNo: 'Fatura No',
  siparisNo: 'Sipariş No',
  yetkili: 'Yetkili',
};

function InfoItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
      <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-white text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export default function DetailPage() {
  const { letter, companyKey, stockCode, detailType, detailValue } = useParams<{
    letter: string;
    companyKey: string;
    stockCode: string;
    detailType: string;
    detailValue: string;
  }>();
  const { records, hasData } = useData();
  const navigate = useNavigate();

  const decodedLetter = decodeURIComponent(letter ?? '');
  const decodedCompanyKey = decodeURIComponent(companyKey ?? '');
  const decodedStockCode = decodeURIComponent(stockCode ?? '');
  const decodedDetailType = decodeURIComponent(detailType ?? '') as DetailType;
  const decodedDetailValue = decodeURIComponent(detailValue ?? '');

  const companyDisplayName = useMemo(() => {
    const rec = records.find(
      (r) => r.firmaAdi?.toLocaleUpperCase('tr-TR') === decodedCompanyKey
    );
    return rec?.firmaAdi || decodedCompanyKey;
  }, [records, decodedCompanyKey]);

  // Filter records based on detailType and detailValue
  const filteredRecords = useMemo((): StokKaydi[] => {
    if (!hasData) return [];

    const getValue = (r: StokKaydi): string => {
      switch (decodedDetailType) {
        case 'lotNo': return r.lotNo || '';
        case 'faturaNo': return r.faturaNo || '';
        case 'siparisNo': return r.siparisNumarasi || '';
        case 'yetkili': return r.yetkili || '';
        default: return '';
      }
    };

    return records
      .filter((r) => getValue(r) === decodedDetailValue)
      .sort(
        (a, b) =>
          parseDateForSort(b.faturaTarihi).getTime() -
          parseDateForSort(a.faturaTarihi).getTime()
      );
  }, [records, decodedDetailType, decodedDetailValue, hasData]);

  const label = DETAIL_LABELS[decodedDetailType] || decodedDetailType;

  // Determine which fields to show based on detail type
  function getFields(rec: StokKaydi) {
    const common = {
      firma: rec.firmaAdi,
      urunIsmi: rec.urunIsmi,
      miktar: String(rec.miktar ?? ''),
      sonKulTarihi: rec.sonKulTarihi,
      faturaTarihi: rec.faturaTarihi,
      faturaNo: rec.faturaNo,
      siparisNo: rec.siparisNumarasi,
      lotNo: rec.lotNo,
      yetkili: rec.yetkili,
      stokKodu: rec.stokKodu,
    };

    switch (decodedDetailType) {
      case 'lotNo':
        // Show: company, product, qty, fatura no+date, son kul tarihi, yetkili, siparis no
        return [
          { label: 'Firma', value: common.firma },
          { label: 'Stok Kodu', value: common.stokKodu },
          { label: 'Ürün İsmi', value: common.urunIsmi },
          { label: 'Miktar', value: common.miktar },
          { label: 'Fatura No', value: common.faturaNo },
          { label: 'Fatura Tarihi', value: common.faturaTarihi },
          { label: 'Son Kul. Tarihi', value: common.sonKulTarihi },
          { label: 'Yetkili', value: common.yetkili },
          { label: 'Sipariş No', value: common.siparisNo },
        ];
      case 'faturaNo':
        // Show: company, product, qty, fatura date, son kul tarihi, yetkili, siparis no, lot no
        return [
          { label: 'Firma', value: common.firma },
          { label: 'Stok Kodu', value: common.stokKodu },
          { label: 'Ürün İsmi', value: common.urunIsmi },
          { label: 'Miktar', value: common.miktar },
          { label: 'Fatura Tarihi', value: common.faturaTarihi },
          { label: 'Son Kul. Tarihi', value: common.sonKulTarihi },
          { label: 'Yetkili', value: common.yetkili },
          { label: 'Sipariş No', value: common.siparisNo },
          { label: 'Lot No', value: common.lotNo },
        ];
      case 'siparisNo':
        // Show: company, product, qty, fatura no+date, son kul tarihi, yetkili, lot no
        return [
          { label: 'Firma', value: common.firma },
          { label: 'Stok Kodu', value: common.stokKodu },
          { label: 'Ürün İsmi', value: common.urunIsmi },
          { label: 'Miktar', value: common.miktar },
          { label: 'Fatura No', value: common.faturaNo },
          { label: 'Fatura Tarihi', value: common.faturaTarihi },
          { label: 'Son Kul. Tarihi', value: common.sonKulTarihi },
          { label: 'Yetkili', value: common.yetkili },
          { label: 'Lot No', value: common.lotNo },
        ];
      case 'yetkili':
        // Show: company, product, qty, fatura no+date, son kul tarihi, siparis no, lot no
        return [
          { label: 'Firma', value: common.firma },
          { label: 'Stok Kodu', value: common.stokKodu },
          { label: 'Ürün İsmi', value: common.urunIsmi },
          { label: 'Miktar', value: common.miktar },
          { label: 'Fatura No', value: common.faturaNo },
          { label: 'Fatura Tarihi', value: common.faturaTarihi },
          { label: 'Son Kul. Tarihi', value: common.sonKulTarihi },
          { label: 'Sipariş No', value: common.siparisNo },
          { label: 'Lot No', value: common.lotNo },
        ];
      default:
        return Object.entries(common).map(([k, v]) => ({ label: k, value: v }));
    }
  }

  const typeIconMap: Record<string, string> = {
    lotNo: '🔖',
    faturaNo: '🧾',
    siparisNo: '📋',
    yetkili: '👤',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() =>
              navigate(
                `/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}/stock/${encodeURIComponent(decodedStockCode)}`
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
              <span className="text-lg">{typeIconMap[decodedDetailType] ?? '🔍'}</span>
              <span className="text-white font-bold text-base">{label}:</span>
              <span className="bg-amber-500/20 text-amber-200 border border-amber-500/30 text-sm font-bold px-3 py-0.5 rounded-lg">
                {decodedDetailValue}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5 truncate">
              {companyDisplayName} · {decodedStockCode}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-lg">{filteredRecords.length}</p>
            <p className="text-white/40 text-xs">kayıt</p>
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
          <button onClick={() => navigate(`/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}`)} className="hover:text-white/60 transition-colors cursor-pointer truncate max-w-[120px]">{companyDisplayName}</button>
          <span>›</span>
          <button onClick={() => navigate(`/data/letter/${encodeURIComponent(decodedLetter)}/company/${encodeURIComponent(decodedCompanyKey)}/stock/${encodeURIComponent(decodedStockCode)}`)} className="hover:text-white/60 transition-colors cursor-pointer">{decodedStockCode}</button>
          <span>›</span>
          <span className="text-white/60">{label}: {decodedDetailValue}</span>
        </div>
      </div>

      {/* Records */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-5 space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Bu {label} değerine ait kayıt bulunamadı.</p>
          </div>
        ) : (
          filteredRecords.map((rec, idx) => {
            const fields = getFields(rec);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 font-bold text-sm">#{idx + 1}</span>
                    <span className="text-white font-semibold">{rec.firmaAdi}</span>
                  </div>
                  {rec.faturaTarihi && (
                    <span className="flex-shrink-0 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                      📅 {rec.faturaTarihi}
                    </span>
                  )}
                </div>
                {/* Fields grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {fields.map((f) =>
                    f.value ? (
                      <InfoItem key={f.label} label={f.label} value={f.value} />
                    ) : null
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

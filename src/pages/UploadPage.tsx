import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { parseExcelFile } from '../utils/excelParser';

export default function UploadPage() {
  const { setRecords, setFileName, fileName, hasData } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const processFile = useCallback(
    async (file: File) => {
      if (!file) return;

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
        setError('Lütfen geçerli bir Excel dosyası (.xlsx, .xls) veya CSV dosyası yükleyin.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const data = await parseExcelFile(file);
        if (data.length === 0) {
          setError(
            'Excel dosyasında kayıt bulunamadı. Lütfen doğru sütun adlarına sahip bir dosya yükleyin.'
          );
          setIsLoading(false);
          return;
        }
        setRecords(data);
        setFileName(file.name);
        setSuccessMsg(`${data.length} kayıt başarıyla yüklendi!`);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Hata: ${err.message}`
            : 'Dosya işlenirken beklenmedik bir hata oluştu.'
        );
        setIsLoading(false);
      }
    },
    [setRecords, setFileName]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Stok Takip Sistemi</h1>
            <p className="text-blue-300 text-xs">Excel Tabanlı Stok Yönetimi</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Excel Dosyası Yükle</h2>
            <p className="text-blue-300 text-sm">
              Stok verilerinizi içeren Excel dosyanızı yükleyin ve sisteme aktarın.
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12
              flex flex-col items-center justify-center gap-4
              ${isDragging
                ? 'border-blue-400 bg-blue-500/20 scale-[1.02]'
                : 'border-white/20 bg-white/5 hover:border-blue-400/60 hover:bg-white/10'
              }
              ${isLoading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-blue-300 font-medium">Dosya işleniyor...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">
                    Dosyayı buraya sürükleyin
                  </p>
                  <p className="text-blue-300 text-sm mt-1">
                    ya da tıklayarak seçin
                  </p>
                  <p className="text-white/30 text-xs mt-2">.xlsx · .xls · .csv</p>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-300 text-sm">{successMsg}</p>
            </div>
          )}

          {/* Current file info + go to data */}
          {hasData && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{fileName}</p>
                  <p className="text-white/40 text-xs">Yüklü dosya</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/data'); }}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Verileri Görüntüle →
              </button>
            </div>
          )}

          {/* Column info */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Beklenen Sütun Adları</p>
            <div className="flex flex-wrap gap-2">
              {[
                'FİRMA ADI', 'İL', 'SEKTÖR', 'STOK KODU', 'ÜRÜN İSMİ',
                'MİKTAR', 'LOT NO', 'FATURA NO', 'FATURA TARİHİ',
                'SON KUL.TARİHİ', 'YETKİLİ', 'SİPARİŞ NUMARASI', 'BİZDEN İLGİLİSİ'
              ].map((col) => (
                <span key={col} className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-lg border border-white/10">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

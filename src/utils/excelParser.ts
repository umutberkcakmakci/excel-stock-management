import * as XLSX from 'xlsx';
import { StokKaydi } from '../types';

// Maps various Turkish column name variants to our internal keys
const COLUMN_MAP: Record<string, keyof StokKaydi> = {
  // FİRMA ADI
  'firma adi': 'firmaAdi',
  'firmaadi': 'firmaAdi',
  'firma adı': 'firmaAdi',
  'firmaadı': 'firmaAdi',
  'firma_adi': 'firmaAdi',
  'firma_adı': 'firmaAdi',
  // İL
  'il': 'il',
  'ili': 'il',
  // SEKTÖR
  'sektor': 'sektor',
  'sektör': 'sektor',
  // STOK KODU
  'stok kodu': 'stokKodu',
  'stokkodu': 'stokKodu',
  'stok_kodu': 'stokKodu',
  // ÜRÜN İSMİ
  'urun ismi': 'urunIsmi',
  'ürün ismi': 'urunIsmi',
  'urunismi': 'urunIsmi',
  'ürünismi': 'urunIsmi',
  'urun_ismi': 'urunIsmi',
  'ürün_ismi': 'urunIsmi',
  'urun adi': 'urunIsmi',
  'ürün adı': 'urunIsmi',
  // MİKTAR
  'miktar': 'miktar',
  'miktarı': 'miktar',
  'miktari': 'miktar',
  // LOT NO
  'lot no': 'lotNo',
  'lotno': 'lotNo',
  'lot_no': 'lotNo',
  'lot numarasi': 'lotNo',
  'lot numarası': 'lotNo',
  // FATURA NO
  'fatura no': 'faturaNo',
  'faturano': 'faturaNo',
  'fatura_no': 'faturaNo',
  'fatura numarasi': 'faturaNo',
  'fatura numarası': 'faturaNo',
  // FATURA TARİHİ
  'fatura tarihi': 'faturaTarihi',
  'faturatarihi': 'faturaTarihi',
  'fatura_tarihi': 'faturaTarihi',
  // SON KUL.TARİHİ
  'son kul.tarihi': 'sonKulTarihi',
  'son kul tarihi': 'sonKulTarihi',
  'sonkultarihi': 'sonKulTarihi',
  'son kullanim tarihi': 'sonKulTarihi',
  'son kullanım tarihi': 'sonKulTarihi',
  'son kullanımtarihi': 'sonKulTarihi',
  'son_kul_tarihi': 'sonKulTarihi',
  'son kullanim tar': 'sonKulTarihi',
  // YETKİLİ
  'yetkili': 'yetkili',
  // SİPARİŞ NUMARASI
  'siparis numarasi': 'siparisNumarasi',
  'sipariş numarası': 'siparisNumarasi',
  'siparisno': 'siparisNumarasi',
  'sipariş no': 'siparisNumarasi',
  'siparis no': 'siparisNumarasi',
  'siparis_numarasi': 'siparisNumarasi',
  'sipariş_numarası': 'siparisNumarasi',
  // BİZDEN İLGİLİSİ
  'bizden ilgilisi': 'bizdenIlgilisi',
  'bizdenilgilisi': 'bizdenIlgilisi',
  'bizden_ilgilisi': 'bizdenIlgilisi',
  'bizden ilgisi': 'bizdenIlgilisi',
};

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/i̇/g, 'i') // Turkish dotted I
    .replace(/İ/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/[^a-z0-9 _.]/g, '');
}

function parseExcelDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';

  // If it's a number, it might be an Excel serial date
  if (typeof value === 'number') {
    try {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        const d = `${String(date.d).padStart(2, '0')}.${String(date.m).padStart(2, '0')}.${date.y}`;
        return d;
      }
    } catch {
      // fallback
    }
    return String(value);
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (value instanceof Date) {
    const d = value.getDate();
    const m = value.getMonth() + 1;
    const y = value.getFullYear();
    return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
  }

  return String(value);
}

// Parse date string (DD.MM.YYYY or various formats) to a sortable Date
export function parseDateForSort(dateStr: string): Date {
  if (!dateStr) return new Date(0);

  // DD.MM.YYYY
  const dotMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    return new Date(
      parseInt(dotMatch[3]),
      parseInt(dotMatch[2]) - 1,
      parseInt(dotMatch[1])
    );
  }

  // DD/MM/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return new Date(
      parseInt(slashMatch[3]),
      parseInt(slashMatch[2]) - 1,
      parseInt(slashMatch[1])
    );
  }

  // YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  return new Date(0);
}

export function parseExcelFile(file: File): Promise<StokKaydi[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Dosya okunamadı'));
          return;
        }

        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: false, // We'll handle dates manually
          raw: false,
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('Excel dosyasında sayfa bulunamadı'));
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          reject(new Error('Excel sayfası okunamadı'));
          return;
        }

        // Get raw data as array of arrays to handle headers manually
        const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: true,
          defval: '',
        }) as unknown[][];

        if (!rawData || rawData.length < 2) {
          resolve([]);
          return;
        }

        // Find header row (first non-empty row)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawData.length, 5); i++) {
          const row = rawData[i];
          if (row && row.some((cell) => cell !== '' && cell !== null && cell !== undefined)) {
            headerRowIndex = i;
            break;
          }
        }

        const headerRow = rawData[headerRowIndex] as unknown[];
        const headers = headerRow.map((h) => normalizeKey(String(h ?? '')));

        // Map headers to our internal field names
        const fieldMap: Record<number, keyof StokKaydi> = {};
        headers.forEach((h, idx) => {
          if (COLUMN_MAP[h]) {
            fieldMap[idx] = COLUMN_MAP[h];
          }
        });

        const records: StokKaydi[] = [];

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const row = rawData[i] as unknown[];
          if (!row || row.every((cell) => cell === '' || cell === null || cell === undefined)) {
            continue; // skip empty rows
          }

          const record: StokKaydi = {
            firmaAdi: '',
            il: '',
            sektor: '',
            stokKodu: '',
            urunIsmi: '',
            miktar: '',
            lotNo: '',
            faturaNo: '',
            faturaTarihi: '',
            sonKulTarihi: '',
            yetkili: '',
            siparisNumarasi: '',
            bizdenIlgilisi: '',
          };

          Object.entries(fieldMap).forEach(([idxStr, fieldName]) => {
            const idx = parseInt(idxStr);
            const cellValue = row[idx];

            if (fieldName === 'faturaTarihi' || fieldName === 'sonKulTarihi') {
              record[fieldName] = parseExcelDate(cellValue);
            } else {
              record[fieldName] = cellValue !== undefined && cellValue !== null
                ? String(cellValue).trim()
                : '';
            }
          });

          // Only add records with at least a company name
          if (record.firmaAdi && record.firmaAdi !== '') {
            records.push(record);
          }
        }

        resolve(records);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Excel dosyası işlenirken hata oluştu'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okuma hatası'));
    };

    reader.readAsArrayBuffer(file);
  });
}

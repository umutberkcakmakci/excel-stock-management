export interface StokKaydi {
  firmaAdi: string;
  il: string;
  sektor: string;
  stokKodu: string;
  urunIsmi: string;
  miktar: string | number;
  lotNo: string;
  faturaNo: string;
  faturaTarihi: string; // stored as ISO string or original string
  sonKulTarihi: string;
  yetkili: string;
  siparisNumarasi: string;
  bizdenIlgilisi: string;
}

export type PageType =
  | 'home'
  | 'letter'
  | 'company'
  | 'stockcode'
  | 'detail';

export interface NavigationState {
  page: PageType;
  selectedLetter?: string;
  selectedCompany?: string;
  selectedStokKodu?: string;
  detailType?: 'lotNo' | 'faturaNo' | 'siparisNo' | 'yetkili';
  detailValue?: string;
}

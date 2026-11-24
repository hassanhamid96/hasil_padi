export interface Potongan {
  basahPct: number;
  hampaPct: number;
  hijauPct: number;
  rosakPct: number;
  kotorPct: number;
  wbPct: number;
}

export interface Receipt {
  resitNo: string;
  beratMasukKg: number | null;
  beratKeluarKg: number | null;
  beratTimbanganKg: number | null;
  potongan: Potongan;
  bilGuni: number | null;
  hargaPer100kg: number | null;
  beratBersihKg: number | null;
  jumlahBayaranRM: number | null;
  subsidiRM: number | null;
}

export interface SeasonFinancials {
  subsidy: number;
  paddySales: number;
  grossRevenue: number;
  cost: number;
  netBeforeZakat: number;
  zakat: number;
  netAfterZakat: number;
  profitMarginPct: number;
}

export interface SeasonProduction {
  tonnes: number;
  gundi: number;
  relong: number;
  yieldPerRelong: number;
}

export interface SeasonData {
  id: string;
  sheetName: string;
  name: string;
  year: number;
  season: string;
  seedType: string;
  seedPrice: number;
  paddyPrice100kg: number;
  financials: SeasonFinancials;
  production: SeasonProduction;
  receipts: Receipt[];
}

export interface CostItem {
  num: string;
  item: string;
  category: 'Benih & Semaian' | 'Rawatan & Racun/Vitamin' | 'Jentera & Penuaian' | 'Upah & Infrastruktur';
  price: number | string | null;
  unit: string;
  total: number;
  note: string | null;
}

export interface FarmProfile {
  farmerName: string;
  location: string;
  areaRelong: number;
  areaHectares: number;
  areaAcres: number;
  period: string;
  totalSeasons: number;
}

export interface AllTimeTotals {
  totalGrossRevenue: number;
  totalPaddySales: number;
  totalSubsidy: number;
  totalCost: number;
  totalNetBeforeZakat: number;
  totalZakat: number;
  totalNetAfterZakat: number;
  totalTonnes: number;
  totalGundi: number;
  averageYieldPerRelong: number;
  averageNetPerSeason: number;
  averageCostPerSeason: number;
}

export interface PadiDataset {
  farmProfile: FarmProfile;
  allTimeTotals: AllTimeTotals;
  seasons: SeasonData[];
  detailedCosts: Record<string, Record<string, CostItem[]>>;
}

import * as XLSX from 'xlsx';
import { PadiDataset, SeasonData, CostItem, Receipt } from '@/types/padi';

export function parsePadiWorkbook(wb: XLSX.WorkBook): PadiDataset {
  const wsDiff = wb.Sheets['Perbezaan Hasil PADI'];
  if (!wsDiff) {
    throw new Error("Helaian 'Perbezaan Hasil PADI' tidak dijumpai dalam fail.");
  }

  const diffRows = XLSX.utils.sheet_to_json<unknown[]>(wsDiff, { header: 1 });

  const seasonsMeta = [
    { sheetName: 'FEB 2020', displayName: 'FEB 2020', year: 2020, season: 'Februari', colIdx: 1 },
    { sheetName: 'FEB 2021', displayName: 'FEB 2021', year: 2021, season: 'Februari', colIdx: 2 },
    { sheetName: 'OGOS 2022', displayName: 'OGOS 2022', year: 2022, season: 'Ogos', colIdx: 3 },
    { sheetName: 'FEB23 ', displayName: 'FEB 2023', year: 2023, season: 'Februari', colIdx: 4 },
    { sheetName: 'SEPT23', displayName: 'SEPT 2023', year: 2023, season: 'September', colIdx: 5 },
    { sheetName: 'MARCH24', displayName: 'MAC 2024', year: 2024, season: 'Mac', colIdx: 6 },
    { sheetName: 'OCT24', displayName: 'OKT 2024', year: 2024, season: 'Oktober', colIdx: 7 },
    { sheetName: 'MARCH25', displayName: 'MAC 2025', year: 2025, season: 'Mac', colIdx: 8 },
    { sheetName: 'OCT25', displayName: 'OKT 2025', year: 2025, season: 'Oktober', colIdx: 9 },
    { sheetName: 'MRCH26', displayName: 'MAC 2026', year: 2026, season: 'Mac', colIdx: 10 },
    { sheetName: 'OCT26 ', displayName: 'OKT 2026', year: 2026, season: 'Oktober', colIdx: null }
  ];

  function getDiffVal(rowIdx: number, colIdx: number | null): number {
    if (!diffRows[rowIdx] || colIdx === null) return 0;
    const v = diffRows[rowIdx][colIdx];
    return typeof v === 'number' ? v : (parseFloat(String(v || 0)) || 0);
  }

  const seasons: SeasonData[] = [];

  for (const meta of seasonsMeta) {
    let sub = 0, padi = 0, gross = 0, kos = 0, net = 0, zakat = 0, netAfterZakat = 0;
    let tonnes = 0, gundi = 0, relong = 11.5, tanRelong = 0, benihRm = 0, benihType = 'MR297', harga100kg = 0;

    if (meta.colIdx !== null) {
      sub = getDiffVal(4, meta.colIdx);
      padi = getDiffVal(5, meta.colIdx);
      gross = getDiffVal(6, meta.colIdx);
      kos = getDiffVal(7, meta.colIdx);
      net = getDiffVal(8, meta.colIdx);
      zakat = getDiffVal(9, meta.colIdx);
      netAfterZakat = getDiffVal(10, meta.colIdx);
      tonnes = getDiffVal(11, meta.colIdx);
      gundi = getDiffVal(12, meta.colIdx);
      relong = getDiffVal(13, meta.colIdx) || 11.5;
      tanRelong = getDiffVal(14, meta.colIdx);
      benihRm = getDiffVal(15, meta.colIdx);
      benihType = String(diffRows[16]?.[meta.colIdx] || (meta.year >= 2024 || (meta.year === 2023 && meta.season === 'September') ? 'MR330' : 'MR297')).trim();
      harga100kg = getDiffVal(17, meta.colIdx);
    } else {
      sub = 6528.0;
      padi = 19584.0;
      gross = 26112.0;
      kos = 14772.5;
      net = 11339.5;
      zakat = 1133.95;
      netAfterZakat = 10205.55;
      tonnes = 13.056;
      gundi = 181.33;
      relong = 11.5;
      tanRelong = 1.135;
      benihRm = 65;
      benihType = 'MR330';
      harga100kg = 150;
    }

    // Receipts from individual season sheet
    const ws = wb.Sheets[meta.sheetName];
    const sheetRows: unknown[][] = ws ? XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) : [];
    
    let resitRowIdx = -1;
    const resitCols: { col: number; name: string }[] = [];
    for (let r = 0; r < Math.min(sheetRows.length, 15); r++) {
      const row = sheetRows[r] || [];
      for (let c = 0; c < row.length; c++) {
        const valStr = String(row[c] || '').trim().toUpperCase();
        if (valStr.startsWith('RESIT')) {
          resitRowIdx = r;
          resitCols.push({ col: c, name: valStr });
        }
      }
      if (resitCols.length > 0) break;
    }

    const receipts: Receipt[] = [];
    if (resitCols.length > 0) {
      let rMasuk = -1, rKeluar = -1, rTimbang = -1, rBasah = -1, rHampa = -1, rHijau = -1, rRosak = -1, rKotor = -1, rWb = -1;
      let rGuni = -1, rHarga = -1, rBersih = -1, rBayaran = -1, rSubsidi = -1;

      for (let r = resitRowIdx + 1; r < Math.min(sheetRows.length, resitRowIdx + 30); r++) {
        const row = sheetRows[r] || [];
        const lbl = String(row[1] || row[0] || '').trim().toUpperCase();
        const unit = String(row[2] || '').trim().toUpperCase();

        if (lbl.includes('BERAT MASUK')) rMasuk = r;
        else if (lbl.includes('BERAT KELUAR')) rKeluar = r;
        else if (lbl.includes('BERAT TIMBANG')) rTimbang = r;
        else if (lbl === 'BASAH' && unit !== 'KG' && rBasah === -1) rBasah = r;
        else if (lbl.includes('HAMPA')) rHampa = r;
        else if (lbl.includes('HIJAU')) rHijau = r;
        else if (lbl.includes('ROSAK')) rRosak = r;
        else if (lbl.includes('KOTOR')) rKotor = r;
        else if (lbl.includes('WB')) rWb = r;
        else if (lbl.includes('GUNI')) rGuni = r;
        else if (lbl.includes('HARGA') && !lbl.includes('TAMBAHAN')) rHarga = r;
        else if (lbl.includes('BERAT BERSIH')) rBersih = r;
        else if (lbl.includes('BAYARAN') && !lbl.includes('SUBSIDI')) rBayaran = r;
        else if (lbl.includes('SUBSIDI') && !lbl.includes('TOTAL') && !lbl.includes('GRAND')) rSubsidi = r;
      }

      function toPct(v: unknown): number {
        if (v === undefined || v === null) return 0;
        const num = parseFloat(String(v)) || 0;
        return num <= 1 ? Math.round(num * 1000) / 10 : Math.round(num * 10) / 10;
      }

      for (const res of resitCols) {
        const bMasuk = sheetRows[rMasuk]?.[res.col];
        const bKeluar = sheetRows[rKeluar]?.[res.col];
        const bTimbang = sheetRows[rTimbang]?.[res.col];
        const bBersih = sheetRows[rBersih]?.[res.col];
        const bayaran = sheetRows[rBayaran]?.[res.col];
        const subVal = sheetRows[rSubsidi]?.[res.col];
        const guniVal = sheetRows[rGuni]?.[res.col];
        const hargaVal = sheetRows[rHarga]?.[res.col];

        const basahVal = sheetRows[rBasah]?.[res.col];
        const hampaVal = sheetRows[rHampa]?.[res.col];
        const hijauVal = sheetRows[rHijau]?.[res.col];
        const rosakVal = sheetRows[rRosak]?.[res.col];
        const kotorVal = sheetRows[rKotor]?.[res.col];
        const wbVal = sheetRows[rWb]?.[res.col];

        const checkArr = [bMasuk, bTimbang, bBersih, bayaran];
        if (checkArr.some(x => typeof x === 'number' && x > 0)) {
          receipts.push({
            resitNo: res.name,
            beratMasukKg: typeof bMasuk === 'number' ? Math.round(bMasuk * 100) / 100 : null,
            beratKeluarKg: typeof bKeluar === 'number' ? Math.round(bKeluar * 100) / 100 : null,
            beratTimbanganKg: typeof bTimbang === 'number' ? Math.round(bTimbang * 100) / 100 : null,
            potongan: {
              basahPct: toPct(basahVal !== undefined ? basahVal : 0.08),
              hampaPct: toPct(hampaVal !== undefined ? hampaVal : 0.04),
              hijauPct: toPct(hijauVal !== undefined ? hijauVal : 0.03),
              rosakPct: toPct(rosakVal !== undefined ? rosakVal : 0.02),
              kotorPct: toPct(kotorVal !== undefined ? kotorVal : 0.03),
              wbPct: toPct(wbVal !== undefined ? wbVal : 0.20)
            },
            bilGuni: typeof guniVal === 'number' ? Math.round(guniVal * 10) / 10 : null,
            hargaPer100kg: typeof hargaVal === 'number' ? Math.round(hargaVal * 100) / 100 : null,
            beratBersihKg: typeof bBersih === 'number' ? Math.round(bBersih * 100) / 100 : null,
            jumlahBayaranRM: typeof bayaran === 'number' ? Math.round(bayaran * 100) / 100 : null,
            subsidiRM: typeof subVal === 'number' ? Math.round(subVal * 100) / 100 : null
          });
        }
      }
    }

    seasons.push({
      id: meta.sheetName.trim().replace(/\s+/g, '_').toLowerCase(),
      sheetName: meta.sheetName,
      name: meta.displayName,
      year: meta.year,
      season: meta.season,
      seedType: benihType,
      seedPrice: benihRm,
      paddyPrice100kg: harga100kg,
      financials: {
        subsidy: Math.round(sub * 100) / 100,
        paddySales: Math.round(padi * 100) / 100,
        grossRevenue: Math.round(gross * 100) / 100,
        cost: Math.round(kos * 100) / 100,
        netBeforeZakat: Math.round(net * 100) / 100,
        zakat: Math.round(zakat * 100) / 100,
        netAfterZakat: Math.round(netAfterZakat * 100) / 100,
        profitMarginPct: gross > 0 ? Math.round((net / gross) * 1000) / 10 : 0
      },
      production: {
        tonnes: Math.round(tonnes * 1000) / 1000,
        gundi: Math.round(gundi * 10) / 10,
        relong: relong,
        yieldPerRelong: Math.round(tanRelong * 1000) / 1000
      },
      receipts: receipts
    });
  }

  // Parse Detailed Costs
  function categorizeCost(itemName: string): CostItem['category'] {
    const itemUpper = itemName.toUpperCase();
    if (['BENIH', 'RENDAM', 'TANGGUNG', 'TABUR', 'SEMAI', 'SULAM'].some(w => itemUpper.includes(w))) {
      return 'Benih & Semaian';
    } else if (['RACUN', 'VITAMIN', 'ULAT', 'SIPUT', 'RUMPUT', 'TENGKORAK', 'SEMBUR'].some(w => itemUpper.includes(w))) {
      return 'Rawatan & Racun/Vitamin';
    } else if (['MESIN', 'TERAKTOR', 'TRAKTOR', 'BELUH', 'BALAS', 'BADAL', 'KUPON', 'LORI'].some(w => itemUpper.includes(w))) {
      return 'Jentera & Penuaian';
    } else {
      return 'Upah & Infrastruktur';
    }
  }

  const costSheetsConfig: [string, string, [string, number][]][] = [
    ['2023', 'KOS 2023', [['FEB 2023', 2], ['SEPT 2023', 6]]],
    ['2024', 'KOS 2024', [['MAC 2024', 2], ['OKT 2024', 6]]],
    ['2025', 'KOS 2025', [['MAC 2025', 2], ['OKT 2025', 6]]],
    ['2026', 'KOS 2026', [['MAC 2026', 2], ['OKT 2026', 6]]]
  ];

  const detailedCosts: Record<string, Record<string, CostItem[]>> = {};

  for (const [yr, sheetName, seasonCols] of costSheetsConfig) {
    const ws = wb.Sheets[sheetName];
    detailedCosts[yr] = {};
    if (!ws) continue;

    const rows: unknown[][] = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });

    for (const [sName, colStart] of seasonCols) {
      const items: CostItem[] = [];
      for (let r = 5; r < rows.length; r++) {
        const row = rows[r] || [];
        const itemRaw = row[1];
        if (!itemRaw) continue;
        const itemStr = String(itemRaw).trim();
        if (['TOTAL', 'GRAND', 'KOS PENANAMAN', 'BIL'].some(x => itemStr.toUpperCase().startsWith(x))) {
          continue;
        }

        const num = row[0];
        const p = row[colStart];
        const u = row[colStart + 1];
        const t = row[colStart + 2];
        const note = row[10];

        let totVal = 0;
        if (typeof t === 'number') {
          totVal = t;
        } else if (typeof p === 'number' && typeof u === 'number') {
          totVal = p * u;
        }

        if (totVal > 0 || (p !== undefined && String(p) !== '0')) {
          items.push({
            num: num !== undefined && num !== null ? String(num) : '',
            item: itemStr,
            category: categorizeCost(itemStr),
            price: typeof p === 'number' ? Math.round(p * 100) / 100 : (p !== undefined && p !== null ? String(p) : null),
            unit: u !== undefined && u !== null ? String(u) : '',
            total: Math.round(totVal * 100) / 100,
            note: note !== undefined && note !== null ? String(note).trim() : null
          });
        }
      }
      detailedCosts[yr][sName] = items;
    }
  }

  const farmProfile = {
    farmerName: 'Zulfa bt Md Ramli',
    location: 'Bendang di Sungai Baru',
    areaRelong: 11.5,
    areaHectares: 3.3,
    areaAcres: 8.16,
    period: '2020 - 2026',
    totalSeasons: seasons.length
  };

  const allTimeTotals = {
    totalGrossRevenue: Math.round(seasons.reduce((acc, s) => acc + s.financials.grossRevenue, 0) * 100) / 100,
    totalPaddySales: Math.round(seasons.reduce((acc, s) => acc + s.financials.paddySales, 0) * 100) / 100,
    totalSubsidy: Math.round(seasons.reduce((acc, s) => acc + s.financials.subsidy, 0) * 100) / 100,
    totalCost: Math.round(seasons.reduce((acc, s) => acc + s.financials.cost, 0) * 100) / 100,
    totalNetBeforeZakat: Math.round(seasons.reduce((acc, s) => acc + s.financials.netBeforeZakat, 0) * 100) / 100,
    totalZakat: Math.round(seasons.reduce((acc, s) => acc + s.financials.zakat, 0) * 100) / 100,
    totalNetAfterZakat: Math.round(seasons.reduce((acc, s) => acc + s.financials.netAfterZakat, 0) * 100) / 100,
    totalTonnes: Math.round(seasons.reduce((acc, s) => acc + s.production.tonnes, 0) * 100) / 100,
    totalGundi: Math.round(seasons.reduce((acc, s) => acc + s.production.gundi, 0) * 10) / 10,
    averageYieldPerRelong: Math.round((seasons.reduce((acc, s) => acc + s.production.yieldPerRelong, 0) / seasons.length) * 1000) / 1000,
    averageNetPerSeason: Math.round((seasons.reduce((acc, s) => acc + s.financials.netAfterZakat, 0) / seasons.length) * 100) / 100,
    averageCostPerSeason: Math.round((seasons.reduce((acc, s) => acc + s.financials.cost, 0) / seasons.length) * 100) / 100
  };

  return {
    farmProfile,
    allTimeTotals,
    seasons,
    detailedCosts
  };
}

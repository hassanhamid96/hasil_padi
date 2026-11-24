import * as XLSX from 'xlsx';
import { PadiDataset, SeasonData, CostItem, Receipt } from '@/types/padi';

export function parsePadiWorkbook(wb: XLSX.WorkBook): PadiDataset {
  const wsDiff = wb.Sheets['Perbezaan Hasil PADI'];
  if (!wsDiff) {
    throw new Error("Helaian 'Perbezaan Hasil PADI' tidak dijumpai dalam fail.");
  }

  const diffRows = XLSX.utils.sheet_to_json<unknown[]>(wsDiff, { header: 1 });

  // 1. Locate the HURAIAN row in Perbezaan Hasil PADI
  let huraianRowIdx = -1;
  let labelColIdx = 1;
  for (let r = 0; r < Math.min(diffRows.length, 6); r++) {
    const row = diffRows[r] || [];
    for (let c = 0; c < row.length; c++) {
      if (String(row[c] || '').trim().toUpperCase() === 'HURAIAN') {
        huraianRowIdx = r;
        labelColIdx = c;
        break;
      }
    }
    if (huraianRowIdx !== -1) break;
  }

  if (huraianRowIdx === -1) {
    huraianRowIdx = 2; // Default fallback
    labelColIdx = 1;
  }

  // 2. Map row indices for each metric in Perbezaan Hasil PADI
  const metricMap: Record<string, number> = {};
  for (let r = huraianRowIdx + 1; r < diffRows.length; r++) {
    const lbl = String(diffRows[r]?.[labelColIdx] || '').trim().toUpperCase();
    if (lbl) {
      if (lbl.includes('SUBSIDI (RM)')) metricMap['subsidi'] = r;
      else if (lbl.includes('TOTAL PADI')) metricMap['padi'] = r;
      else if (lbl.includes('TOTAL KESELURUHAN')) metricMap['gross'] = r;
      else if (lbl.includes('UPAH + KOS')) metricMap['kos'] = r;
      else if (lbl.includes('BERSIH (RM) TOLAK KOS')) metricMap['netBeforeZakat'] = r;
      else if (lbl.includes('ZAKAT 10%')) metricMap['zakat'] = r;
      else if (lbl.includes('TOLAK ZAKAT')) metricMap['netAfterZakat'] = r;
      else if (lbl === 'TAN') metricMap['tonnes'] = r;
      else if (lbl.includes('GUNDI')) metricMap['gundi'] = r;
      else if (lbl.includes('RELONG') && !lbl.includes('TAN/')) metricMap['relong'] = r;
      else if (lbl.includes('TAN/RELONG')) metricMap['tanRelong'] = r;
      else if (lbl.includes('BENIH RM')) metricMap['benihRm'] = r;
      else if (lbl.includes('JENIS BENIH')) metricMap['benihType'] = r;
      else if (lbl.includes('HARGA PADI 100KG')) metricMap['harga100kg'] = r;
    }
  }

  // Helper to extract numeric value from diffRows
  function getDiffVal(rowName: string, colIdx: number): number {
    const rIdx = metricMap[rowName];
    if (rIdx === undefined || !diffRows[rIdx]) return 0;
    const v = diffRows[rIdx][colIdx];
    return typeof v === 'number' ? v : (parseFloat(String(v || 0)) || 0);
  }

  // Helper to match sheet name for a season
  function findMatchingSheet(year: number, monthStr: string): string | null {
    const shortYr2 = String(year).slice(-2);
    const shortYr4 = String(year);
    const mCodes: string[] = [];
    const mUp = monthStr.toUpperCase();
    if (mUp.includes('FEB')) mCodes.push('FEB');
    if (mUp.includes('MAC') || mUp.includes('MAR') || mUp.includes('MRCH')) mCodes.push('MAR', 'MAC', 'MRCH');
    if (mUp.includes('OGOS') || mUp.includes('AUG')) mCodes.push('OGOS', 'AUG');
    if (mUp.includes('SEP')) mCodes.push('SEP', 'SEPT');
    if (mUp.includes('OKT') || mUp.includes('OCT')) mCodes.push('OKT', 'OCT');

    for (const name of wb.SheetNames) {
      const nUp = name.trim().toUpperCase();
      if (nUp.startsWith('KOS') || nUp.includes('PERBEZAAN') || nUp.includes('CHART')) continue;
      const hasYr = nUp.includes(shortYr2) || nUp.includes(shortYr4);
      const hasM = mCodes.some(code => nUp.includes(code));
      if (hasYr && hasM) {
        return name;
      }
    }
    return null;
  }

  // Parse receipt slips from an individual season sheet
  function parseSheetReceipts(sheetName: string): Receipt[] {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];

    const sheetRows: unknown[][] = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
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

    if (resitCols.length === 0) return [];

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

    const receipts: Receipt[] = [];
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
    return receipts;
  }

  // Helper to parse standalone season sheet summary (e.g. OCT26, MARCH27)
  function parseStandaloneSheetSummary(sheetName: string, yr: number, monthName: string, display: string): SeasonData {
    const ws = wb.Sheets[sheetName];
    const sheetRows: unknown[][] = ws ? XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) : [];
    
    let sub = 0, padi = 0, gross = 0, kos = 0, net = 0, zakat = 0, netAfterZakat = 0;
    let tonnes = 0, gundi = 0, harga = 150;

    for (const r of sheetRows) {
      const lbl = String(r[1] || r[0] || '').trim().toUpperCase();
      for (let c = 2; c < r.length; c++) {
        const v = r[c];
        if (typeof v === 'number' && v > 0) {
          if (lbl.includes('TOTAL SUBSIDI')) sub = v;
          else if (lbl.includes('TOTAL PADI')) padi = v;
          else if (lbl.includes('GRAND TOTAL SUB')) gross = v;
          else if (lbl.includes('UPAH + KOS')) kos = v;
          else if (lbl === 'TOT. BERSIH' || lbl.includes('TOT. BERSIH (RM)')) net = v;
          else if (lbl.includes('ZAKAT') && !lbl.includes('TOLAK')) zakat = v;
          else if (lbl.includes('TOLAK KOS & ZAKAT') || lbl.includes('TOLAK ZAKAT')) netAfterZakat = v;
          else if (lbl.includes('HARGA') && !lbl.includes('TAMBAHAN') && harga === 150) harga = v;
        }
        const colLbl = String(r[c] || '').trim().toUpperCase();
        if (colLbl.includes('JUMLAH PADI (TAN)')) {
          const tVal = r[c + 1];
          if (typeof tVal === 'number') tonnes = tVal;
        } else if (colLbl.includes('JUMLAH PADI (GUNDI)')) {
          const gVal = r[c + 1];
          if (typeof gVal === 'number') gundi = gVal;
        }
      }
    }

    if (tonnes === 0 && padi > 0 && harga > 0) {
      tonnes = (padi / harga) * 0.1;
    }
    if (gundi === 0 && tonnes > 0) {
      gundi = tonnes * 13.888;
    }
    if (zakat === 0 && net > 0) {
      zakat = net * 0.1;
    }
    if (netAfterZakat === 0 && net > 0) {
      netAfterZakat = net - zakat;
    }

    const relong = 11.5;
    const tanRelong = relong > 0 ? tonnes / relong : 0;
    const receipts = parseSheetReceipts(sheetName);

    return {
      id: sheetName.trim().replace(/\s+/g, '_').toLowerCase(),
      sheetName,
      name: display,
      year: yr,
      season: monthName,
      seedType: 'MR330',
      seedPrice: 65,
      paddyPrice100kg: harga,
      financials: {
        subsidy: Math.round(sub * 100) / 100,
        paddySales: Math.round(padi * 100) / 100,
        grossRevenue: Math.round((gross || sub + padi) * 100) / 100,
        cost: Math.round(kos * 100) / 100,
        netBeforeZakat: Math.round(net * 100) / 100,
        zakat: Math.round(zakat * 100) / 100,
        netAfterZakat: Math.round(netAfterZakat * 100) / 100,
        profitMarginPct: gross > 0 ? Math.round((net / gross) * 1000) / 10 : 0
      },
      production: {
        tonnes: Math.round(tonnes * 1000) / 1000,
        gundi: Math.round(gundi * 10) / 10,
        relong,
        yieldPerRelong: Math.round(tanRelong * 1000) / 1000
      },
      receipts
    };
  }

  // 3. Dynamically discover all season columns from Perbezaan Hasil PADI
  const headerRow = diffRows[huraianRowIdx] || [];
  const seasons: SeasonData[] = [];
  const processedSheetNames = new Set<string>();

  for (let c = labelColIdx + 1; c < headerRow.length; c++) {
    const rawVal = String(headerRow[c] || '').trim();
    if (!rawVal) continue;

    const yrMatch = rawVal.match(/(20\d\d|\d{2})/);
    if (!yrMatch) continue;

    const yr = yrMatch[1].length === 2 ? 2000 + parseInt(yrMatch[1]) : parseInt(yrMatch[1]);
    const sUp = rawVal.toUpperCase();
    let monthName = 'Musim';
    let prefix = 'MUSIM';

    if (sUp.includes('FEB')) { monthName = 'Februari'; prefix = 'FEB'; }
    else if (sUp.includes('MAR') || sUp.includes('MAC') || sUp.includes('MRCH')) { monthName = 'Mac'; prefix = 'MAC'; }
    else if (sUp.includes('OGOS') || sUp.includes('AUG')) { monthName = 'Ogos'; prefix = 'OGOS'; }
    else if (sUp.includes('SEP')) { monthName = 'September'; prefix = 'SEPT'; }
    else if (sUp.includes('OKT') || sUp.includes('OCT')) { monthName = 'Oktober'; prefix = 'OKT'; }

    const displayName = `${prefix} ${yr}`;
    const matchedSheet = findMatchingSheet(yr, rawVal);
    if (matchedSheet) processedSheetNames.add(matchedSheet);

    const sub = getDiffVal('subsidi', c);
    const padi = getDiffVal('padi', c);
    const gross = getDiffVal('gross', c);
    const kos = getDiffVal('kos', c);
    const net = getDiffVal('netBeforeZakat', c);
    const zakat = getDiffVal('zakat', c);
    const netAfterZakat = getDiffVal('netAfterZakat', c);
    const tonnes = getDiffVal('tonnes', c);
    const gundi = getDiffVal('gundi', c);
    const relong = getDiffVal('relong', c) || 11.5;
    const tanRelong = getDiffVal('tanRelong', c);
    const benihRm = getDiffVal('benihRm', c);
    const benihTypeRowIdx = metricMap['benihType'];
    const benihType = String(diffRows[benihTypeRowIdx]?.[c] || (yr >= 2024 || (yr === 2023 && monthName === 'September') ? 'MR330' : 'MR297')).trim();
    const harga100kg = getDiffVal('harga100kg', c) || 150;

    const receipts = matchedSheet ? parseSheetReceipts(matchedSheet) : [];

    seasons.push({
      id: rawVal.trim().replace(/\s+/g, '_').toLowerCase(),
      sheetName: matchedSheet || rawVal,
      name: displayName,
      year: yr,
      season: monthName,
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
        relong: relong || 11.5,
        yieldPerRelong: Math.round(tanRelong * 1000) / 1000
      },
      receipts
    });
  }

  // 4. Also check for any standalone season sheets in wb.SheetNames that weren't in Perbezaan Hasil PADI
  for (const sheetName of wb.SheetNames) {
    if (processedSheetNames.has(sheetName)) continue;
    const nUp = sheetName.trim().toUpperCase();
    if (nUp.startsWith('KOS') || nUp.includes('PERBEZAAN') || nUp.includes('CHART') || nUp.includes('BLANK') || nUp.includes('SHEET')) {
      continue;
    }

    const yrMatch = nUp.match(/(20\d\d|\d{2})/);
    const hasMonth = ['FEB', 'MAR', 'MAC', 'MRCH', 'OGOS', 'AUG', 'SEP', 'OKT', 'OCT'].some(m => nUp.includes(m));

    if (yrMatch && hasMonth) {
      const yr = yrMatch[1].length === 2 ? 2000 + parseInt(yrMatch[1]) : parseInt(yrMatch[1]);
      let monthName = 'Musim';
      let prefix = 'MUSIM';

      if (nUp.includes('FEB')) { monthName = 'Februari'; prefix = 'FEB'; }
      else if (nUp.includes('MAR') || nUp.includes('MAC') || nUp.includes('MRCH')) { monthName = 'Mac'; prefix = 'MAC'; }
      else if (nUp.includes('OGOS') || nUp.includes('AUG')) { monthName = 'Ogos'; prefix = 'OGOS'; }
      else if (nUp.includes('SEP')) { monthName = 'September'; prefix = 'SEPT'; }
      else if (nUp.includes('OKT') || nUp.includes('OCT')) { monthName = 'Oktober'; prefix = 'OKT'; }

      const standaloneSeason = parseStandaloneSheetSummary(sheetName, yr, monthName, `${prefix} ${yr}`);
      seasons.push(standaloneSeason);
      processedSheetNames.add(sheetName);
    }
  }

  // Sort seasons chronologically
  const monthOrder: Record<string, number> = {
    'Februari': 2,
    'Mac': 3,
    'Ogos': 8,
    'September': 9,
    'Oktober': 10
  };

  seasons.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (monthOrder[a.season] || 5) - (monthOrder[b.season] || 5);
  });

  // 5. Dynamically discover all KOS sheets (KOS 2023, KOS 2024, KOS 2025, KOS 2026, KOS 2027, etc.)
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

  const detailedCosts: Record<string, Record<string, CostItem[]>> = {};

  const kosSheetNames = wb.SheetNames.filter(name => {
    const clean = name.trim().toUpperCase();
    return clean.startsWith('KOS ') && /\d{4}/.test(clean);
  });

  for (const sheetName of kosSheetNames) {
    const yrMatch = sheetName.match(/\d{4}/);
    if (!yrMatch) continue;
    const yr = yrMatch[0];

    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const rows: unknown[][] = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
    detailedCosts[yr] = {};

    // Discover the two season columns in Row 2 or 3
    const seasonCols: [string, number][] = [];
    const headerRowIdx = rows.findIndex((r, idx) => idx < 5 && r.some(c => typeof c === 'string' && ['FEB', 'MAC', 'MAR', 'OCT', 'OKT', 'SEPT'].some(m => String(c).toUpperCase().includes(m))));
    
    if (headerRowIdx !== -1) {
      const hRow = rows[headerRowIdx] || [];
      for (let c = 0; c < hRow.length; c++) {
        const val = String(hRow[c] || '').trim();
        if (val && ['FEB', 'MAC', 'MAR', 'OCT', 'OKT', 'SEPT', 'OGOS'].some(m => val.toUpperCase().includes(m))) {
          seasonCols.push([val, c]);
        }
      }
    }

    // Default column fallback if row header isn't parsed
    if (seasonCols.length === 0) {
      seasonCols.push([`MAC ${yr}`, 2], [`OKT ${yr}`, 6]);
    }

    for (const [sName, colStart] of seasonCols) {
      const items: CostItem[] = [];
      const startRow = Math.max(headerRowIdx + 2, 5);

      for (let r = startRow; r < rows.length; r++) {
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

  // Determine dynamic year range for profile
  const years = seasons.map(s => s.year);
  const minYear = years.length > 0 ? Math.min(...years) : 2020;
  const maxYear = years.length > 0 ? Math.max(...years) : 2026;

  const farmProfile = {
    farmerName: 'Zulfa bt Md Ramli',
    location: 'Bendang di Sungai Baru',
    areaRelong: 11.5,
    areaHectares: 3.3,
    areaAcres: 8.16,
    period: `${minYear} – ${maxYear}`,
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
    averageYieldPerRelong: seasons.length > 0 ? Math.round((seasons.reduce((acc, s) => acc + s.production.yieldPerRelong, 0) / seasons.length) * 1000) / 1000 : 0,
    averageNetPerSeason: seasons.length > 0 ? Math.round((seasons.reduce((acc, s) => acc + s.financials.netAfterZakat, 0) / seasons.length) * 100) / 100 : 0,
    averageCostPerSeason: seasons.length > 0 ? Math.round((seasons.reduce((acc, s) => acc + s.financials.cost, 0) / seasons.length) * 100) / 100 : 0
  };

  return {
    farmProfile,
    allTimeTotals,
    seasons,
    detailedCosts
  };
}

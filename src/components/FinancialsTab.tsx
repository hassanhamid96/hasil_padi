'use client';

import React, { useState } from 'react';
import { SeasonData, CostItem, AllTimeTotals } from '@/types/padi';
import { formatRM, formatNumber, formatPct } from '@/lib/formatters';
import { 
  DollarSign, 
  FileSpreadsheet, 
  TrendingDown, 
  ShieldAlert, 
  Coins, 
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

interface FinancialsTabProps {
  seasons?: SeasonData[];
  detailedCosts: Record<string, Record<string, CostItem[]>>;
  totals: AllTimeTotals;
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ detailedCosts, totals }) => {
  const years = Object.keys(detailedCosts).sort();
  const [selectedYear, setSelectedYear] = useState<string>(years[years.length - 1] || '2025');
  
  const currentYearSeasons = detailedCosts[selectedYear] ? Object.keys(detailedCosts[selectedYear]) : [];
  const [selectedSeasonName, setSelectedSeasonName] = useState<string>(currentYearSeasons[0] || '');

  // Active items for selected year and season
  const activeCostItems: CostItem[] = (detailedCosts[selectedYear] && detailedCosts[selectedYear][selectedSeasonName]) 
    ? detailedCosts[selectedYear][selectedSeasonName] 
    : [];

  // Group active cost items by category
  const categoryTotals: Record<string, number> = {};
  activeCostItems.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.total;
  });

  const categoryColors: Record<string, string> = {
    'Benih & Semaian': '#10b981',
    'Rawatan & Racun/Vitamin': '#3b82f6',
    'Jentera & Penuaian': '#f59e0b',
    'Upah & Infrastruktur': '#8b5cf6'
  };

  const pieData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: cat,
    value: total,
    color: categoryColors[cat] || '#64748b'
  }));

  const totalSelectedSeasonCost = activeCostItems.reduce((acc, it) => acc + it.total, 0);

  return (
    <div className="space-y-8">
      {/* Financial Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Kos Operasi</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatRM(totals.totalCost)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Purata {formatRM(totals.averageCostPerSeason)} semusim
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Subsidi Kerajaan</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatRM(totals.totalSubsidy)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            22.9% daripada pendapatan keseluruhan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Untung Bersih</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatRM(totals.totalNetAfterZakat)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Selepas tolak kos operasi & zakat 10%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Zakat 10%</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatRM(totals.totalZakat)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            10% daripada untung bersih tunai
          </div>
        </div>
      </div>

      {/* Detailed Cost Explorer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Pemeriksa Terperinci Kos Penanaman Padi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Data terperinci kos operasi mengikut tahun dan musim (rekod 2023 - 2026)
            </p>
          </div>

          {/* Selectors for Year and Season */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-xs text-slate-500 px-2 font-medium">Tahun:</span>
              {years.map(yr => (
                <button
                  key={yr}
                  onClick={() => {
                    setSelectedYear(yr);
                    const sList = Object.keys(detailedCosts[yr] || {});
                    if (sList.length > 0) setSelectedSeasonName(sList[0]);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <span className="text-xs text-slate-500 px-2 font-medium">Musim:</span>
              {currentYearSeasons.map(sName => (
                <button
                  key={sName}
                  onClick={() => setSelectedSeasonName(sName)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    selectedSeasonName === sName
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown & Pie Chart */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1 h-64 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [formatRM(Number(val)), 'Jumlah']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Tiada data pecahan kos</div>
            )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-3">
            {Object.entries(categoryColors).map(([catName, col]) => {
              const amount = categoryTotals[catName] || 0;
              const pct = totalSelectedSeasonCost > 0 ? (amount / totalSelectedSeasonCost) * 100 : 0;
              return (
                <div key={catName} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col }}></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{catName}</span>
                  </div>
                  <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                    {formatRM(amount)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {formatPct(pct)} daripada jumlah kos musim
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized Cost Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Bil</th>
                <th className="py-3 px-4">Huraian / Perkara</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Harga (RM)</th>
                <th className="py-3 px-3 text-center">Unit / Kuantiti</th>
                <th className="py-3 px-4 text-right">Jumlah (RM)</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeCostItems.length > 0 ? (
                activeCostItems.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{item.num || idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{item.item}</td>
                    <td className="py-2.5 px-3">
                      <span 
                        className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: `${categoryColors[item.category]}20`,
                          color: categoryColors[item.category]
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {typeof item.price === 'number' ? formatNumber(item.price, 2) : (item.price || '-')}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.unit || '-'}</td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono text-slate-900 dark:text-white">
                      {formatRM(item.total)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 italic text-[11px] max-w-xs truncate">
                      {item.note || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Tiada item kos direkodkan untuk musim ini
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-slate-900 dark:text-white uppercase text-right">
                  Grand Total Kos ({selectedSeasonName}) :
                </td>
                <td className="py-3 px-4 text-right text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                  {formatRM(totalSelectedSeasonCost)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Zakat & Subsidy Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zakat Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Pengiraan Zakat Tanaman Padi (10%)
              </h4>
              <p className="text-xs text-slate-500">
                Lembaga Zakat Negeri Kedah (LZNK) & Panduan Syariah
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Zakat tanaman padi adalah wajib dikeluarkan sebanyak <strong>10%</strong> (atau 5% bergantung sumber pengairan/kos). Dalam rekod buku laporan ini, zakat dikira berasaskan formula:
          </p>

          <div className="bg-purple-50 dark:bg-purple-950/30 p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/40 text-xs font-mono text-purple-900 dark:text-purple-300">
            Zakat = (Jumlah Kasar - Kos Operasi) × 10%
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Jumlah Zakat 11 Musim:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{formatRM(totals.totalZakat)}</span>
          </div>
        </div>

        {/* Subsidy Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Skim Subsidi Harga Padi (SSHP)
              </h4>
              <p className="text-xs text-slate-500">
                Kementerian Pertanian & Keterjaminan Makanan (KPKM)
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Subsidi kerajaan disalurkan terus melalui Bernas/kilang berdasarkan timbangan bersih padi. Kenaikan kadar subsidi daripada <strong>RM360 kepada RM500 per Tan</strong> pada September 2023 telah menambah purata pendapatan bersih petani secara ketara.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/40 text-xs font-mono text-blue-900 dark:text-blue-300">
            Kadar Subsidi: RM 500 / Tan (~RM 50 / 100kg bersih)
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Jumlah Subsidi Diterima:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatRM(totals.totalSubsidy)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

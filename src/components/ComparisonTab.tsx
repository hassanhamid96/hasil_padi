'use client';

import React, { useState } from 'react';
import { SeasonData, AllTimeTotals } from '@/types/padi';
import { formatRM, formatNumber, formatPct } from '@/lib/formatters';
import { 
  ArrowUpDown, 
  Table, 
  Award
} from 'lucide-react';

interface ComparisonTabProps {
  seasons: SeasonData[];
  totals: AllTimeTotals;
}

type SortField = 'year' | 'tonnes' | 'yieldPerRelong' | 'grossRevenue' | 'cost' | 'netAfterZakat' | 'profitMarginPct';

export const ComparisonTab: React.FC<ComparisonTabProps> = ({ seasons, totals }) => {
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedSeasons = [...seasons].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    switch (sortField) {
      case 'year':
        aVal = a.year * 100 + (a.season.includes('Feb') || a.season.includes('Mac') ? 1 : 2);
        bVal = b.year * 100 + (b.season.includes('Feb') || b.season.includes('Mac') ? 1 : 2);
        break;
      case 'tonnes':
        aVal = a.production.tonnes;
        bVal = b.production.tonnes;
        break;
      case 'yieldPerRelong':
        aVal = a.production.yieldPerRelong;
        bVal = b.production.yieldPerRelong;
        break;
      case 'grossRevenue':
        aVal = a.financials.grossRevenue;
        bVal = b.financials.grossRevenue;
        break;
      case 'cost':
        aVal = a.financials.cost;
        bVal = b.financials.cost;
        break;
      case 'netAfterZakat':
        aVal = a.financials.netAfterZakat;
        bVal = b.financials.netAfterZakat;
        break;
      case 'profitMarginPct':
        aVal = a.financials.profitMarginPct;
        bVal = b.financials.profitMarginPct;
        break;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  // Calculate highest and lowest for highlighting
  const maxNet = Math.max(...seasons.map(s => s.financials.netAfterZakat));
  const minNet = Math.min(...seasons.map(s => s.financials.netAfterZakat));
  const maxYield = Math.max(...seasons.map(s => s.production.tonnes));

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-600" />
            Matriks Perbandingan Prestasi Keseluruhan ({seasons.length} Musim)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Klik pada kepala lajur untuk menyusun jadual mengikut hasil, pendapatan atau margin keuntungan
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500 inline-block"></span>
            <span>Musim Tertinggi</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500 inline-block"></span>
            <span>Musim Terendah</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th 
                  onClick={() => handleSort('year')} 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Musim</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Benih</th>
                <th className="py-3 px-3 text-right">Harga / 100kg</th>
                <th 
                  onClick={() => handleSort('tonnes')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Hasil (Tan)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('yieldPerRelong')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tan/Relong</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Jualan Padi (RM)</th>
                <th className="py-3 px-3 text-right">Subsidi (RM)</th>
                <th 
                  onClick={() => handleSort('grossRevenue')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Jumlah Kasar (RM)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cost')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Kos (RM)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Zakat 10% (RM)</th>
                <th 
                  onClick={() => handleSort('netAfterZakat')} 
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Untung Bersih (RM)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('profitMarginPct')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sortedSeasons.map((s) => {
                const isMax = s.financials.netAfterZakat === maxNet;
                const isMin = s.financials.netAfterZakat === minNet;
                const isMaxYield = s.production.tonnes === maxYield;

                return (
                  <tr 
                    key={s.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isMax ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : isMin ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {isMax && (
                          <span title="Rekod Untung Bersih Tertinggi">
                            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.seedType === 'MR330' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}>
                        {s.seedType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">RM {s.paddyPrice100kg}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      <span className={isMaxYield ? 'text-amber-600 font-bold' : ''}>
                        {formatNumber(s.production.tonnes, 3)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatNumber(s.production.yieldPerRelong, 3)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatRM(s.financials.paddySales)}</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">{formatRM(s.financials.subsidy)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{formatRM(s.financials.grossRevenue)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">{formatRM(s.financials.cost)}</td>
                    <td className="py-3 px-3 text-right font-mono text-purple-600 dark:text-purple-400">{formatRM(s.financials.zakat)}</td>
                    <td className={`py-3 px-4 text-right font-mono font-black text-sm ${
                      isMax ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatRM(s.financials.netAfterZakat)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {formatPct(s.financials.profitMarginPct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white uppercase font-black">
                  Jumlah Keseluruhan :
                </td>
                <td className="py-3.5 px-3 font-semibold text-slate-500">{seasons.length} Musim</td>
                <td className="py-3.5 px-3 text-right font-mono font-normal text-slate-500">-</td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-amber-600">
                  {formatNumber(totals.totalTonnes, 2)} Tan
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-600">
                  Purata {formatNumber(totals.averageYieldPerRelong, 3)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-black">{formatRM(totals.totalPaddySales)}</td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-blue-600">{formatRM(totals.totalSubsidy)}</td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                  {formatRM(totals.totalGrossRevenue)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-rose-600">{formatRM(totals.totalCost)}</td>
                <td className="py-3.5 px-3 text-right font-mono font-black text-purple-600">{formatRM(totals.totalZakat)}</td>
                <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                  {formatRM(totals.totalNetAfterZakat)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-black">
                  {formatPct((totals.totalNetBeforeZakat / totals.totalGrossRevenue) * 100)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

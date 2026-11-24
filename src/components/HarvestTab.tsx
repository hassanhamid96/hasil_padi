'use client';

import React, { useState } from 'react';
import { SeasonData, AllTimeTotals } from '@/types/padi';
import { formatNumber, formatRM } from '@/lib/formatters';
import { 
  Wheat, 
  TrendingUp, 
  Scale, 
  Tag, 
  BarChart2 
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface HarvestTabProps {
  seasons: SeasonData[];
  totals: AllTimeTotals;
}

export const HarvestTab: React.FC<HarvestTabProps> = ({ seasons, totals }) => {
  const [metricView, setMetricView] = useState<'tonnes' | 'yieldPerRelong' | 'gundi'>('tonnes');

  // Variety analysis: MR297 vs MR330
  const mr297Seasons = seasons.filter(s => s.seedType === 'MR297');
  const mr330Seasons = seasons.filter(s => s.seedType === 'MR330');

  const avgMr297Yield = mr297Seasons.reduce((acc, s) => acc + s.production.yieldPerRelong, 0) / mr297Seasons.length;
  const avgMr330Yield = mr330Seasons.reduce((acc, s) => acc + s.production.yieldPerRelong, 0) / mr330Seasons.length;

  const avgMr297Price = mr297Seasons.reduce((acc, s) => acc + s.paddyPrice100kg, 0) / mr297Seasons.length;
  const avgMr330Price = mr330Seasons.reduce((acc, s) => acc + s.paddyPrice100kg, 0) / mr330Seasons.length;

  const avgMr297Net = mr297Seasons.reduce((acc, s) => acc + s.financials.netAfterZakat, 0) / mr297Seasons.length;
  const avgMr330Net = mr330Seasons.reduce((acc, s) => acc + s.financials.netAfterZakat, 0) / mr330Seasons.length;

  // Chart data for yield & price
  const yieldChartData = seasons.map(s => ({
    name: s.name,
    tonnes: s.production.tonnes,
    gundi: s.production.gundi,
    yieldPerRelong: s.production.yieldPerRelong,
    paddyPrice: s.paddyPrice100kg,
    seedPrice: s.seedPrice,
    seedType: s.seedType
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Jumlah Tuaian</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Wheat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {formatNumber(totals.totalTonnes, 2)} Tan
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Setara dengan ~{formatNumber(totals.totalGundi, 0)} Gundi (Beg)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Purata Produktiviti</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatNumber(totals.averageYieldPerRelong, 3)} Tan/Relong
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Keluasan sawah tetap: 11.5 Relong
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Puncak Produktiviti</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-blue-600 dark:text-blue-400">
            1.402 Tan/Relong
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Dicapai pada Musim Feb 2021 (16.13 Tan)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Harga Padi Tertinggi</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600 dark:text-purple-400">
            RM 180 / 100kg
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Musim Okt 2024 (Naik dari RM125 pada 2020)
          </div>
        </div>
      </div>

      {/* Yield Progression Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-500" />
              Perbandingan Hasil Tuaian Setiap Musim
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pilih metrik untuk melihat volum berat tan, bilangan gundi atau kadar produktiviti per relong
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMetricView('tonnes')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                metricView === 'tonnes'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Berat (Tan)
            </button>
            <button
              onClick={() => setMetricView('yieldPerRelong')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                metricView === 'yieldPerRelong'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tan / Relong
            </button>
            <button
              onClick={() => setMetricView('gundi')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                metricView === 'gundi'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Bil. Gundi
            </button>
          </div>
        </div>

        <div className="mt-6 h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yieldChartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                angle={-25} 
                textAnchor="end"
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickFormatter={(val) => {
                  if (metricView === 'tonnes') return `${val} T`;
                  if (metricView === 'yieldPerRelong') return `${val} T/R`;
                  return `${val} Beg`;
                }}
              />
              <Tooltip
                formatter={(val: unknown) => {
                  if (metricView === 'tonnes') return [`${formatNumber(Number(val), 3)} Tan`, 'Hasil Berat'];
                  if (metricView === 'yieldPerRelong') return [`${formatNumber(Number(val), 3)} Tan/Relong`, 'Produktiviti'];
                  return [`${formatNumber(Number(val), 1)} Gundi`, 'Bil. Gundi'];
                }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Bar 
                dataKey={metricView} 
                radius={[6, 6, 0, 0]}
              >
                {yieldChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.seedType === 'MR330' ? '#10b981' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
            <span>Benih MR297 (2020 – Awal 2023)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
            <span>Benih MR330 Baru (Sept 2023 – 2026)</span>
          </div>
        </div>
      </div>

      {/* Comparison: Benih MR297 vs MR330 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Wheat className="w-5 h-5 text-emerald-600" />
          Kajian Perbandingan Varieti Benih: MR297 vs MR330
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Analisis impak penukaran varieti benih ke MR330 bermula musim September 2023 terhadap hasil dan keuntungan
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MR297 Card */}
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Varieti Tradisi</span>
                <h4 className="text-xl font-extrabold text-amber-950 dark:text-amber-100">Benih Padi MR297</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                4 Musim (2020 - Awal 2023)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-200/50">
                <span className="text-slate-500 block">Purata Produktiviti</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(avgMr297Yield, 3)} Tan/Relong</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-200/50">
                <span className="text-slate-500 block">Purata Harga Padi</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">RM {formatNumber(avgMr297Price, 0)} / 100kg</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-200/50">
                <span className="text-slate-500 block">Harga Kos Benih</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">RM 37.00 / Gundi</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-200/50">
                <span className="text-slate-500 block">Purata Bersih Semusim</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatRM(avgMr297Net)}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Kelebihan: Kos benih rendah (RM37). Kelemahan: Harga pasaran lama padi rendah sekitar RM125 - RM128.
            </div>
          </div>

          {/* MR330 Card */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Varieti Baharu</span>
                <h4 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100">Benih Padi MR330</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                7 Musim (Sept 2023 - 2026)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-emerald-200/50">
                <span className="text-slate-500 block">Purata Produktiviti</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(avgMr330Yield, 3)} Tan/Relong</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-emerald-200/50">
                <span className="text-slate-500 block">Purata Harga Padi</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">RM {formatNumber(avgMr330Price, 0)} / 100kg</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-emerald-200/50">
                <span className="text-slate-500 block">Harga Kos Benih</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">RM 60 - RM 65 / Gundi</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-emerald-200/50">
                <span className="text-slate-500 block">Purata Bersih Semusim</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatRM(avgMr330Net)}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Peningkatan ketara harga jualan padi (purata RM 164.3/100kg) menyerap kos benih yang lebih tinggi dan memberikan purata pendapatan bersih yang lebih tinggi ({formatRM(avgMr330Net)}).
            </div>
          </div>
        </div>
      </div>

      {/* Price Dynamics (Paddy Market Price vs Seed Price) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-purple-600" />
          Dinamik Harga Jualan Padi (RM/100kg) vs Kos Benih (RM/gundi)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Graf menunjukkan lonjakan harga padi lantai/pasaran bermula akhir 2023 dan kestabilan pada RM150/100kg pada 2025-2026
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yieldChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-25} textAnchor="end" />
              <YAxis yAxisId="paddy" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 200]} tickFormatter={(v) => `RM ${v}`} />
              <Tooltip
                formatter={(val: unknown, name: unknown) => {
                  const nameKey = String(name ?? '');
                  if (nameKey === 'paddyPrice') return [`RM ${String(val ?? '')} / 100kg`, 'Harga Padi'];
                  return [`RM ${String(val ?? '')} / gundi`, 'Harga Benih'];
                }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
              <Bar yAxisId="paddy" dataKey="paddyPrice" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="paddyPrice" />
              <Line yAxisId="paddy" type="monotone" dataKey="seedPrice" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: '#ec4899' }} name="seedPrice" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

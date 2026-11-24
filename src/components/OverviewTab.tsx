'use client';

import React, { useState } from 'react';
import { SeasonData, AllTimeTotals } from '@/types/padi';
import { KpiCard } from './KpiCard';
import { formatRM, formatNumber } from '@/lib/formatters';
import { 
  DollarSign, 
  Coins, 
  TrendingUp, 
  Award, 
  BarChart3, 
  Calendar, 
  Wheat, 
  Layers, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface OverviewTabProps {
  totals: AllTimeTotals;
  seasons: SeasonData[];
  profile?: unknown;
  onSelectSeason: (seasonId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ totals, seasons, onSelectSeason }) => {
  const [chartView, setChartView] = useState<'financials' | 'yield'>('financials');

  // Prepare chart data
  const chartData = seasons.map(s => ({
    name: s.name,
    year: s.year,
    pendapatanKasar: s.financials.grossRevenue,
    jualanPadi: s.financials.paddySales,
    subsidi: s.financials.subsidy,
    kos: s.financials.cost,
    untungBersih: s.financials.netAfterZakat,
    hasilTan: s.production.tonnes,
    tanPerRelong: s.production.yieldPerRelong,
    gundi: s.production.gundi,
    benih: s.seedType,
    harga100kg: s.paddyPrice100kg
  }));

  // Best season
  const bestProfitSeason = [...seasons].sort((a, b) => b.financials.netAfterZakat - a.financials.netAfterZakat)[0];
  const bestYieldSeason = [...seasons].sort((a, b) => b.production.tonnes - a.production.tonnes)[0];

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          title="Jumlah Pendapatan Kasar"
          value={formatRM(totals.totalGrossRevenue)}
          subValue={`${seasons.length} Musim (${totals.totalTonnes} Tan)`}
          description={`Jualan Padi: ${formatRM(totals.totalPaddySales)} • Subsidi: ${formatRM(totals.totalSubsidy)}`}
          icon={<DollarSign className="w-6 h-6" />}
          badge="Pendapatan Kasar"
          colorTheme="emerald"
        />

        <KpiCard
          title="Pendapatan Bersih (Tolak Kos & Zakat)"
          value={formatRM(totals.totalNetAfterZakat)}
          subValue={`Purata ${formatRM(totals.averageNetPerSeason)} / musim`}
          description={`Kos Keseluruhan: ${formatRM(totals.totalCost)} (Purata ${formatRM(totals.averageCostPerSeason)})`}
          icon={<Coins className="w-6 h-6" />}
          badge="Untung Bersih"
          colorTheme="blue"
        />

        <KpiCard
          title="Jumlah Hasil Padi Terkumpul"
          value={`${formatNumber(totals.totalTonnes, 2)} Tan`}
          subValue={`~${formatNumber(totals.totalGundi, 0)} Gundi (Beg)`}
          description={`Purata Produktiviti: ${formatNumber(totals.averageYieldPerRelong, 3)} Tan / Relong`}
          icon={<Wheat className="w-6 h-6" />}
          badge="11.5 Relong"
          colorTheme="amber"
        />

        <KpiCard
          title="Jumlah Zakat 10% Dibayar"
          value={formatRM(totals.totalZakat)}
          subValue="10% atas untung bersih"
          description="Kewajipan zakat tanaman padi dilunaskan setiap musim"
          icon={<ShieldCheck className="w-6 h-6" />}
          badge="Patuh Syariah"
          colorTheme="purple"
        />

        <KpiCard
          title="Musim Paling Menguntungkan"
          value={bestProfitSeason.name}
          subValue={formatRM(bestProfitSeason.financials.netAfterZakat)}
          description={`Hasil: ${bestProfitSeason.production.tonnes} Tan • Harga: RM${bestProfitSeason.paddyPrice100kg}/100kg`}
          icon={<Award className="w-6 h-6" />}
          badge="Rekod Tertinggi"
          colorTheme="emerald"
        />

        <KpiCard
          title="Musim Tuaian Tertinggi"
          value={bestYieldSeason.name}
          subValue={`${bestYieldSeason.production.tonnes} Tan`}
          description={`Produktiviti: ${bestYieldSeason.production.yieldPerRelong} Tan/Relong (~${bestYieldSeason.production.gundi} Gundi)`}
          icon={<TrendingUp className="w-6 h-6" />}
          badge="Hasil Puncak"
          colorTheme="amber"
        />
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {chartView === 'financials' 
                ? 'Analisis Kewangan Mengikut Musim (2020 – 2026)' 
                : 'Analisis Hasil Tuaian & Produktiviti (2020 – 2026)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {chartView === 'financials'
                ? 'Perbandingan Pendapatan Kasar, Subsidi Kerajaan, Jumlah Kos dan Untung Bersih'
                : 'Perbandingan Berat Padi (Tan) dan Kadar Hasil per Relong (Tan/Relong)'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setChartView('financials')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                chartView === 'financials'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Prestasi Kewangan (RM)
            </button>
            <button
              onClick={() => setChartView('yield')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                chartView === 'yield'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Hasil Tuaian (Tan)
            </button>
          </div>
        </div>

        {/* Chart View Area */}
        <div className="mt-6 h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'financials' ? (
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
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
                  tickFormatter={(val) => `RM ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const formatted = formatRM(Number(value));
                    const labels: Record<string, string> = {
                      pendapatanKasar: 'Jumlah Pendapatan Kasar',
                      jualanPadi: 'Jualan Padi Sahaja',
                      subsidi: 'Subsidi Kerajaan',
                      kos: 'Upah & Kos Operasi',
                      untungBersih: 'Untung Bersih Selepas Zakat'
                    };
                    const nameKey = String(name ?? '');
                    return [formatted, labels[nameKey] || nameKey];
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }} 
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      jualanPadi: 'Jualan Padi (RM)',
                      subsidi: 'Subsidi Kerajaan (RM)',
                      kos: 'Upah & Kos (RM)',
                      untungBersih: 'Untung Bersih (RM)'
                    };
                    return labels[value] || value;
                  }}
                />
                <Bar dataKey="jualanPadi" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="jualanPadi" />
                <Bar dataKey="subsidi" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="subsidi" />
                <Bar dataKey="kos" fill="#ef4444" radius={[4, 4, 0, 0]} name="kos" />
                <Line 
                  type="monotone" 
                  dataKey="untungBersih" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2 }} 
                  name="untungBersih"
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  angle={-25} 
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickFormatter={(val) => `${val} Tan`} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 2]}
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickFormatter={(val) => `${val} T/R`} 
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const nameKey = String(name ?? '');
                    if (nameKey === 'hasilTan') return [`${formatNumber(Number(value), 3)} Tan`, 'Hasil Berat (Tan)'];
                    if (nameKey === 'tanPerRelong') return [`${formatNumber(Number(value), 3)} Tan/Relong`, 'Produktiviti (Tan/Relong)'];
                    return [String(value ?? ''), nameKey];
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }} 
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      hasilTan: 'Hasil Padi (Tan)',
                      tanPerRelong: 'Produktiviti (Tan/Relong)'
                    };
                    return labels[value] || value;
                  }}
                />
                <Bar yAxisId="left" dataKey="hasilTan" fill="#f59e0b" radius={[4, 4, 0, 0]} name="hasilTan" />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="tanPerRelong" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#10b981' }} 
                  name="tanPerRelong"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Insights & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Peralihan Benih Padi (MR297 → MR330)</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Mulai musim <strong>September 2023</strong>, penggunaan benih bertukar dari jenis <strong>MR297</strong> ke <strong>MR330</strong> baru. Harga benih meningkat daripada RM37 ke RM60-RM65 seguni, namun harga belian padi juga melonjak dari RM125-RM128 kepada RM170-RM180/100kg.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/40">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm mb-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <span>Pengaruh Subsidi Kerajaan (SSHP)</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Subsidi menyumbang <strong>RM 66,637.19 (22.9%)</strong> daripada jumlah keseluruhan pendapatan. Kadar subsidi dinaikkan daripada RM360/tan ke <strong>RM500/tan</strong> pada September 2023, memberi rangsangan ketara kepada pendapatan bersih.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800/40">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Modernisasi Jentera & Dron</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Pada tahun 2025 dan 2026, operasi penanaman mengadaptasi teknologi <strong>Tabur Dron</strong> dan <strong>Sembur Vitamin Dron</strong> (RM20-RM40/relong), mengurangkan kebergantungan tenaga buruh kasar manual dan mempercepatkan proses semburan.
          </p>
        </div>
      </div>

      {/* Quick Season Navigation Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between mb-4">
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Ringkasan Pantas {seasons.length} Musim
          </span>
          <span className="text-xs font-normal text-slate-500">
            Klik mana-mana musim untuk lihat butiran resit & kos
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {seasons.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSeason(s.id)}
              className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {s.name}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatRM(s.financials.netAfterZakat)}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{s.production.tonnes} Tan</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{s.seedType}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

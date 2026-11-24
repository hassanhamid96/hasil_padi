'use client';

import React, { useState } from 'react';
import { SeasonData } from '@/types/padi';
import { formatRM, formatNumber, formatPct } from '@/lib/formatters';
import { 
  Receipt as ReceiptIcon, 
  Truck, 
  Scale, 
  Percent, 
  Calendar, 
  FileText 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ReceiptsTabProps {
  seasons: SeasonData[];
  selectedSeasonId?: string;
}

export const ReceiptsTab: React.FC<ReceiptsTabProps> = ({ seasons, selectedSeasonId }) => {
  const [activeSeasonId, setActiveSeasonId] = useState<string>(
    selectedSeasonId || (seasons[seasons.length - 1]?.id ?? '')
  );

  const activeSeason = seasons.find(s => s.id === activeSeasonId) || seasons[0];
  const receipts = activeSeason?.receipts || [];

  // Deductions chart data for active receipts
  const deductionsChartData = receipts.map(r => ({
    name: r.resitNo,
    basah: r.potongan.basahPct,
    hampa: r.potongan.hampaPct,
    hijau: r.potongan.hijauPct,
    rosak: r.potongan.rosakPct,
    kotor: r.potongan.kotorPct,
    wbTotal: r.potongan.wbPct
  }));

  // Season totals from receipts
  const totalBeratMasuk = receipts.reduce((acc, r) => acc + (r.beratMasukKg || 0), 0);
  const totalBeratKeluar = receipts.reduce((acc, r) => acc + (r.beratKeluarKg || 0), 0);
  const totalBeratTimbang = receipts.reduce((acc, r) => acc + (r.beratTimbanganKg || 0), 0);
  const totalBeratBersih = receipts.reduce((acc, r) => acc + (r.beratBersihKg || 0), 0);
  const totalBayaran = receipts.reduce((acc, r) => acc + (r.jumlahBayaranRM || 0), 0);
  const totalSubsidi = receipts.reduce((acc, r) => acc + (r.subsidiRM || 0), 0);

  return (
    <div className="space-y-8">
      {/* Season Selection Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Musim Laporan:</span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            {activeSeason.name} ({activeSeason.seedType})
          </h3>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {seasons.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSeasonId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeSeasonId === s.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI for this season's receipts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bilangan Resit Lori</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {receipts.length} Resit Timbang
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Penghantaran lori ke kilang / pusat belian
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Berat Bersih Dibayar</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatNumber(activeSeason.production.tonnes * 1000, 0)} KG
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatNumber(activeSeason.production.tonnes, 3)} Tan (~{formatNumber(activeSeason.production.gundi, 1)} Gundi)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Harga Belian Padi</span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <ReceiptIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600 dark:text-purple-400">
            RM {activeSeason.paddyPrice100kg} / 100kg
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Bayaran Jualan Padi: {formatRM(activeSeason.financials.paddySales)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Subsidi Diterima</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatRM(activeSeason.financials.subsidy)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Jumlah Kasar: {formatRM(activeSeason.financials.grossRevenue)}
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-emerald-600" />
          Pecahan Terperinci Resit Timbangan Lori ({activeSeason.name})
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Resit</th>
                <th className="py-3 px-3 text-right">Berat Masuk (KG)</th>
                <th className="py-3 px-3 text-right">Berat Keluar (KG)</th>
                <th className="py-3 px-3 text-right">Berat Timbang (KG)</th>
                <th className="py-3 px-3 text-center">Kadar Potongan (WB%)</th>
                <th className="py-3 px-3 text-right">Berat Bersih (KG)</th>
                <th className="py-3 px-3 text-center">Bil. Guni</th>
                <th className="py-3 px-3 text-right">Bayaran Padi (RM)</th>
                <th className="py-3 px-3 text-right">Subsidi (RM)</th>
                <th className="py-3 px-4 text-right">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {receipts.length > 0 ? (
                receipts.map((r, idx) => {
                  const receiptGross = (r.jumlahBayaranRM || 0) + (r.subsidiRM || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{r.resitNo}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{r.beratMasukKg ? formatNumber(r.beratMasukKg, 0) : '-'}</td>
                      <td className="py-3 px-3 text-right font-mono">{r.beratKeluarKg ? formatNumber(r.beratKeluarKg, 0) : '-'}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {r.beratTimbanganKg ? formatNumber(r.beratTimbanganKg, 0) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {formatPct(r.potongan.wbPct)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {r.beratBersihKg ? formatNumber(r.beratBersihKg, 0) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{r.bilGuni ? formatNumber(r.bilGuni, 1) : '-'}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium">{r.jumlahBayaranRM ? formatRM(r.jumlahBayaranRM) : '-'}</td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-blue-600 dark:text-blue-400">
                        {r.subsidiRM ? formatRM(r.subsidiRM) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {receiptGross > 0 ? formatRM(receiptGross) : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <p className="font-semibold">Resit fizikal tidak tersedia atau timbangan terus dicatatkan dalam ringkasan musim.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Sila rujuk ringkasan musim di atas.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {receipts.length > 0 && (
              <tfoot className="bg-slate-100 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td className="py-3 px-3 text-slate-900 dark:text-white uppercase">Jumlah Resit:</td>
                  <td className="py-3 px-3 text-right font-mono">{formatNumber(totalBeratMasuk, 0)}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatNumber(totalBeratKeluar, 0)}</td>
                  <td className="py-3 px-3 text-right font-mono">{formatNumber(totalBeratTimbang, 0)}</td>
                  <td></td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(totalBeratBersih, 0)}</td>
                  <td></td>
                  <td className="py-3 px-3 text-right font-mono">{formatRM(totalBayaran)}</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">{formatRM(totalSubsidi)}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm font-black text-slate-900 dark:text-white">
                    {formatRM(totalBayaran + totalSubsidi)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Deduction (Potongan Mutu) Breakdown Chart */}
      {deductionsChartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 text-amber-600" />
            Pecahan Peratusan Potongan Mutu Padi (Deduction Rates)
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Kadar potongan standard kilang merangkumi kadar Basah (Kelembapan), Hampa, Biji Hijau, Padi Rosak dan Bendasing/Kotor
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deductionsChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [`${formatNumber(Number(val), 1)}%`, String(name ?? '')]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="basah" stackId="a" fill="#3b82f6" name="Basah" />
                <Bar dataKey="hampa" stackId="a" fill="#f59e0b" name="Hampa" />
                <Bar dataKey="hijau" stackId="a" fill="#10b981" name="Hijau" />
                <Bar dataKey="rosak" stackId="a" fill="#ef4444" name="Rosak" />
                <Bar dataKey="kotor" stackId="a" fill="#8b5cf6" name="Kotor/Bendasing" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

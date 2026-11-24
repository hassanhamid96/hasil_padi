'use client';

import React, { useState } from 'react';
import { formatRM, formatNumber, formatPct } from '@/lib/formatters';
import { 
  Calculator, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';

export const SimulatorTab: React.FC = () => {
  // Input states
  const [relong, setRelong] = useState<number>(11.5);
  const [yieldPerRelong, setYieldPerRelong] = useState<number>(1.25);
  const [paddyPrice, setPaddyPrice] = useState<number>(150);
  const [subsidyPerTonne, setSubsidyPerTonne] = useState<number>(500);
  const [operatingCost, setOperatingCost] = useState<number>(13500);
  const [zakatRate, setZakatRate] = useState<number>(10);

  // Calculated values
  const totalTonnes = relong * yieldPerRelong;
  const totalKg = totalTonnes * 1000;
  const estimatedGundi = totalTonnes * 13.888; // ~72kg per gundi
  const paddySalesRevenue = (totalKg / 100) * paddyPrice;
  const subsidyRevenue = totalTonnes * subsidyPerTonne;
  const grossRevenue = paddySalesRevenue + subsidyRevenue;
  const netBeforeZakat = Math.max(0, grossRevenue - operatingCost);
  const zakatAmount = (netBeforeZakat * zakatRate) / 100;
  const netAfterZakat = netBeforeZakat - zakatAmount;
  const profitMargin = grossRevenue > 0 ? (netAfterZakat / grossRevenue) * 100 : 0;
  const roi = operatingCost > 0 ? (netAfterZakat / operatingCost) * 100 : 0;
  const monthlyIncome = netAfterZakat / 6; // 6 months per agricultural cycle

  const handleReset = () => {
    setRelong(11.5);
    setYieldPerRelong(1.25);
    setPaddyPrice(150);
    setSubsidyPerTonne(500);
    setOperatingCost(13500);
    setZakatRate(10);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Kalkulator Simulasi Keuntungan Musim Depan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ubahsuai parameter saiz bendang, jangkaan hasil tuaian, harga belian dan kos operasi untuk melihat anggaran pulangan
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tetapkan Semula (Default)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Sliders & Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Tetapan Pembolehubah Musim
          </h4>

          {/* 1. Luas Sawah */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Luas Sawah (Relong)</span>
              <span className="font-mono text-emerald-600 font-bold">{relong} Relong</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={relong}
              onChange={(e) => setRelong(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 Relong</span>
              <span>11.5 Relong (Sg Baru)</span>
              <span>30 Relong</span>
            </div>
          </div>

          {/* 2. Jangkaan Hasil (Tan/Relong) */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Jangkaan Hasil Tuaian (Tan / Relong)</span>
              <span className="font-mono text-amber-600 font-bold">{yieldPerRelong} Tan / Relong</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.0"
              step="0.05"
              value={yieldPerRelong}
              onChange={(e) => setYieldPerRelong(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0.6 T/R (Rendah)</span>
              <span>1.2 T/R (Purata Sejarah)</span>
              <span>2.0 T/R (Tinggi)</span>
            </div>
          </div>

          {/* 3. Harga Belian Padi / 100kg */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Harga Jualan Padi (RM / 100kg)</span>
              <span className="font-mono text-blue-600 font-bold">RM {paddyPrice} / 100kg</span>
            </div>
            <input
              type="range"
              min="120"
              max="200"
              step="5"
              value={paddyPrice}
              onChange={(e) => setPaddyPrice(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>RM 120</span>
              <span>RM 150 (Harga Semasa)</span>
              <span>RM 200</span>
            </div>
          </div>

          {/* 4. Kadar Subsidi Kerajaan */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Kadar Subsidi Kerajaan (RM / Tan)</span>
              <span className="font-mono text-purple-600 font-bold">RM {subsidyPerTonne} / Tan</span>
            </div>
            <input
              type="range"
              min="300"
              max="700"
              step="20"
              value={subsidyPerTonne}
              onChange={(e) => setSubsidyPerTonne(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>RM 360 (Kadar Lama)</span>
              <span>RM 500 (Kadar Baru)</span>
              <span>RM 700</span>
            </div>
          </div>

          {/* 5. Anggaran Kos Operasi */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Anggaran Kos Operasi (Upah, Racun, Mesin, Benih)</span>
              <span className="font-mono text-rose-600 font-bold">{formatRM(operatingCost)}</span>
            </div>
            <input
              type="range"
              min="8000"
              max="20000"
              step="250"
              value={operatingCost}
              onChange={(e) => setOperatingCost(parseInt(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>RM 8,000</span>
              <span>RM 13,500 (Purata 2025/26)</span>
              <span>RM 20,000</span>
            </div>
          </div>

          {/* 6. Kadar Zakat */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Kadar Zakat Pertanian (%)</span>
              <span className="font-mono text-purple-600 font-bold">{zakatRate}%</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setZakatRate(10)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  zakatRate === 10
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                10% (Air Semula Jadi / Tadahan)
              </button>
              <button
                type="button"
                onClick={() => setZakatRate(5)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  zakatRate === 5
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                5% (Sistem Pengairan Berbayar)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Simulation Output Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Net Profit Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-emerald-200 backdrop-blur-sm border border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anggaran Pulangan Bersih Semusim
              </span>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                  {formatRM(netAfterZakat)}
                </span>
                <span className="text-emerald-200 text-xs sm:text-sm font-semibold">
                  (Bersih Tolak Kos & Zakat)
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-emerald-200/80 block">Pendapatan Bulanan (6 Bln)</span>
                  <span className="text-lg font-bold text-white font-mono">{formatRM(monthlyIncome)}</span>
                </div>
                <div>
                  <span className="text-emerald-200/80 block">Margin Keuntungan</span>
                  <span className="text-lg font-bold text-amber-300 font-mono">{formatPct(profitMargin)}</span>
                </div>
                <div>
                  <span className="text-emerald-200/80 block">Pulangan Pelaburan (ROI)</span>
                  <span className="text-lg font-bold text-emerald-300 font-mono">{formatPct(roi)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Anggaran Hasil Tuaian</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatNumber(totalTonnes, 3)} Tan
              </div>
              <div className="mt-1 text-xs text-slate-500">
                ~{formatNumber(estimatedGundi, 0)} Gundi (Beg @ 72kg)
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Jualan Padi Pasaran</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatRM(paddySalesRevenue)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Kadar: RM {paddyPrice} per 100kg
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Subsidi Kerajaan (SSHP)</span>
              <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {formatRM(subsidyRevenue)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Kadar: RM {subsidyPerTonne} per Tan padi
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Jumlah Pendapatan Kasar</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatRM(grossRevenue)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Jualan Padi + Subsidi Kerajaan
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Kos Operasi Tolak</span>
              <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                - {formatRM(operatingCost)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Perbelanjaan benih, baja, jentera & upah
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Potongan Zakat ({zakatRate}%)</span>
              <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                - {formatRM(zakatAmount)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {zakatRate}% atas untung sebelum zakat ({formatRM(netBeforeZakat)})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

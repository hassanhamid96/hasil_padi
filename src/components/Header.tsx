'use client';

import React from 'react';
import { FarmProfile, AllTimeTotals, SeasonData } from '@/types/padi';
import { formatRM, formatNumber } from '@/lib/formatters';
import { 
  Sprout, 
  MapPin, 
  User, 
  Upload, 
  Download, 
  Printer, 
  Layers 
} from 'lucide-react';

interface HeaderProps {
  profile: FarmProfile;
  totals: AllTimeTotals;
  seasons: SeasonData[];
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, totals, seasons, onOpenUpload }) => {
  const exportToCSV = () => {
    const headers = [
      'Musim',
      'Tahun',
      'Jenis Benih',
      'Harga Benih (RM)',
      'Harga Padi / 100kg (RM)',
      'Hasil (Tan)',
      'Bil. Gundi',
      'Tan / Relong',
      'Jualan Padi (RM)',
      'Subsidi (RM)',
      'Pendapatan Kasar (RM)',
      'Jumlah Kos (RM)',
      'Untung Sebelum Zakat (RM)',
      'Zakat 10% (RM)',
      'Untung Bersih (RM)',
      'Margin Untung (%)'
    ];

    const rows = seasons.map(s => [
      `"${s.name}"`,
      s.year,
      `"${s.seedType}"`,
      s.seedPrice,
      s.paddyPrice100kg,
      s.production.tonnes,
      s.production.gundi,
      s.production.yieldPerRelong,
      s.financials.paddySales,
      s.financials.subsidy,
      s.financials.grossRevenue,
      s.financials.cost,
      s.financials.netBeforeZakat,
      s.financials.zakat,
      s.financials.netAfterZakat,
      s.financials.profitMarginPct
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Hasil_Padi_${profile.farmerName.replace(/\s+/g, '_')}_2020-2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl border-b border-emerald-700/50 print:bg-none print:text-black print:border-b print:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Title and Metadata */}
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-700/60 rounded-xl border border-emerald-500/40 shadow-inner flex items-center justify-center">
                <Sprout className="w-8 h-8 text-emerald-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    Laporan Hasil & Kos Penanaman Padi
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    2020 – 2026
                  </span>
                </div>
                <p className="text-emerald-200/90 text-sm mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-emerald-400" />
                    <strong>{profile.farmerName}</strong>
                  </span>
                  <span className="text-emerald-400/50">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{profile.location}</span>
                  </span>
                  <span className="text-emerald-400/50">•</span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{profile.areaRelong} Relong (~{profile.areaHectares} Hektar)</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap print:hidden">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/60 hover:border-emerald-400 transition-all shadow-sm"
              title="Muat naik fail Excel untuk mengemaskini data"
            >
              <Upload className="w-4 h-4 text-emerald-300" />
              <span>Muat Naik Excel</span>
            </button>

            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/60 hover:border-emerald-400 transition-all shadow-sm"
              title="Muat turun data dalam format CSV"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Eksport CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
              title="Cetak atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Top Summary Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-700/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-700/30">
            <span className="text-emerald-300/80 block">Jumlah Kasar (11 Musim)</span>
            <span className="text-base sm:text-lg font-bold text-white">{formatRM(totals.totalGrossRevenue)}</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Padi + Subsidi Kerajaan</span>
          </div>
          <div className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-700/30">
            <span className="text-emerald-300/80 block">Bersih Bersih Selepas Zakat</span>
            <span className="text-base sm:text-lg font-bold text-emerald-300">{formatRM(totals.totalNetAfterZakat)}</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Purata {formatRM(totals.averageNetPerSeason)} / musim</span>
          </div>
          <div className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-700/30">
            <span className="text-emerald-300/80 block">Jumlah Tuaian Terkumpul</span>
            <span className="text-base sm:text-lg font-bold text-amber-300">{formatNumber(totals.totalTonnes, 2)} Tan</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">~{formatNumber(totals.totalGundi, 0)} Gundi (Beg)</span>
          </div>
          <div className="bg-emerald-950/40 rounded-lg p-3 border border-emerald-700/30">
            <span className="text-emerald-300/80 block">Purata Produktiviti</span>
            <span className="text-base sm:text-lg font-bold text-white">{formatNumber(totals.averageYieldPerRelong, 3)} Tan/Relong</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Kadar stabil atas purata MADA</span>
          </div>
        </div>
      </div>
    </header>
  );
};

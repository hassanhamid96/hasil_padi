'use client';

import React, { useState } from 'react';
import initialData from '@/data/padiData.json';
import { PadiDataset } from '@/types/padi';
import { Header } from '@/components/Header';
import { OverviewTab } from '@/components/OverviewTab';
import { HarvestTab } from '@/components/HarvestTab';
import { FinancialsTab } from '@/components/FinancialsTab';
import { ReceiptsTab } from '@/components/ReceiptsTab';
import { ComparisonTab } from '@/components/ComparisonTab';
import { SimulatorTab } from '@/components/SimulatorTab';
import { UploadExcelModal } from '@/components/UploadExcelModal';
import { 
  BarChart3, 
  Wheat, 
  Coins, 
  Receipt, 
  Table, 
  Calculator, 
  Sprout 
} from 'lucide-react';

type TabId = 'overview' | 'harvest' | 'financials' | 'receipts' | 'comparison' | 'simulator';

export default function DashboardPage() {
  const [data, setData] = useState<PadiDataset>(initialData as unknown as PadiDataset);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(data.seasons[data.seasons.length - 1]?.id || '');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const handleSelectSeasonFromOverview = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    setActiveTab('receipts');
  };

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Ringkasan Eksekutif', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'harvest', label: 'Hasil & Tuaian', icon: <Wheat className="w-4 h-4" /> },
    { id: 'financials', label: 'Kewangan & Kos', icon: <Coins className="w-4 h-4" /> },
    { id: 'receipts', label: 'Resit Timbangan', icon: <Receipt className="w-4 h-4" /> },
    { id: 'comparison', label: 'Matriks 11 Musim', icon: <Table className="w-4 h-4" /> },
    { id: 'simulator', label: 'Kalkulator Simulasi', icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <Header
        profile={data.farmProfile}
        totals={data.allTimeTotals}
        seasons={data.seasons}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Navigation Tab Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
            {navItems.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            totals={data.allTimeTotals}
            seasons={data.seasons}
            profile={data.farmProfile}
            onSelectSeason={handleSelectSeasonFromOverview}
          />
        )}

        {activeTab === 'harvest' && (
          <HarvestTab
            seasons={data.seasons}
            totals={data.allTimeTotals}
          />
        )}

        {activeTab === 'financials' && (
          <FinancialsTab
            seasons={data.seasons}
            detailedCosts={data.detailedCosts}
            totals={data.allTimeTotals}
          />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsTab
            seasons={data.seasons}
            selectedSeasonId={selectedSeasonId}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonTab
            seasons={data.seasons}
            totals={data.allTimeTotals}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorTab />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Laporan Hasil Padi • {data.farmProfile.location}
            </span>
            <span>(11.5 Relong / ~{data.farmProfile.areaHectares} Ha)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Petani: <strong>{data.farmProfile.farmerName}</strong></span>
            <span>•</span>
            <span>Tempoh Rekod: 2020 – 2026 (11 Musim)</span>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadExcelModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={(newData) => {
          setData(newData);
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}

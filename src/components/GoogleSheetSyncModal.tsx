'use client';

import React, { useState } from 'react';
import { PadiDataset } from '@/types/padi';
import { 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Lock
} from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: (newDataset: PadiDataset) => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string; timestamp?: string } | null>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setResult(null);

    try {
      const res = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat semula data.');
      }

      onSyncSuccess(data.dataset);

      setResult({
        type: 'success',
        message: 'Data lejar terkini berjaya dimuat semula daripada pangkalan awan terlindung!',
        timestamp: data.timestamp || new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ralat yang tidak diketahui.';
      setResult({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Muat Semula Data Awan
            </h3>
            <p className="text-xs text-slate-500">
              Penyambungan Terlindung & Disulitkan
            </p>
          </div>
        </div>

        {/* Security Status Box */}
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Akses Terhad & Selamat
              </h4>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                Pautan sumber dan identiti lejar Google Sheet disimpan secara rahsia di sebelah pelayan untuk mengelakkan sebarang capaian atau pencerobohan tanpa kebenaran.
              </p>
            </div>
          </div>

          <div className="text-center py-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/25"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Memuat semula data...' : 'Muat Semula'}</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Klik butang di atas untuk menyelaraskan data terkini
            </p>
          </div>

          {/* Result Alert */}
          {result && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                result.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{result.message}</p>
                {result.timestamp && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Masa kemas kini: {result.timestamp}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

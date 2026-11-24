import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    text: string;
  };
  badge?: string;
  colorTheme?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subValue,
  description,
  icon,
  trend,
  badge,
  colorTheme = 'emerald',
}) => {
  const themeClasses = {
    emerald: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      iconBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
      valColor: 'text-emerald-900 dark:text-emerald-100',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800/40',
      iconBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
      valColor: 'text-amber-900 dark:text-amber-100',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    blue: {
      bg: 'bg-blue-50/70 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800/40',
      iconBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
      valColor: 'text-blue-900 dark:text-blue-100',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    },
    purple: {
      bg: 'bg-purple-50/70 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-800/40',
      iconBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
      valColor: 'text-purple-900 dark:text-purple-100',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    },
    rose: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-800/40',
      iconBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
      valColor: 'text-rose-900 dark:text-rose-100',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    },
    slate: {
      bg: 'bg-slate-50/70 dark:bg-slate-900/20',
      border: 'border-slate-200 dark:border-slate-800/40',
      iconBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-400',
      valColor: 'text-slate-900 dark:text-slate-100',
      badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    },
  }[colorTheme];

  return (
    <div className={`rounded-xl p-5 border ${themeClasses.border} ${themeClasses.bg} backdrop-blur-sm transition-all duration-200 hover:shadow-md relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400">
              {title}
            </span>
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${themeClasses.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${themeClasses.valColor}`}>
              {value}
            </span>
            {subValue && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {subValue}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${themeClasses.iconBg} shrink-0`}>
          {icon}
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          {description && <span>{description}</span>}
          {trend && (
            <span className={`font-semibold ml-auto flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              <span className="text-[11px] font-normal text-slate-500">{trend.text}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export function formatRM(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'RM 0.00';
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('MYR', 'RM');
}

export function formatNumber(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('ms-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatTonnes(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0 Tan';
  return `${formatNumber(val, 2)} Tan`;
}

export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${formatNumber(val, 1)}%`;
}

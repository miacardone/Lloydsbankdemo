/**
 * Display formatting.
 *
 * Currency and locale are module-level and settable rather than hard-coded,
 * because a white-label portal serves tenants in different markets. BrandProvider
 * calls `setMoneyLocale` on mount from the active brand's `content` block.
 */
let LOCALE = 'en-US';
let CURRENCY = 'USD';

let currency;
let compactCurrency;
let number;

function buildFormatters() {
  currency = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  });
  compactCurrency = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  number = new Intl.NumberFormat(LOCALE);
}
buildFormatters();

export function setMoneyLocale({ locale, currency: code } = {}) {
  if (locale) LOCALE = locale;
  if (code) CURRENCY = code;
  buildFormatters();
  perCurrency.clear();
}

export const formatCurrency = (value) => currency.format(Number(value) || 0);

/**
 * Format in a specific currency rather than the tenant default.
 *
 * A multi-acquirer account settles in several currencies at once, so a row that
 * says EUR has to render with a euro sign — printing the reporting currency's
 * symbol next to another currency's code is how reconciliation errors start.
 * Formatters are cached because tables call this once per cell.
 */
const perCurrency = new Map();
export const formatCurrencyIn = (value, code) => {
  if (!code || code === CURRENCY) return formatCurrency(value);
  let formatter = perCurrency.get(code);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 2,
      });
    } catch {
      formatter = currency;
    }
    perCurrency.set(code, formatter);
  }
  return formatter.format(Number(value) || 0);
};
export const formatCompactCurrency = (value) => compactCurrency.format(Number(value) || 0);
export const formatNumber = (value) => number.format(Number(value) || 0);

export const formatPercent = (value, digits = 2) => `${(Number(value) || 0).toFixed(digits)}%`;

/** Basis points. Cardflo sells savings in bps, so it gets its own formatter. */
export const formatBps = (value, { sign = false } = {}) => {
  const n = Number(value) || 0;
  const prefix = sign && n > 0 ? '+' : '';
  return `${prefix}${n.toFixed(0)} bps`;
};

export const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toISOString().slice(0, 10);
};

export const formatDateTime = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 19)}`;
};

/** "2026-04-12" -> "12 Apr" for axis labels. */
export const formatShortDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

export const formatMonth = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE, { month: 'short', year: '2-digit', timeZone: 'UTC' });
};

/** "2.4 MB" reads better than a byte count nobody converts in their head. */
export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
};

/** Masks all but the last four of a card number for display. */
export const maskCard = (last4) => `•••• ${String(last4).padStart(4, '0')}`;

/** "2450e8" -> readable latency. Sub-second routing is a selling point. */
export const formatLatency = (ms) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`);

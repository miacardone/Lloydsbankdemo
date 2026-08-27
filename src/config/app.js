/** Non-visual app constants. */
export const APP = {
  /** Blank means "use the mock dataset in src/data". */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  /** Shown in the footer so demo builds are never mistaken for production. */
  isDemo: !import.meta.env.VITE_API_BASE_URL,
  copyrightYear: 2026,
  dateRangeDefault: 'Last 90 days',
};

/**
 * Selectable windows. Each one carries the number of days it means, so a page
 * can act on the choice instead of just displaying it — a range picker that
 * changes nothing is worse than no range picker.
 */
export const DATE_RANGES = [
  { value: '7', label: 'Last 7 days', days: 7 },
  { value: '30', label: 'Last 30 days', days: 30 },
  { value: '90', label: 'Last 90 days', days: 90 },
  { value: 'ytd', label: 'Year to date', days: null },
];

export const DEFAULT_RANGE = '90';

/** The inclusive start of a window, as an ISO date. */
export function rangeStart(value, today) {
  const end = today instanceof Date ? new Date(today) : new Date(today);
  const range = DATE_RANGES.find((entry) => entry.value === value) ?? DATE_RANGES[2];
  if (range.days === null) {
    return `${end.getUTCFullYear()}-01-01`;
  }
  end.setUTCDate(end.getUTCDate() - (range.days - 1));
  return end.toISOString().slice(0, 10);
}

export default APP;

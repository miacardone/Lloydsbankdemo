/** Non-visual app constants. */
export const APP = {
  /** Blank means "use the mock dataset in src/data". */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  /** Shown in the footer so demo builds are never mistaken for production. */
  isDemo: !import.meta.env.VITE_API_BASE_URL,
  copyrightYear: 2026,
  dateRangeDefault: 'Last 90 days',
};

export const DATE_RANGES = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'Year to date',
  'Custom range',
];

export default APP;

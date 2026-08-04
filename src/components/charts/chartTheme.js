/**
 * Charts read colours from CSS variables so they re-skin with the tenant.
 * Recharts needs plain strings, so we resolve the variables at render time.
 */
export function readVar(name, fallback = '') {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function seriesColor(index) {
  return `var(--cf-chart-${(index % 6) + 1})`;
}

export const axisProps = {
  stroke: 'var(--cf-chart-axis)',
  tick: { fill: 'var(--cf-chart-axis)', fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: 'var(--cf-chart-grid)' },
};

export const gridProps = {
  stroke: 'var(--cf-chart-grid)',
  strokeDasharray: '3 3',
  vertical: false,
};

export const tooltipProps = {
  cursor: { fill: 'var(--cf-brand-lightest-hex)', fillOpacity: 0.55 },
  contentStyle: {
    borderRadius: 'var(--cf-radius)',
    border: '1px solid var(--cf-chart-grid)',
    boxShadow: '0 8px 24px rgb(51 51 51 / 0.12)',
    fontSize: '0.8125rem',
    fontFamily: 'var(--cf-font-body)',
    padding: '8px 10px',
  },
  labelStyle: { color: 'var(--cf-ink-hex)', fontWeight: 700, marginBottom: 4 },
};

export const legendProps = {
  iconType: 'circle',
  iconSize: 8,
  wrapperStyle: { fontSize: '0.75rem', color: 'var(--cf-ink-muted-hex)', paddingTop: 8 },
};

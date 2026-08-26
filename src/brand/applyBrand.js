/**
 * Pushes a brand object onto the document as CSS custom properties.
 *
 * Colors are written as space-separated RGB channels ("81 81 144") because
 * Tailwind composes them with `rgb(var(--cf-brand) / <alpha-value>)`, which is
 * what lets `bg-brand/10` work on a runtime-swapped color.
 */

const HEX = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;

export function hexToRgbChannels(hex) {
  if (typeof hex !== 'string' || !HEX.test(hex.trim())) return null;
  let value = hex.trim().replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const int = Number.parseInt(value, 16);
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** camelCase -> kebab-case, so `brandLightest` becomes `--cf-brand-lightest`. */
const toVarName = (key) => `--cf-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

export function brandToCssVars(brand) {
  const vars = {};

  Object.entries(brand.colors ?? {}).forEach(([key, hex]) => {
    const channels = hexToRgbChannels(hex);
    if (channels) vars[toVarName(key)] = channels;
    // Keep a literal copy for places that need a plain color (SVG fills, charts).
    vars[`${toVarName(key)}-hex`] = hex;
  });

  vars['--cf-font-body'] = brand.typography?.body ?? 'system-ui, sans-serif';
  vars['--cf-font-display'] = brand.typography?.display ?? 'Georgia, serif';
  vars['--cf-radius'] = brand.shape?.radius ?? '4px';

  (brand.charts?.series ?? []).forEach((color, index) => {
    vars[`--cf-chart-${index + 1}`] = color;
  });
  vars['--cf-chart-grid'] = brand.charts?.grid ?? '#E4E4EA';
  vars['--cf-chart-axis'] = brand.charts?.axis ?? '#999999';

  return vars;
}

const FONT_LINK_ID = 'cf-webfont';

function ensureWebfont(href) {
  if (typeof document === 'undefined' || !href) return;
  let link = document.getElementById(FONT_LINK_ID);
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
}

export function applyBrand(brand) {
  if (typeof document === 'undefined' || !brand) return;
  const root = document.documentElement;

  Object.entries(brandToCssVars(brand)).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  root.dataset.brand = brand.id;
  ensureWebfont(brand.typography?.webfontHref);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', brand.colors?.brandDark ?? '#03072E');
  if (brand.name)
    document.title = `${brand.name} ${brand.content?.portalName ?? 'Merchant Portal'}`;
}

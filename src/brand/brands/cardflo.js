/**
 * Cardflo — primary brand.
 *
 * Anchored on the navy Cardflo publishes as its own theme color
 * (`<meta name="theme-color" content="#03072e">` on cardflo.io). The rest of the
 * ramp is derived to sit around it: a saturated routing blue for actions, and a
 * signal green for the thing Cardflo actually sells — approvals, recovered
 * declines, basis points saved.
 *
 * When the official brand pack lands, this file is the only one that changes.
 * Nothing else in the codebase hard-codes a color.
 */
export const cardflo = {
  id: 'cardflo',
  name: 'Cardflo',
  legalName: 'Cardflo Limited',
  tagline: 'Your global payments partner',
  supportEmail: 'support@cardflo.io',
  supportPhone: '+1 (415) 555-0161',
  website: 'https://cardflo.io',

  logo: {
    /* Type + vector, never a bitmap — so the mark recolors with the tenant.
       See src/components/brand/Wordmark.jsx */
    type: 'wordmark',
    text: 'Cardflo',
    /* The route glyph: three lanes converging on one. Cardflo's whole thesis. */
    glyph: 'route',
    monogram: 'C',
  },

  colors: {
    /* --- core ramp --- */
    brand: '#2450E8', // routing blue — primary actions, links, active nav
    brandDark: '#03072E', // Cardflo navy — nav rail, dark surfaces
    brandMedium: '#6E86F2',
    brandLight: '#B3C1F9',
    brandLightest: '#EEF2FE',
    brandContrast: '#FFFFFF',

    accent: '#00C08B', // signal green — approvals, uplift, recovery
    accentSoft: '#DAF7EE',

    ink: '#0F1533',
    inkMuted: '#5A6180',
    inkSubtle: '#8C93AD',
    inkInverse: '#FFFFFF',

    surface: '#FFFFFF',
    surfaceSunken: '#F5F7FB',
    surfaceRaised: '#FFFFFF',
    surfaceNav: '#03072E',
    surfaceNavActive: '#16214F',

    line: '#E3E8F2',
    lineStrong: '#C7CEDF',

    /* --- states --- */
    positive: '#00A97C', // approved, settled, recovered
    negative: '#D93F45', // declined, chargeback, breach
    caution: '#E8912B', // at-risk ratio, pending review
    info: '#2450E8',
  },

  /* Chart series, ordered so the brand leads and the green reads as "won". */
  charts: {
    series: [
      '#2450E8',
      '#E07A1F',
      '#11B67A',
      '#C05A93',
      '#E0A800',
      '#5B3FA8',
      '#00A5B5',
      '#A94F2E',
    ],
    grid: '#E3E8F2',
    axis: '#8C93AD',
    areaFrom: 'rgba(36, 80, 232, 0.26)',
    areaTo: 'rgba(36, 80, 232, 0.01)',
  },

  typography: {
    display: "'Inter Tight', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    /* Injected at runtime. Swap for a self-hosted file if the license requires. */
    webfontHref:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap',
  },

  shape: {
    radius: '10px',
  },

  /* Copy that changes per tenant. Kept here so pages never hard-code a name. */
  content: {
    portalName: 'Merchant Portal',
    currency: 'USD',
    locale: 'en-US',
    demoUsername: 'CardfloDemo',
    demoPassword: 'Changeme123',
  },
};

export default cardflo;

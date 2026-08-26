/**
 * Lloyds Bank (Cardnet) — pitch-demo brand.
 *
 * Cardnet is Lloyds Bank's own card-acquiring brand
 * (lloydsbank.com/business/take-payments-with-cardnet), so this tenant is
 * framed as the merchant portal Cardnet customers would see.
 *
 * Colors are sampled from Lloyds' own logo artwork (public/brands/lloyds-
 * bank-mark.svg) rather than derived like the other tenants — real green
 * (#11B67A), real horse-mark black. `logo.image` points at that mark; it's
 * only ever shown on light surfaces (see Wordmark.jsx) because the artwork
 * is solid black and would disappear on the dark nav rail.
 *
 * This uses Lloyds' actual trademark, so this build is meant to sit behind
 * Vercel Authentication (Project Settings → Deployment Protection) rather
 * than a public, unauthenticated URL — that's the access gate doing the
 * work here, not an on-page disclaimer.
 *
 * Contact details are deliberately fictional: `.example` is the same reserved
 * placeholder domain used in src/brand/brands/meridian.js, and the phone
 * number sits inside the 555-0100–555-0199 block reserved for fiction in the
 * North American plan, so nothing here can be mistaken for a real support line.
 */
export const lloydsbank = {
  id: 'lloydsbank',
  name: 'Lloyds Bank',
  legalName: 'Lloyds Bank plc',
  tagline: 'Take payments with Cardnet',
  supportEmail: 'support@cardnet.example',
  supportPhone: '+1 (800) 555-0112',
  website: 'https://www.lloydsbank.com/business/take-payments-with-cardnet/online-payments.html',

  logo: {
    type: 'image',
    /* Horse + wordmark, trimmed of its background tile — used everywhere via
       Wordmark.jsx (wrapped in a white chip on the dark nav rail). */
    image: '/brands/lloyds-bank-mark.svg',
    /* Horse only, square crop — used by Monogram (collapsed nav, avatars). */
    monogramImage: '/brands/lloyds-bank-horse.svg',
    text: 'Lloyds Bank',
    /* Fallback if an image fails to load — an original abstract mark, not a
       reproduction of the horse. */
    glyph: 'arch',
    monogram: 'L',
  },

  colors: {
    /* --- core ramp --- */
    brand: '#00693E', // text-safe dark green derived from the mark's shading tone — primary actions, links, active nav
    brandDark: '#03130C', // near-black — nav rail, dark surfaces (keeps the rail's white nav text legible; the real logo green is too light for that role)
    brandMedium: '#4C8F72',
    brandLight: '#A8CDB8',
    brandLightest: '#EAF4EE',
    brandContrast: '#FFFFFF',

    accent: '#11B67A', // the actual green sampled from Lloyds' own logo artwork
    accentSoft: '#E3F9EF',

    ink: '#0A0F0C',
    inkMuted: '#57655D',
    inkSubtle: '#8B968E',
    inkInverse: '#FFFFFF',

    surface: '#FFFFFF',
    surfaceSunken: '#F4F7F5',
    surfaceRaised: '#FFFFFF',
    surfaceNav: '#03130C',
    surfaceNavActive: '#0E3324',

    line: '#DCE7E0',
    lineStrong: '#BFD0C5',

    /* --- states --- */
    positive: '#00693E',
    negative: '#C6362B',
    caution: '#B8862B',
    info: '#00693E',
  },

  charts: {
    /* Eight categorical slots, brand green first. Four near-greens read as one
       color in a legend, so the tail steps out into distinct hues instead. */
    series: [
      '#00693E',
      '#E07A1F',
      '#2A78D6',
      '#C05A93',
      '#11B67A',
      '#5B3FA8',
      '#E0A800',
      '#A94F2E',
    ],
    grid: '#DCE7E0',
    axis: '#8B968E',
    areaFrom: 'rgba(0, 105, 62, 0.26)',
    areaTo: 'rgba(0, 105, 62, 0.01)',
  },

  typography: {
    display: "'Inter Tight', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    webfontHref:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap',
  },

  shape: {
    radius: '6px',
  },

  content: {
    portalName: 'Cardnet Merchant Portal',
    currency: 'USD',
    locale: 'en-US',
    demoUsername: 'LloydsBankDemo',
    demoPassword: 'Changeme123',
  },
};

export default lloydsbank;

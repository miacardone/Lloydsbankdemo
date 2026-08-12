/**
 * Lloyds Bank (Cardnet) — pitch-demo brand.
 *
 * Cardnet is Lloyds Bank's own card-acquiring brand
 * (lloydsbank.com/business/take-payments-with-cardnet), so this tenant is
 * framed as the merchant portal Cardnet customers would see.
 *
 * The palette is a derived approximation of Lloyds' public green, not the
 * official brand pack — same caveat as src/brand/brands/cardflo.js. When a
 * real brand pack lands, this file is the only one that changes.
 *
 * Contact details are deliberately fictional: `.example` is the same reserved
 * placeholder domain used in src/brand/brands/meridian.js, and the phone
 * number sits inside Ofcom's 03069 990000–999999 block reserved for fiction
 * and drama so nothing here can be mistaken for a real Lloyds support line.
 */
export const lloydsbank = {
  id: 'lloydsbank',
  name: 'Lloyds Bank',
  legalName: 'Lloyds Bank plc',
  tagline: 'Take payments with Cardnet',
  supportEmail: 'support@cardnet.example',
  supportPhone: '03069 990112',
  website: 'https://www.lloydsbank.com/business/take-payments-with-cardnet/online-payments.html',

  logo: {
    /* Type + vector, never a bitmap — so the mark recolours with the tenant. */
    type: 'wordmark',
    text: 'Lloyds Bank',
    /* An original abstract mark (arch + keystone) — deliberately not a
       reproduction of Lloyds' trademarked black horse. */
    glyph: 'arch',
    monogram: 'L',
  },

  colors: {
    /* --- core ramp --- */
    brand: '#00693E', // Lloyds green — primary actions, links, active nav
    brandDark: '#062A1B', // deep green-black — nav rail, dark surfaces
    brandMedium: '#4C8F72',
    brandLight: '#A8CDB8',
    brandLightest: '#EAF4EE',
    brandContrast: '#FFFFFF',

    accent: '#B89550', // muted gold — kept distinct from the green so "good news" doesn't disappear into the brand colour
    accentSoft: '#F3EBD8',

    ink: '#0F1B15',
    inkMuted: '#57655D',
    inkSubtle: '#8B968E',
    inkInverse: '#FFFFFF',

    surface: '#FFFFFF',
    surfaceSunken: '#F4F7F5',
    surfaceRaised: '#FFFFFF',
    surfaceNav: '#062A1B',
    surfaceNavActive: '#0F4530',

    line: '#DCE7E0',
    lineStrong: '#BFD0C5',

    /* --- states --- */
    positive: '#00693E',
    negative: '#C6362B',
    caution: '#B8862B',
    info: '#1D6F5C',
  },

  charts: {
    series: ['#00693E', '#B89550', '#4C8F72', '#062A1B', '#B8862B', '#8B968E'],
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
    currency: 'GBP',
    locale: 'en-GB',
  },
};

export default lloydsbank;

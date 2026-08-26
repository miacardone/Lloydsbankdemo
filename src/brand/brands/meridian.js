/**
 * Meridian Pay — a fictional reseller running on the same platform.
 *
 * This brand exists to prove the point of the build: it is the *only* thing
 * that changes between the two portals. Different palette, different type,
 * different radius, different name in the footer — same components, same
 * routes, same data layer, no rebuild.
 *
 * Use it in demos to show a partner what their own portal would look like.
 */
export const meridian = {
  id: 'meridian',
  name: 'Meridian Pay',
  legalName: 'Meridian Payments Group Ltd',
  tagline: 'Acquiring, orchestrated',
  supportEmail: 'help@meridianpay.example',
  supportPhone: '+1 (212) 555-0410',
  website: 'https://meridianpay.example',

  logo: {
    type: 'wordmark',
    text: 'Meridian',
    glyph: 'meridian',
    monogram: 'M',
  },

  colors: {
    brand: '#0E7C6B',
    brandDark: '#0A2F2A',
    brandMedium: '#4FA495',
    brandLight: '#A6D2C9',
    brandLightest: '#EAF5F2',
    brandContrast: '#FFFFFF',

    accent: '#E4A32B',
    accentSoft: '#FBF0D9',

    ink: '#132621',
    inkMuted: '#54655F',
    inkSubtle: '#8A9A94',
    inkInverse: '#FFFFFF',

    surface: '#FFFFFF',
    surfaceSunken: '#F4F8F6',
    surfaceRaised: '#FFFFFF',
    surfaceNav: '#0A2F2A',
    surfaceNavActive: '#14524A',

    line: '#DFE9E5',
    lineStrong: '#C1D2CC',

    positive: '#0E7C6B',
    negative: '#C0483F',
    caution: '#E4A32B',
    info: '#2E6F8E',
  },

  charts: {
    series: [
      '#0A8A74',
      '#E07A1F',
      '#2A78D6',
      '#C05A93',
      '#11B67A',
      '#5B3FA8',
      '#E0A800',
      '#A94F2E',
    ],
    grid: '#DFE9E5',
    axis: '#8A9A94',
    areaFrom: 'rgba(14, 124, 107, 0.24)',
    areaTo: 'rgba(14, 124, 107, 0.01)',
  },

  typography: {
    display: "'Fraunces', Georgia, serif",
    body: "'Public Sans', system-ui, -apple-system, sans-serif",
    webfontHref:
      'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Public+Sans:wght@400;500;600;700&display=swap',
  },

  shape: {
    radius: '2px',
  },

  content: {
    portalName: 'Merchant Portal',
    currency: 'USD',
    locale: 'en-US',
    demoUsername: 'MeridianDemo',
    demoPassword: 'Changeme123',
  },
};

export default meridian;

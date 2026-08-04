/**
 * Module switches.
 *
 * A white-label portal ships one codebase to tenants who bought different
 * things. Turning a flag off removes the nav entry *and* the route, so nobody
 * lands on a screen advertising a product they don't have — and nobody
 * bookmarks their way into one either.
 *
 * Move this to a per-tenant API response when the backend can serve it; the
 * shape is already what an entitlements endpoint would return.
 */
export const features = {
  routing: true,
  settlements: true,
  alerts: true,
  riskNotices: true,
  monitoring: true,
  affiliateReporting: true,
  webhooks: true,
  brandSwitcher: import.meta.env.VITE_SHOW_BRAND_SWITCHER !== 'false',
};

export const isEnabled = (key) => (key ? features[key] !== false : true);

export default features;

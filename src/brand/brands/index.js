import cardflo from './cardflo';
import meridian from './meridian';
import lloydsbank from './lloydsbank';

/**
 * Registry of every tenant this build can render.
 *
 * Onboarding a new tenant, in full: drop a file in this folder shaped like
 * cardflo.js, import it, add it below. No component changes, no design-system
 * rebuild, no CSS to touch.
 */
export const brands = {
  [cardflo.id]: cardflo,
  [meridian.id]: meridian,
  [lloydsbank.id]: lloydsbank,
};

export const brandList = Object.values(brands);

/**
 * This build ships as the Lloyds Bank demo, so that's the hardcoded default —
 * no `VITE_DEFAULT_BRAND` env var required. Still overridable by one (mainly
 * useful for local dev, e.g. `VITE_DEFAULT_BRAND=cardflo npm run dev`), so
 * nothing here changes for a deploy target that *can* set env vars.
 */
export const DEFAULT_BRAND_ID =
  import.meta.env.VITE_DEFAULT_BRAND && brands[import.meta.env.VITE_DEFAULT_BRAND]
    ? import.meta.env.VITE_DEFAULT_BRAND
    : lloydsbank.id;

export function getBrand(id) {
  return brands[id] ?? brands[DEFAULT_BRAND_ID];
}

export { cardflo, meridian, lloydsbank };

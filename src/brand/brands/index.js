import cardflo from './cardflo';
import meridian from './meridian';

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
};

export const brandList = Object.values(brands);

export const DEFAULT_BRAND_ID =
  import.meta.env.VITE_DEFAULT_BRAND && brands[import.meta.env.VITE_DEFAULT_BRAND]
    ? import.meta.env.VITE_DEFAULT_BRAND
    : cardflo.id;

export function getBrand(id) {
  return brands[id] ?? brands[DEFAULT_BRAND_ID];
}

export { cardflo, meridian };

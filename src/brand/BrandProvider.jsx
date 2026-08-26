import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrandContext } from './BrandContext';
import { applyBrand } from './applyBrand';
import { setMoneyLocale } from '@/lib/format';
import { DEFAULT_BRAND_ID, brandList, getBrand } from './brands';

const STORAGE_KEY = 'cf.brand';

function readStoredBrandId() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_BRAND_ID;
  } catch {
    return DEFAULT_BRAND_ID;
  }
}

/**
 * Owns the active tenant. Everything downstream reads colors through CSS
 * variables, so switching brands never remounts the tree.
 */
export function BrandProvider({ children, brandId: controlledId }) {
  const [brandId, setBrandId] = useState(() => controlledId ?? readStoredBrandId());

  const brand = useMemo(() => getBrand(controlledId ?? brandId), [controlledId, brandId]);

  useEffect(() => {
    applyBrand(brand);
    setMoneyLocale(brand.content ?? {});
  }, [brand]);

  const switchBrand = useCallback((nextId) => {
    setBrandId(nextId);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextId);
    } catch {
      /* private mode — the brand still applies for this session */
    }
  }, []);

  const value = useMemo(
    () => ({ brand, brandId: brand.id, brands: brandList, switchBrand }),
    [brand, switchBrand],
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export default BrandProvider;

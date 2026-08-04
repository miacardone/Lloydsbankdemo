import { useContext } from 'react';
import { BrandContext } from '@/brand/BrandContext';

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used inside <BrandProvider>');
  return context;
}

export default useBrand;

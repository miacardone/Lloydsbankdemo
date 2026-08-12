import { useBrand } from '@/hooks/useBrand';
import { Glyph } from './Glyph';
import { cn } from '@/lib/cn';

/**
 * Logo lockup: glyph + wordmark, both vector, never a bitmap.
 *
 * That is deliberate. A white-label portal has to render the mark in blue on
 * white, white on navy, and whatever a new tenant brings, without anyone
 * exporting a fresh PNG per tenant per background.
 */
export function Wordmark({ tone = 'color', size = 'md', className }) {
  const { brand } = useBrand();

  const sizes = {
    sm: { glyph: 18, text: 'text-[0.9375rem]', imageHeight: 22 },
    md: { glyph: 24, text: 'text-[1.1875rem]', imageHeight: 28 },
    lg: { glyph: 34, text: 'text-[1.75rem]', imageHeight: 40 },
  };
  const { glyph, text, imageHeight } = sizes[size] ?? sizes.md;

  /* A real logo image only ever gets used on a light, colour-tone surface —
     it's solid black artwork, so it would disappear on the dark nav rail
     that `inverse`/`mono` tones are drawn on. Those tones keep falling back
     to the drawn Glyph below. */
  if (brand.logo?.type === 'image' && brand.logo.image && tone === 'color') {
    return (
      <span className={cn('inline-flex items-center', className)}>
        <img src={brand.logo.image} alt={brand.name} style={{ height: imageHeight }} />
        <span className="sr-only">{brand.name} home</span>
      </span>
    );
  }

  const wordColor =
    tone === 'inverse'
      ? 'var(--cf-ink-inverse-hex, #fff)'
      : tone === 'mono'
        ? 'currentColor'
        : 'var(--cf-brand-dark-hex, #03072E)';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Glyph name={brand.logo?.glyph ?? 'route'} size={glyph} tone={tone} />
      <span
        className={cn('font-display font-semibold leading-none tracking-[-0.02em]', text)}
        style={{ color: wordColor }}
      >
        {brand.logo?.text ?? brand.name}
      </span>
      <span className="sr-only">{brand.name} home</span>
    </span>
  );
}

/** Square mark for collapsed nav, favicons and avatars. */
export function Monogram({ size = 32, tone = 'color', className }) {
  const { brand } = useBrand();

  const bg = tone === 'inverse' ? 'var(--cf-brand-contrast-hex, #fff)' : 'var(--cf-brand-dark-hex)';
  const glyphTone = tone === 'inverse' ? 'color' : 'inverse';

  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-cf', className)}
      style={{ width: size, height: size, background: bg }}
      role="img"
      aria-label={brand.name}
    >
      <Glyph name={brand.logo?.glyph ?? 'route'} size={size * 0.66} tone={glyphTone} />
    </span>
  );
}

export default Wordmark;

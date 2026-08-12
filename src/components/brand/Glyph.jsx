import { cn } from '@/lib/cn';

/**
 * The mark.
 *
 * Cardflo's product is one integration fanning out across many acquirers, so
 * the glyph is three lanes resolving into a single trunk. The top lane is drawn
 * in the accent colour because that is the routing decision — the acquirer the
 * transaction actually took.
 *
 * Drawn, not imported, so it inherits the active tenant's palette. A tenant
 * with no glyph of its own falls back to a plain trunk.
 */

const GLYPHS = {
  /** Cardflo: three lanes converging. */
  route: ({ lane, trunk, live }) => (
    <>
      <path
        d="M2 6 C 9 6, 11 12, 18 12"
        fill="none"
        stroke={lane}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M2 18 C 9 18, 11 12, 18 12"
        fill="none"
        stroke={lane}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M2 12 H 18" fill="none" stroke={live} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20.5" cy="12" r="3.5" fill={trunk} />
    </>
  ),

  /** Meridian: a line crossing a circle — a meridian. */
  meridian: ({ lane, trunk, live }) => (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke={lane} strokeWidth="2.5" />
      <path d="M12 3 C 6 8, 6 16, 12 21" fill="none" stroke={live} strokeWidth="2.5" />
      <path d="M3 12 H 21" fill="none" stroke={trunk} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),

  /** Lloyds Bank: an arch on a baseline — stability, not a crest. */
  arch: ({ lane, trunk, live }) => (
    <>
      <path
        d="M4 20 V12 C4 6.5 7.6 3 12 3 C16.4 3 20 6.5 20 12 V20"
        fill="none"
        stroke={lane}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M3 20 H21" fill="none" stroke={trunk} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.25" fill={live} />
    </>
  ),
};

export function Glyph({ name = 'route', size = 24, tone = 'color', className, animated = false }) {
  const draw = GLYPHS[name];
  if (!draw) return null;

  const lane =
    tone === 'inverse'
      ? 'rgba(255,255,255,0.45)'
      : tone === 'mono'
        ? 'currentColor'
        : 'var(--cf-brand-light-hex, #B3C1F9)';

  const trunk =
    tone === 'inverse'
      ? 'var(--cf-ink-inverse-hex, #fff)'
      : tone === 'mono'
        ? 'currentColor'
        : 'var(--cf-brand-hex, #2450E8)';

  const live =
    tone === 'color' ? 'var(--cf-accent-hex, #00C08B)' : tone === 'mono' ? 'currentColor' : '#fff';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('shrink-0', animated && 'animate-cf-flow', className)}
      aria-hidden="true"
      focusable="false"
    >
      {draw({ lane, trunk, live })}
    </svg>
  );
}

export default Glyph;

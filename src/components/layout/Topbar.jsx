import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Palette, User } from 'lucide-react';
import { useBrand } from '@/hooks/useBrand';
import { useAuth } from '@/hooks/useAuth';
import { features } from '@/config/features';
import { currentUser } from '@/data/users';
import { Glyph } from '@/components/brand/Glyph';
import { cn } from '@/lib/cn';

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

function Menu2({ label, icon: Icon, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-cf px-2 py-1.5 text-cf-body text-ink-muted transition hover:bg-surface-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {Icon ? <Icon size={16} aria-hidden="true" /> : null}
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={cn('transition', open && 'rotate-180')}
        />
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-40 mt-1 min-w-56 animate-cf-fade-up rounded-cf border border-line bg-surface p-1 shadow-cf-pop motion-reduce:animate-none',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      ) : null}
    </div>
  );
}

const itemClass =
  'flex w-full items-center gap-2 rounded-cf px-2.5 py-2 text-left text-cf-body text-ink transition hover:bg-brand-lightest hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand';

export function Topbar({ onOpenMobileNav, openRiskNotices = 0 }) {
  const { brand, brandId, brands, switchBrand } = useBrand();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="rounded-cf p-1.5 text-ink-muted transition hover:bg-surface-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand lg:hidden"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {features.brandSwitcher ? (
          <Menu2 label="Brand" icon={Palette}>
            {({ close }) => (
              <>
                <p className="px-2.5 pb-1 pt-1.5 text-cf-label uppercase text-ink-subtle">
                  Preview as tenant
                </p>
                {brands.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={option.id === brandId}
                    onClick={() => {
                      switchBrand(option.id);
                      close();
                    }}
                    className={itemClass}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ background: option.colors.brand }}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{option.name}</span>
                    {option.id === brandId ? <Glyph size={12} /> : null}
                  </button>
                ))}
                <p className="border-t border-line px-2.5 pb-1 pt-2 text-[0.6875rem] leading-snug text-ink-subtle">
                  Every colour, font and logo on screen comes from the tenant file. Hide this menu
                  with VITE_SHOW_BRAND_SWITCHER=false.
                </p>
              </>
            )}
          </Menu2>
        ) : null}

        <Link
          to="/risk-notices"
          className="relative rounded-cf p-2 text-ink-muted transition hover:bg-surface-sunken hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={`Risk notices, ${openRiskNotices} open`}
        >
          <Bell size={17} aria-hidden="true" />
          {openRiskNotices > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-ink">
              {openRiskNotices}
            </span>
          ) : null}
        </Link>

        <Menu2 label={currentUser.name} icon={User}>
          {() => (
            <>
              <div className="px-2.5 py-2">
                <p className="text-cf-body font-bold text-ink">{currentUser.name}</p>
                <p className="text-[0.75rem] text-ink-subtle">{currentUser.email}</p>
                <p className="mt-1 text-[0.75rem] text-ink-subtle">{currentUser.role}</p>
              </div>
              <div className="border-t border-line pt-1">
                <Link to="/settings" className={itemClass} role="menuitem">
                  <User size={15} aria-hidden="true" />
                  Your profile
                </Link>
                <Link to="/support" className={itemClass} role="menuitem">
                  <Bell size={15} aria-hidden="true" />
                  Support
                </Link>
                <button
                  type="button"
                  className={itemClass}
                  role="menuitem"
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                  }}
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sign out
                </button>
              </div>
              <p className="border-t border-line px-2.5 pb-1 pt-2 text-[0.6875rem] text-ink-subtle">
                Signed in to the {brand.name} demo. No live account is connected.
              </p>
            </>
          )}
        </Menu2>
      </div>
    </header>
  );
}

export default Topbar;

import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { ertNotices } from '@/data/ert';
import { cn } from '@/lib/cn';

const COLLAPSE_KEY = 'cf.nav.collapsed';

export function AppShell() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(COLLAPSE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    /* Route changes should land you at the top of the new page, and screen
       readers should hear the new heading rather than stay put. */
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, String(next));
      } catch {
        /* no-op */
      }
      return next;
    });
  };

  const openRiskNotices = ertNotices.filter((notice) => notice.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-surface-sunken">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-cf focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-contrast"
      >
        Skip to content
      </a>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        badges={{ openRiskNotices }}
      />

      <div
        className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[68px]' : 'lg:pl-60')}
      >
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} openRiskNotices={openRiskNotices} />
        <main id="main" className="mx-auto w-full max-w-[1600px] px-4 py-5" tabIndex={-1}>
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default AppShell;

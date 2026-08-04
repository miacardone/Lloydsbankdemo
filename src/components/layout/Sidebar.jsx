import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Wordmark, Monogram } from '@/components/brand/Wordmark';
import { isEnabled } from '@/config/features';
import { navigation } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * The navy rail. Dark enough to recede behind the working area, but still the
 * tenant's own colour rather than a generic near-black — which is the whole
 * point when the same rail ships to several brands.
 */
export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile, badges = {} }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(() =>
    navigation
      .filter((item) => item.children && location.pathname.startsWith(item.to))
      .map((item) => item.to),
  );

  const toggleGroup = (to) =>
    setOpenGroups((current) =>
      current.includes(to) ? current.filter((value) => value !== to) : [...current, to],
    );

  const items = navigation.filter((item) => isEnabled(item.feature));

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-brand-dark/50 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-surface-nav text-ink-inverse transition-[width,transform] duration-200',
          'motion-reduce:transition-none',
          collapsed ? 'w-[68px]' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-white/10',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center rounded-cf focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {collapsed ? (
              <Monogram size={30} tone="inverse" />
            ) : (
              <Wordmark tone="inverse" size="sm" />
            )}
          </NavLink>
          {!collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse navigation"
              className="hidden rounded-cf p-1 text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white lg:block"
            >
              <PanelLeftClose size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto py-3" aria-label="Main">
          <ul className="space-y-0.5 px-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isGroup = Boolean(item.children);
              const groupOpen = openGroups.includes(item.to);
              const badge = item.badgeKey ? badges[item.badgeKey] : null;

              return (
                <li key={item.to}>
                  <div className="flex items-stretch">
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex flex-1 items-center gap-3 rounded-cf px-2.5 py-2 transition',
                          'text-cf-nav-link text-white/75',
                          'hover:bg-white/10 hover:text-white',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white',
                          collapsed && 'justify-center px-0',
                          isActive && 'bg-surface-navActive text-white',
                        )
                      }
                    >
                      <Icon size={16} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      {!collapsed && badge ? (
                        <span className="ml-auto rounded-full bg-accent px-1.5 py-px text-[0.625rem] font-bold text-ink">
                          {badge}
                        </span>
                      ) : null}
                    </NavLink>

                    {isGroup && !collapsed ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.to)}
                        aria-expanded={groupOpen}
                        aria-label={`${groupOpen ? 'Hide' : 'Show'} ${item.label} pages`}
                        className="ml-0.5 rounded-cf px-1.5 text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                      >
                        <ChevronDown
                          size={14}
                          aria-hidden="true"
                          className={cn('transition-transform', groupOpen && 'rotate-180')}
                        />
                      </button>
                    ) : null}
                  </div>

                  {isGroup && groupOpen && !collapsed ? (
                    <ul className="mb-1 mt-0.5 space-y-px border-l border-white/15 pl-3 ml-4">
                      {item.children
                        .filter((child) => isEnabled(child.feature))
                        .map((child) => (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              end={child.end}
                              onClick={onCloseMobile}
                              className={({ isActive }) =>
                                cn(
                                  'block rounded-cf px-2.5 py-1.5 text-cf-nav-link text-white/60 transition',
                                  'hover:bg-white/10 hover:text-white',
                                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white',
                                  isActive && 'bg-white/10 text-white',
                                )
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        {collapsed ? (
          <div className="hidden border-t border-white/10 p-2 lg:block">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expand navigation"
              className="flex w-full justify-center rounded-cf p-2 text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <PanelLeft size={16} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export default Sidebar;

import {
  Activity,
  BellRing,
  Banknote,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Route,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';

/**
 * One source of truth for the sidebar, the breadcrumbs and the page titles.
 *
 * `feature` keys map to src/config/features.js, so a tenant that hasn't bought
 * a module never sees it — no greyed-out upsell rows, no dead links.
 */
export const navigation = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Transactions',
    to: '/transactions',
    icon: Receipt,
  },
  {
    label: 'Smart routing',
    to: '/routing',
    icon: Route,
    feature: 'routing',
  },
  {
    label: 'Settlements',
    to: '/settlements',
    icon: Banknote,
    feature: 'settlements',
  },
  {
    label: 'Chargebacks',
    to: '/chargebacks',
    icon: CreditCard,
  },
  {
    label: 'Pre-dispute alerts',
    to: '/alerts',
    icon: BellRing,
    feature: 'alerts',
  },
  {
    label: 'Risk notices',
    to: '/risk-notices',
    icon: ShieldAlert,
    feature: 'riskNotices',
    badgeKey: 'openRiskNotices',
  },
  {
    label: 'Reports',
    to: '/reports',
    icon: FileBarChart,
    children: [
      { label: 'Overview', to: '/reports', end: true },
      { label: 'MID health', to: '/reports/mid-health' },
      { label: 'Approval performance', to: '/reports/resultant-kpi' },
      { label: 'Affiliate report', to: '/reports/affiliate', feature: 'affiliateReporting' },
      { label: 'Advanced report', to: '/reports/advanced' },
      { label: 'Alerts report', to: '/reports/alerts', feature: 'alerts' },
      { label: 'Risk notices', to: '/reports/risk-notices', feature: 'riskNotices' },
      { label: 'Month to date', to: '/reports/month-to-date' },
    ],
  },
  {
    label: 'Monitoring',
    to: '/monitoring',
    icon: Activity,
    feature: 'monitoring',
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings,
    children: [
      { label: 'Your profile', to: '/settings', end: true },
      { label: 'Merchants', to: '/settings/merchants' },
      { label: 'MIDs', to: '/settings/mids' },
      { label: 'Notifications', to: '/settings/notifications' },
    ],
  },
  {
    label: 'Support',
    to: '/support',
    icon: LifeBuoy,
  },
];

/** Flattened lookup so any route can find its own label without prop drilling. */
export const routeTitles = navigation.reduce((map, item) => {
  map[item.to] = item.label;
  (item.children ?? []).forEach((child) => {
    map[child.to] = child.label === 'Overview' ? item.label : child.label;
  });
  return map;
}, {});

export default navigation;

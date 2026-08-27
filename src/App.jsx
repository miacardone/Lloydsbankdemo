import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ToastProvider } from '@/components/ui/Toast';
import { features } from '@/config/features';

/**
 * Routes are code-split by page. The dashboard is eager because it is the
 * landing screen and should never flash a skeleton on first paint.
 *
 * Feature-flagged routes are omitted entirely rather than rendered and hidden,
 * so a tenant without a module cannot reach it by typing the URL.
 */
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';

const Transactions = lazy(() => import('@/pages/Transactions'));
const Routing = lazy(() => import('@/pages/Routing'));
const Settlements = lazy(() => import('@/pages/Settlements'));
const Chargebacks = lazy(() => import('@/pages/Chargebacks'));
const Alerts = lazy(() => import('@/pages/Alerts'));
const RiskNotices = lazy(() => import('@/pages/RiskNotices'));
const Monitoring = lazy(() => import('@/pages/Monitoring'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const Support = lazy(() => import('@/pages/Support'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const ReportsOverview = lazy(() => import('@/pages/reports/ReportsOverview'));
const MidHealth = lazy(() => import('@/pages/reports/MidHealth'));
const ResultantKpi = lazy(() => import('@/pages/reports/ResultantKpi'));
const AffiliateReport = lazy(() => import('@/pages/reports/AffiliateReport'));
const AdvancedReport = lazy(() => import('@/pages/reports/AdvancedReport'));
const AlertsReport = lazy(() => import('@/pages/reports/AlertsReport'));
const RiskNoticeReports = lazy(() => import('@/pages/reports/RiskNoticeReports'));
const MonthToDate = lazy(() => import('@/pages/reports/MonthToDate'));

const ProfileSettings = lazy(() => import('@/pages/settings/ProfileSettings'));
const MerchantSettings = lazy(() => import('@/pages/settings/MerchantSettings'));
const MidManagement = lazy(() => import('@/pages/settings/MidManagement'));
const NotificationSettings = lazy(() => import('@/pages/settings/NotificationSettings'));

function PageFallback() {
  return (
    <div className="rounded-cf border border-line bg-surface">
      <TableSkeleton rows={8} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="chargebacks" element={<Chargebacks />} />

            {features.routing ? <Route path="routing" element={<Routing />} /> : null}
            {features.settlements ? <Route path="settlements" element={<Settlements />} /> : null}
            {features.alerts ? <Route path="alerts" element={<Alerts />} /> : null}
            {features.riskNotices ? <Route path="risk-notices" element={<RiskNotices />} /> : null}
            {features.monitoring ? <Route path="monitoring" element={<Monitoring />} /> : null}

            <Route path="reports">
              <Route index element={<ReportsOverview />} />
              <Route path="mid-health" element={<MidHealth />} />
              <Route path="resultant-kpi" element={<ResultantKpi />} />
              {features.affiliateReporting ? (
                <Route path="affiliate" element={<AffiliateReport />} />
              ) : null}
              <Route path="advanced" element={<AdvancedReport />} />
              {features.alerts ? <Route path="alerts" element={<AlertsReport />} /> : null}
              {features.riskNotices ? (
                <Route path="risk-notices" element={<RiskNoticeReports />} />
              ) : null}
              <Route path="month-to-date" element={<MonthToDate />} />
            </Route>

            <Route path="users" element={<UserManagement />} />

            <Route path="settings">
              <Route index element={<ProfileSettings />} />
              <Route path="merchants" element={<MerchantSettings />} />
              <Route path="mids" element={<MidManagement />} />
              <Route path="notifications" element={<NotificationSettings />} />
            </Route>

            <Route path="support" element={<Support />} />

            {/* Legacy paths, kept so links shared before the rename keep working. */}
            <Route path="ert" element={<Navigate to="/risk-notices" replace />} />
            <Route path="reports/ert" element={<Navigate to="/reports/risk-notices" replace />} />
            <Route path="payments" element={<Navigate to="/transactions" replace />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

export default App;

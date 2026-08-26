import { Link } from 'react-router-dom';
import { ArrowUpRight, Banknote, Gauge, Percent, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { ChartCard } from '@/components/charts/ChartCard';
import { DonutStat, TrendArea } from '@/components/charts/Charts';
import { DATE_RANGES } from '@/config/app';
import { features } from '@/config/features';
import {
  acquirerPerformance,
  declineBreakdown,
  methodMix,
  transactionSummary,
  volumeTrend,
} from '@/data/transactions';
import { chargebackKpis } from '@/data/chargebacks';
import { settlementSummary } from '@/data/settlements';
import {
  formatBps,
  formatCompactCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatShortDate,
} from '@/lib/format';

/* One slot per method, none repeated — the old map handed chart-2 and chart-3
   out twice, so four slices came back in two colors. */
const METHOD_COLORS = {
  Card: 'var(--cf-chart-1)',
  'Apple Pay': 'var(--cf-chart-2)',
  'Google Pay': 'var(--cf-chart-3)',
  PayPal: 'var(--cf-chart-4)',
  'ACH Direct Debit': 'var(--cf-chart-5)',
  Venmo: 'var(--cf-chart-6)',
  Klarna: 'var(--cf-chart-7)',
  Affirm: 'var(--cf-chart-8)',
};

/**
 * Acquirer split.
 *
 * A stacked bar rather than a second donut: the question a merchant asks here
 * is "how concentrated am I?", and a single bar answers that at a glance in a
 * way six pie slices do not.
 */
function AcquirerSplit() {
  const top = acquirerPerformance.slice(0, 5);
  const rest = acquirerPerformance.slice(5);
  const restShare = rest.reduce((sum, a) => sum + a.share, 0);

  return (
    <section className="relative overflow-hidden rounded-cf border border-line bg-surface pt-[3px] shadow-cf before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-brand">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-3">
        <h3 className="text-cf-body font-bold text-ink">Where your volume routed</h3>
        <Link
          to="/routing"
          className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-brand hover:underline"
        >
          Routing rules
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </header>

      <div className="px-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-sunken">
          {top.map((acquirer, index) => (
            <span
              key={acquirer.id}
              style={{
                width: `${acquirer.share}%`,
                background: `var(--cf-chart-${index + 1})`,
              }}
              title={`${acquirer.name} — ${formatPercent(acquirer.share, 1)}`}
            />
          ))}
          {restShare > 0 ? (
            <span style={{ width: `${restShare}%`, background: 'var(--cf-chart-6)' }} />
          ) : null}
        </div>

        <ul className="mt-3 divide-y divide-line">
          {top.map((acquirer, index) => (
            <li key={acquirer.id} className="flex items-center gap-3 py-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: `var(--cf-chart-${index + 1})` }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-cf-body text-ink">{acquirer.name}</span>
              <span className="tabular-nums text-[0.75rem] text-ink-subtle">
                {formatPercent(acquirer.approvalRate, 1)} approved
              </span>
              <span className="w-16 text-right tabular-nums text-cf-body font-medium text-ink">
                {formatPercent(acquirer.share, 1)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-1 border-t border-line px-4 py-2 text-[0.75rem] text-ink-subtle">
        Your top acquirer carries {formatPercent(top[0]?.share ?? 0, 0)} of volume at{' '}
        {formatBps(top[0]?.effectiveBps ?? 0)}.
      </p>
    </section>
  );
}

/** Soft declines are recoverable revenue; hard declines are not. The split matters. */
function DeclinePanel() {
  const soft = declineBreakdown.filter((d) => d.type === 'soft');
  const softCount = soft.reduce((sum, d) => sum + d.count, 0);
  const total = declineBreakdown.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="relative overflow-hidden rounded-cf border border-line bg-surface pt-[3px] shadow-cf before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-brand">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h3 className="text-cf-body font-bold text-ink">Why payments declined</h3>
        <Badge tone="positive">
          {total ? formatPercent((softCount / total) * 100, 0) : '0%'} retryable
        </Badge>
      </header>

      <ul className="px-4 pb-2">
        {declineBreakdown.slice(0, 6).map((decline) => {
          const share = total ? (decline.count / total) * 100 : 0;
          return (
            <li key={decline.code} className="py-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-cf-body text-ink">
                  <span className="mr-1.5 font-mono text-[0.75rem] text-ink-subtle">
                    {decline.code}
                  </span>
                  {decline.label}
                </span>
                <span className="shrink-0 tabular-nums text-[0.75rem] text-ink-muted">
                  {formatNumber(decline.count)}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={decline.retryable ? 'h-full bg-accent' : 'h-full bg-line-strong'}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-line px-4 py-2 text-[0.75rem] text-ink-subtle">
        Green bars are soft declines — those cascade to a second acquirer automatically.
      </p>
    </section>
  );
}

export function Dashboard() {
  const topMethod = methodMix[0];
  const methodTotal = methodMix.reduce((sum, m) => sum + m.value, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="How your payments performed, what they cost, and what is on its way to your account."
        actions={
          <Select
            aria-label="Date range"
            defaultValue="Last 90 days"
            options={DATE_RANGES}
            className="w-44"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Processed volume"
          value={formatCompactCurrency(transactionSummary.processedVolume)}
          caption={`${formatNumber(transactionSummary.approvedCount)} approved payments`}
          delta={6.4}
          icon={Wallet}
          to="/transactions"
        />
        <StatCard
          label="Approval rate"
          value={formatPercent(transactionSummary.approvalRate, 1)}
          caption="Including cascaded retries"
          delta={1.8}
          icon={Percent}
          to={features.routing ? '/routing' : '/reports/resultant-kpi'}
        />
        <StatCard
          label="Effective rate"
          value={formatBps(transactionSummary.blendedEffectiveBps)}
          caption="Blended across every acquirer"
          delta={-3.2}
          direction="down-is-good"
          icon={Gauge}
          to="/reports/advanced"
        />
        <StatCard
          label="Next settlement"
          value={formatCompactCurrency(settlementSummary.upcomingNet)}
          caption={
            settlementSummary.nextPayoutDate
              ? `Arriving ${formatDate(settlementSummary.nextPayoutDate)}`
              : 'No payouts scheduled'
          }
          icon={Banknote}
          to={features.settlements ? '/settlements' : '/reports'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Processed volume, last 90 days"
          className="lg:col-span-2"
          height={260}
          note="Volume settled across all acquirers, in your reporting currency."
        >
          <TrendArea
            data={volumeTrend}
            xKey="date"
            yKey="volume"
            name="Volume"
            formatX={formatShortDate}
            formatY={formatCompactCurrency}
          />
        </ChartCard>

        <ChartCard
          title="Payment method mix"
          height={260}
          note={`${topMethod?.name ?? '—'} carries ${
            methodTotal ? formatPercent(((topMethod?.value ?? 0) / methodTotal) * 100, 0) : '0%'
          } of processed value.`}
        >
          <DonutStat
            data={methodMix}
            headline={
              methodTotal ? formatPercent(((topMethod?.value ?? 0) / methodTotal) * 100, 0) : '0%'
            }
            subline={topMethod?.name ?? ''}
            colors={METHOD_COLORS}
          />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AcquirerSplit />
        <DeclinePanel />
      </div>

      <p className="mt-3 text-[0.75rem] text-ink-subtle">
        Recovered on retry: {formatCompactCurrency(transactionSummary.recoveredVolume)} · Chargeback
        ratio {formatPercent(chargebackKpis.transactionRatio, 2)} against a scheme threshold of
        0.90%.
      </p>
    </>
  );
}

export default Dashboard;

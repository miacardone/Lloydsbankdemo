import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { DonutStat, Gauge, GroupedBars, MultiArea } from '@/components/charts/Charts';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { AlertTriangle, PiggyBank, ShieldCheck, Store } from 'lucide-react';
import { ertKpis, ertRevenueByMonth, ertTypesByRank, merchantErrorBreakdown } from '@/data/ert';
import { newAlertsByDate } from '@/data/alerts';
import { ALERT_SOURCES } from '@/data/reference';
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatShortDate,
  formatMonth,
} from '@/lib/format';

export function RiskNoticeReports() {
  const topType = ertTypesByRank[0];

  return (
    <>
      <PageHeader
        title="Risk notice reports"
        description="What the risk notices caught, what it was worth, and how much of it you have already recovered."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Notices raised"
          value={formatNumber(ertKpis.noticesThisMonth)}
          caption="This month"
          icon={AlertTriangle}
          delta={9}
          direction="down-is-good"
        />
        <StatCard
          label="Loss prevention opportunity"
          value={formatCompactCurrency(ertKpis.lossPreventionOpportunity)}
          caption="Open value, this month"
          icon={PiggyBank}
        />
        <StatCard
          label="Merchant error notices"
          value={formatNumber(ertKpis.merchantErrorNotifications)}
          caption="Fixable on your side"
          icon={Store}
        />
        <StatCard
          label="Total saved"
          value={formatCompactCurrency(ertKpis.totalPrevented)}
          caption="Since onboarding"
          icon={ShieldCheck}
          delta={14}
        />
      </div>

      <div className="mt-4">
        <ChartCard
          title="Notice value against recovered value by month"
          height={280}
          note={`Recovered ${formatCurrency(
            ertRevenueByMonth.reduce((sum, row) => sum + row.resolved, 0),
          )} of ${formatCurrency(
            ertRevenueByMonth.reduce((sum, row) => sum + row.total, 0),
          )} flagged over the last twelve months.`}
        >
          <GroupedBars
            data={ertRevenueByMonth}
            xKey="month"
            bars={[
              { key: 'total', name: 'Flagged value' },
              { key: 'resolved', name: 'Recovered' },
            ]}
            formatX={formatMonth}
          />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Notices by post date" className="lg:col-span-2" height={250}>
          <MultiArea
            data={newAlertsByDate.slice(-20)}
            xKey="date"
            keys={ALERT_SOURCES.slice(0, 4)}
            formatX={formatShortDate}
          />
        </ChartCard>

        <ChartCard
          title="Notice types by rank"
          height={250}
          note={`${topType.name} leads at ${topType.value}%.`}
        >
          <DonutStat data={ertTypesByRank} headline={`${topType.value}%`} subline={topType.name} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-cf-body font-bold text-ink">What merchant errors are made of</h3>
          <p className="mt-1 text-cf-body text-ink-muted">
            Nearly half come down to evidence that did not meet the issuer&rsquo;s bar.
          </p>
          <ul className="mt-3 space-y-2">
            {merchantErrorBreakdown.map((row) => (
              <li key={row.label}>
                <div className="flex justify-between text-cf-body">
                  <span className="text-ink">{row.label}</span>
                  <span className="font-semibold text-ink">
                    {formatNumber(row.count)}{' '}
                    <span className="font-normal text-ink-subtle">({row.share}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${row.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-cf-body font-bold text-ink">Merchant error notification rate</h3>
          <div className="h-[190px]">
            <Gauge value={1.5} max={5} label="Of total transactions" display="1.5%" />
          </div>
          <p className="border-t border-line pt-3 text-cf-body text-ink-muted">
            Every notice here is something you can fix without involving an issuer. Start with the
            descriptor and refund timing items — they resolve fastest.
          </p>
        </Card>
      </div>
    </>
  );
}

export default RiskNoticeReports;

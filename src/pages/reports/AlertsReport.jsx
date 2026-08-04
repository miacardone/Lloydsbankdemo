import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { DonutStat, Gauge, MultiArea } from '@/components/charts/Charts';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { DATE_RANGES } from '@/config/app';
import { CARD_BRAND_COLORS, ALERT_SOURCES } from '@/data/reference';
import {
  alertBreakdown,
  alertKpis,
  alertsByCardType,
  alertsByOutcome,
  newAlertsByDate,
} from '@/data/alerts';
import { formatNumber, formatPercent, formatShortDate } from '@/lib/format';

export function AlertsReport() {
  const topCard = alertsByCardType[0];
  const topOutcome = alertsByOutcome[0];
  const totalAlerts = alertsByOutcome.reduce((sum, row) => sum + row.value, 0);

  return (
    <>
      <PageHeader
        title="Alerts report"
        description="Where alerts come from, what they cost, and how many end in a refund before a chargeback posts."
        actions={
          <Select
            aria-label="Date range"
            className="w-44"
            options={DATE_RANGES}
            defaultValue="Last 30 days"
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Alerts by card type" height={260}>
          <DonutStat
            data={alertsByCardType}
            headline={`${Math.round((topCard.value / totalAlerts) * 100)}%`}
            subline={topCard.name}
            colors={CARD_BRAND_COLORS}
          />
        </ChartCard>

        <Card>
          <h3 className="text-cf-body font-bold text-ink">Alerts by transaction number</h3>
          <div className="h-[150px]">
            <Gauge
              value={alertKpis.alertsPerTransactionRate}
              max={5}
              label="Alerts by transaction"
              display={formatPercent(alertKpis.alertsPerTransactionRate, 1)}
            />
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3">
            <div>
              <dt className="text-cf-label uppercase text-ink-subtle">Transactions</dt>
              <dd className="text-cf-body font-bold text-ink">
                {formatNumber(alertKpis.totalTransactions)}
              </dd>
            </div>
            <div>
              <dt className="text-cf-label uppercase text-ink-subtle">Requests</dt>
              <dd className="text-cf-body font-bold text-ink">
                {formatNumber(alertKpis.totalRequests)}
              </dd>
            </div>
          </dl>
          <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
            {alertBreakdown.map((row) => (
              <li key={row.source} className="flex justify-between text-cf-body">
                <span className="text-ink-muted">{row.source}</span>
                <span className="font-semibold text-ink">
                  {formatNumber(row.count)}{' '}
                  <span className="font-normal text-ink-subtle">({row.share}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <ChartCard
          title="Alerts by outcome"
          height={260}
          note={`${topOutcome.name} is the most common resolution.`}
        >
          <DonutStat
            data={alertsByOutcome}
            headline={`${Math.round((topOutcome.value / totalAlerts) * 100)}%`}
            subline={topOutcome.name}
          />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard
          title="New alerts by date"
          height={300}
          note="Each line is one alert provider. Overlap tells you where you are paying twice for the same signal."
        >
          <MultiArea
            data={newAlertsByDate}
            xKey="date"
            keys={ALERT_SOURCES}
            formatX={formatShortDate}
          />
        </ChartCard>
      </div>
    </>
  );
}

export default AlertsReport;

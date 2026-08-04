import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { BarsWithRatio, Gauge, GroupedBars } from '@/components/charts/Charts';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { alertBreakdown, alertKpis, alertsVsChargebacksByMonth } from '@/data/alerts';
import { resultantKpi } from '@/data/reports';
import { formatMonth, formatNumber, formatPercent } from '@/lib/format';

export function ResultantKpi() {
  return (
    <>
      <PageHeader
        title="Resultant KPI"
        description="Transaction volume against dispute volume, and what alerts caught before they became chargebacks."
        actions={
          <>
            <Select aria-label="BIN" className="w-32" options={['All BINs']} />
            <Select
              aria-label="Platform"
              className="w-40"
              options={['All platforms', 'Shopify', 'Custom API']}
            />
          </>
        }
      />

      <ChartCard
        title="Transactions, chargebacks and ratio by month"
        height={300}
        note="January and March ratios came from promotional volume spikes, not a change in dispute behaviour."
      >
        <BarsWithRatio
          data={resultantKpi}
          xKey="month"
          bars={[
            { key: 'transactions', name: 'Transactions' },
            { key: 'chargebacks', name: 'Chargebacks' },
          ]}
          lineKey="ratio"
          lineName="Ratio"
          formatX={formatMonth}
        />
      </ChartCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Chargebacks vs alerts by month" className="lg:col-span-2" height={250}>
          <GroupedBars
            data={alertsVsChargebacksByMonth}
            xKey="month"
            bars={[
              { key: 'chargebacks', name: 'Chargebacks' },
              { key: 'alerts', name: 'Alerts' },
            ]}
            formatX={formatMonth}
          />
        </ChartCard>

        <Card>
          <h3 className="text-cf-body font-bold text-ink">Alerts by transaction</h3>
          <div className="h-[150px]">
            <Gauge
              value={alertKpis.alertsPerTransactionRate}
              max={5}
              label="Alerts by transaction"
              display={formatPercent(alertKpis.alertsPerTransactionRate, 1)}
            />
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-cf-body">
            <div>
              <dt className="text-cf-label uppercase text-ink-subtle">Transactions</dt>
              <dd className="font-bold text-ink">{formatNumber(alertKpis.totalTransactions)}</dd>
            </div>
            <div>
              <dt className="text-cf-label uppercase text-ink-subtle">Requests</dt>
              <dd className="font-bold text-ink">{formatNumber(alertKpis.totalRequests)}</dd>
            </div>
          </dl>
          <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
            {alertBreakdown.map((row) => (
              <li key={row.source} className="flex justify-between text-cf-body">
                <span className="text-ink-muted">{row.source}</span>
                <span className="font-semibold text-ink">
                  {formatNumber(row.count)} <span className="text-ink-subtle">({row.share}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

export default ResultantKpi;

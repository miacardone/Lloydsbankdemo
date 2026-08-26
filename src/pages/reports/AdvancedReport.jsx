import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { Bars, DonutStat, TrendArea } from '@/components/charts/Charts';
import { DataTable } from '@/components/table/DataTable';
import { useTableState } from '@/hooks/useTableState';
import {
  chargebackRatioByWeek,
  chargebacksByReasonCategory,
  highChargebackBins,
  monthOverMonthChange,
} from '@/data/chargebacks';
import { callCenterPerformance } from '@/data/reports';
import { formatMonth, formatNumber, formatPercent, formatShortDate } from '@/lib/format';

const callColumns = [
  { key: 'campaign', header: 'Campaign' },
  { key: 'noCall', header: 'No call #', align: 'right', value: (row) => row.noCall },
  {
    key: 'noCallPct',
    header: 'No call %',
    align: 'right',
    render: (row) => formatPercent(row.noCallPct),
    value: (row) => row.noCallPct,
  },
  { key: 'liveRep', header: 'Live rep #', align: 'right', value: (row) => row.liveRep },
  {
    key: 'liveRepPct',
    header: 'Live rep %',
    align: 'right',
    render: (row) => formatPercent(row.liveRepPct),
    value: (row) => row.liveRepPct,
  },
  { key: 'rma', header: 'RMA #', align: 'right', value: (row) => row.rma },
  {
    key: 'rmaPct',
    header: 'RMA %',
    align: 'right',
    render: (row) => formatPercent(row.rmaPct),
    value: (row) => row.rmaPct,
  },
  { key: 'ivr', header: 'IVR #', align: 'right', value: (row) => row.ivr },
  {
    key: 'ivrPct',
    header: 'IVR %',
    align: 'right',
    render: (row) => formatPercent(row.ivrPct),
    value: (row) => row.ivrPct,
  },
  { key: 'threat', header: 'Threat #', align: 'right', value: (row) => row.threat },
  {
    key: 'threatPct',
    header: 'Threat %',
    align: 'right',
    render: (row) => (
      <span className={row.threatPct > 10 ? 'font-bold text-negative' : undefined}>
        {formatPercent(row.threatPct)}
      </span>
    ),
    value: (row) => row.threatPct,
  },
];

export function AdvancedReport() {
  const table = useTableState(callCenterPerformance, {
    searchKeys: ['campaign'],
    initialSort: { key: 'threatPct', direction: 'desc' },
    initialPageSize: 10,
  });

  const fraudulent = chargebacksByReasonCategory[0];
  const worstBin = highChargebackBins[0];

  return (
    <>
      <PageHeader
        title="Advanced report"
        description="Month-over-month movement, the BINs and reason categories behind it, and how support contact affects outcomes."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Change month to month"
          height={240}
          note="Two consecutive months of decline after the June peak."
        >
          <Bars
            data={monthOverMonthChange}
            xKey="month"
            yKey="change"
            diverging
            formatX={formatMonth}
            formatY={(value) => `${value}%`}
          />
        </ChartCard>

        <ChartCard title="Chargebacks by reason category" height={240}>
          <DonutStat
            data={chargebacksByReasonCategory}
            headline={`${fraudulent.share}%`}
            subline={fraudulent.name}
          />
        </ChartCard>

        <ChartCard
          title="Highest chargeback BINs"
          height={240}
          note={`BIN ${worstBin.bin} disputes at ${worstBin.rate}% — worth a conversation with the issuer.`}
        >
          <Bars
            data={highChargebackBins}
            xKey="bin"
            yKey="rate"
            layout="horizontal"
            formatY={(value) => `${value}%`}
          />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Chargeback transaction ratio by transaction date" height={230}>
          <TrendArea
            data={chargebackRatioByWeek}
            xKey="week"
            yKey="ratio"
            name="Ratio"
            formatX={formatShortDate}
            formatY={(value) => `${value}%`}
            gradientId="pmAdvancedRatio"
          />
        </ChartCard>
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-cf-section text-ink">Call center performance</h2>
        <p className="mb-2 text-cf-body text-ink-muted">
          Campaigns where most cardholders never reached a person carry the highest threat rate.
          Total contacts across campaigns:{' '}
          {formatNumber(callCenterPerformance.reduce((sum, row) => sum + row.liveRep + row.ivr, 0))}
          .
        </p>
        <DataTable
          columns={callColumns}
          state={table}
          caption="Call center performance metrics"
          exportName="call-center-performance"
          dense
        />
      </div>
    </>
  );
}

export default AdvancedReport;

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { Select } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { monthToDate } from '@/data/reports';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

export function MonthToDate() {
  const table = useTableState(monthToDate, {
    searchKeys: ['gateway', 'mid'],
    initialSort: { key: 'posted', direction: 'desc' },
    initialPageSize: 25,
  });

  const columns = [
    { key: 'gateway', header: 'Gateway' },
    { key: 'mid', header: 'MID' },
    { key: 'posted', header: 'Posted', align: 'right', value: (row) => row.posted },
    { key: 'responded', header: 'Responded', align: 'right', value: (row) => row.responded },
    {
      key: 'won',
      header: 'Won',
      align: 'right',
      render: (row) => <span className="font-semibold text-positive">{formatNumber(row.won)}</span>,
      value: (row) => row.won,
    },
    {
      key: 'lost',
      header: 'Lost',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-negative">{formatNumber(row.lost)}</span>
      ),
      value: (row) => row.lost,
    },
    {
      key: 'winRate',
      header: 'Win rate',
      align: 'right',
      render: (row) => formatPercent(row.winRate, 1),
      value: (row) => row.winRate,
    },
    {
      key: 'recovered',
      header: 'Recovered',
      align: 'right',
      render: (row) => formatCurrency(row.recovered),
      value: (row) => row.recovered,
    },
    { key: 'pending', header: 'Awaiting response', align: 'right', value: (row) => row.pending },
  ];

  const totals = monthToDate.reduce(
    (acc, row) => ({
      posted: acc.posted + row.posted,
      won: acc.won + row.won,
      responded: acc.responded + row.responded,
      recovered: acc.recovered + row.recovered,
      pending: acc.pending + row.pending,
    }),
    { posted: 0, won: 0, responded: 0, recovered: 0, pending: 0 },
  );

  return (
    <>
      <PageHeader
        title="Month to date"
        description="Where this month stands across gateways, and what is still waiting on a response."
        actions={
          <Select
            aria-label="Reporting month"
            className="w-44"
            options={['August 2026', 'July 2026', 'June 2026']}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Posted"
          value={formatNumber(totals.posted)}
          caption="Chargebacks this month"
        />
        <StatCard
          label="Responded"
          value={formatNumber(totals.responded)}
          caption={`${formatPercent((totals.responded / totals.posted) * 100, 0)} of posted`}
        />
        <StatCard
          label="Win rate"
          value={formatPercent((totals.won / totals.responded) * 100, 1)}
          caption="On cases with a decision"
          delta={3}
        />
        <StatCard
          label="Awaiting response"
          value={formatNumber(totals.pending)}
          caption="Act before the deadline passes"
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          state={table}
          caption="Month-to-date performance by gateway"
          exportName="month-to-date"
          dense
        />
      </div>

      <p className="mt-3 text-[0.75rem] text-ink-subtle">
        Recovered so far this month: {formatCurrency(totals.recovered)}.
      </p>
    </>
  );
}

export default MonthToDate;

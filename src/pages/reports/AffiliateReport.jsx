import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Input } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { affiliateReport } from '@/data/reports';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

export function AffiliateReport() {
  const table = useTableState(affiliateReport, {
    searchKeys: ['affiliateId', 'subId'],
    initialSort: { key: 'cbAmountShare', direction: 'desc' },
    initialPageSize: 25,
  });

  const columns = [
    { key: 'affiliateId', header: 'Affiliate ID' },
    { key: 'subId', header: 'Sub ID' },
    {
      key: 'transAmount',
      header: 'Trans. amount',
      align: 'right',
      render: (row) => formatCurrency(row.transAmount),
      value: (row) => row.transAmount,
    },
    {
      key: 'cbAmount',
      header: 'CB amount',
      align: 'right',
      render: (row) => formatCurrency(row.cbAmount),
      value: (row) => row.cbAmount,
    },
    {
      key: 'cbAmountShare',
      header: 'CB amount %',
      align: 'right',
      render: (row) => (
        <span className={row.cbAmountShare > 0.6 ? 'font-bold text-negative' : undefined}>
          {formatPercent(row.cbAmountShare)}
        </span>
      ),
      value: (row) => row.cbAmountShare,
    },
    {
      key: 'transCount',
      header: 'Trans. #',
      align: 'right',
      render: (row) => formatNumber(row.transCount),
      value: (row) => row.transCount,
    },
    {
      key: 'cbCount',
      header: 'CB #',
      align: 'right',
      render: (row) => formatNumber(row.cbCount),
      value: (row) => row.cbCount,
    },
    {
      key: 'cbCountShare',
      header: 'CB #%',
      align: 'right',
      render: (row) => formatPercent(row.cbCountShare),
      value: (row) => row.cbCountShare,
    },
  ];

  const worst = affiliateReport[0];

  return (
    <>
      <PageHeader
        title="Affiliate report"
        description={`Affiliate ${worst.affiliateId} is sending the most disputed traffic at ${formatPercent(
          worst.cbAmountShare,
        )} of its volume. Sort by CB amount % to rank the rest.`}
        actions={
          <Input
            type="date"
            aria-label="Filter by date"
            defaultValue="2026-08-04"
            className="w-44"
          />
        }
      />
      <DataTable
        columns={columns}
        state={table}
        caption="Affiliate report"
        exportName="affiliate-report"
      />
    </>
  );
}

export default AffiliateReport;

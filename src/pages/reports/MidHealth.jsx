import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { RiskDot } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { midHealth } from '@/data/merchants';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

export function MidHealth() {
  const table = useTableState(midHealth, {
    searchKeys: ['mid', 'alias', 'group', 'processor'],
    initialSort: { key: 'ctr', direction: 'desc' },
  });

  const columns = [
    {
      key: 'rating',
      header: 'Rating',
      width: 72,
      align: 'center',
      render: (row) => <RiskDot level={row.rating} />,
      value: (row) => row.rating,
    },
    { key: 'mid', header: 'MID' },
    { key: 'alias', header: 'Alias' },
    { key: 'group', header: 'MID group' },
    { key: 'processor', header: 'Processor' },
    {
      key: 'transactions',
      header: 'Transactions',
      align: 'right',
      render: (row) => formatNumber(row.transactions),
      value: (row) => row.transactions,
    },
    {
      key: 'totalSales',
      header: 'Total sales',
      align: 'right',
      render: (row) => formatCurrency(row.totalSales),
      value: (row) => row.totalSales,
    },
    { key: 'chargebacks', header: 'Chargebacks', align: 'right', value: (row) => row.chargebacks },
    {
      key: 'ctr',
      header: 'CTR',
      align: 'right',
      render: (row) => (
        <span className={row.ctr > 0.9 ? 'font-bold text-negative' : undefined}>
          {formatPercent(row.ctr)}
        </span>
      ),
      value: (row) => row.ctr,
    },
    { key: 'alertCount', header: 'Alerts', align: 'right', value: (row) => row.alertCount },
    { key: 'ethocaAlerts', header: 'Ethoca', align: 'right', value: (row) => row.ethocaAlerts },
    { key: 'verifiAlerts', header: 'Verifi', align: 'right', value: (row) => row.verifiAlerts },
    { key: 'directAlerts', header: 'Direct', align: 'right', value: (row) => row.directAlerts },
    {
      key: 'alertToChargebackRatio',
      header: 'Alert / CB',
      align: 'right',
      render: (row) => row.alertToChargebackRatio.toFixed(2),
      value: (row) => row.alertToChargebackRatio,
    },
  ];

  const atRisk = midHealth.filter((row) => row.rating === 'high').length;

  return (
    <>
      <PageHeader
        title="MID health"
        description={
          atRisk
            ? `${atRisk} MIDs are above the 0.9% chargeback ratio the card schemes monitor. Address those first.`
            : 'Every MID is under the ratio the card schemes monitor.'
        }
        actions={
          <Select
            aria-label="Rating"
            className="w-40"
            options={[
              { value: 'all', label: 'All ratings' },
              { value: 'high', label: 'High risk' },
              { value: 'medium', label: 'Medium risk' },
              { value: 'low', label: 'Low risk' },
            ]}
          />
        }
      />
      <DataTable
        columns={columns}
        state={table}
        caption="MID health"
        exportName="mid-health"
        dense
      />
    </>
  );
}

export default MidHealth;

import { useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { Bars } from '@/components/charts/Charts';
import { DataTable } from '@/components/table/DataTable';
import { Badge, Modal, Select, StatCard } from '@/components/ui';
import { useTableState } from '@/hooks/useTableState';
import { useBrand } from '@/hooks/useBrand';
import {
  SETTLEMENT_STATE_MAP,
  settlementByAcquirer,
  settlementSummary,
  settlements,
} from '@/data/settlements';
import { ACQUIRERS, CURRENCIES, SETTLEMENT_STATES } from '@/data/reference';
import { formatCompactCurrency, formatCurrencyIn, formatDate, formatNumber } from '@/lib/format';

/**
 * Batch detail.
 *
 * Gross to net, itemised. Finance teams reconcile against this, so every
 * deduction between the two numbers is on the screen rather than implied.
 */
function SettlementDetail({ settlement, onClose }) {
  if (!settlement) return null;

  const deductions = [
    ['Processing fees', -settlement.fees],
    ['Refunds', -settlement.refunds],
    ['Chargebacks', -settlement.chargebacks],
    ['Rolling reserve', -settlement.reserve],
  ].filter(([, value]) => value !== 0);

  return (
    <Modal open onClose={onClose} title={`Settlement ${settlement.reference}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={SETTLEMENT_STATE_MAP[settlement.status]?.tone ?? 'neutral'}>
          {SETTLEMENT_STATE_MAP[settlement.status]?.label ?? settlement.status}
        </Badge>
        <Badge tone="brand">{settlement.acquirerName}</Badge>
        <Badge tone="neutral">{settlement.currency}</Badge>
        {settlement.unmatched > 0 ? (
          <Badge tone="caution">
            <AlertTriangle size={11} aria-hidden="true" />
            {settlement.unmatched} unmatched
          </Badge>
        ) : null}
      </div>

      <dl className="divide-y divide-line">
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-cf-body text-ink-muted">Merchant</dt>
          <dd className="text-cf-body font-medium text-ink">{settlement.merchantName}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-cf-body text-ink-muted">Period</dt>
          <dd className="text-cf-body font-medium text-ink">
            {formatDate(settlement.periodStart)} → {formatDate(settlement.periodEnd)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-cf-body text-ink-muted">Payout date</dt>
          <dd className="text-cf-body font-medium text-ink">{formatDate(settlement.payoutDate)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-cf-body text-ink-muted">Transactions</dt>
          <dd className="text-cf-body font-medium text-ink">
            {formatNumber(settlement.matched)} matched of {formatNumber(settlement.transactions)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-cf border border-line bg-surface-sunken p-3">
        <div className="flex justify-between py-1">
          <span className="text-cf-body text-ink-muted">Gross</span>
          <span className="tabular-nums text-cf-body font-medium text-ink">
            {formatCurrencyIn(settlement.gross, settlement.currency)}
          </span>
        </div>
        {deductions.map(([label, value]) => (
          <div key={label} className="flex justify-between py-1">
            <span className="text-cf-body text-ink-muted">{label}</span>
            <span className="tabular-nums text-cf-body text-negative">
              {formatCurrencyIn(value, settlement.currency)}
            </span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-lineStrong pt-2">
          <span className="text-cf-body font-bold text-ink">Net payout</span>
          <span className="tabular-nums text-cf-body-lg font-bold text-ink">
            {formatCurrencyIn(settlement.net, settlement.currency)}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export function Settlements() {
  const { brand } = useBrand();
  const [selected, setSelected] = useState(null);

  const state = useTableState(settlements, {
    searchKeys: ['reference', 'acquirerName', 'merchantName', 'currency'],
    initialSort: { key: 'payoutDate', direction: 'desc' },
    initialPageSize: 20,
  });

  const columns = [
    {
      key: 'payoutDate',
      header: 'Payout date',
      width: 120,
      render: (row) => <span className="tabular-nums text-ink">{formatDate(row.payoutDate)}</span>,
      value: (row) => row.payoutDate,
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => <span className="font-medium text-ink">{row.reference}</span>,
      value: (row) => row.reference,
    },
    {
      key: 'acquirerName',
      header: 'Acquirer',
      render: (row) => (
        <span className="flex flex-col">
          <span className="text-ink">{row.acquirerName}</span>
          <span className="text-[0.6875rem] text-ink-subtle">{row.merchantName}</span>
        </span>
      ),
      value: (row) => row.acquirerName,
    },
    {
      key: 'gross',
      header: 'Gross',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-ink-muted">
          {formatCurrencyIn(row.gross, row.currency)}
        </span>
      ),
      value: (row) => row.gross,
    },
    {
      key: 'net',
      header: 'Net',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums font-medium text-ink">
          {formatCurrencyIn(row.net, row.currency)}
        </span>
      ),
      value: (row) => row.net,
    },
    {
      key: 'unmatched',
      header: 'Reconciled',
      align: 'right',
      render: (row) =>
        row.unmatched > 0 ? (
          <Badge tone="caution">{row.unmatched} unmatched</Badge>
        ) : (
          <span className="text-[0.75rem] text-ink-subtle">All matched</span>
        ),
      value: (row) => row.unmatched,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={SETTLEMENT_STATE_MAP[row.status]?.tone ?? 'neutral'}>
          {SETTLEMENT_STATE_MAP[row.status]?.label ?? row.status}
        </Badge>
      ),
      value: (row) => row.status,
    },
  ];

  const toolbar = (
    <>
      <Select
        aria-label="Status"
        className="w-36"
        options={[
          { value: 'all', label: 'All statuses' },
          ...SETTLEMENT_STATES.map((s) => ({ value: s.value, label: s.label })),
        ]}
        value={state.filters.status ?? 'all'}
        onChange={(event) => state.setFilter('status', event.target.value)}
      />
      <Select
        aria-label="Acquirer"
        className="w-44"
        options={[
          { value: 'all', label: 'All acquirers' },
          ...ACQUIRERS.map((a) => ({ value: a.id, label: a.name })),
        ]}
        value={state.filters.acquirerId ?? 'all'}
        onChange={(event) => state.setFilter('acquirerId', event.target.value)}
      />
      <Select
        aria-label="Currency"
        className="w-40"
        options={[
          { value: 'all', label: 'All currencies' },
          ...CURRENCIES.map((c) => ({ value: c, label: c })),
        ]}
        value={state.filters.currency ?? 'all'}
        onChange={(event) => state.setFilter('currency', event.target.value)}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title="Settlements"
        description="Every payout across every acquirer and currency, matched back to the transactions that produced it."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Paid to date"
          value={formatCompactCurrency(settlementSummary.paidNet)}
          caption={`${settlementSummary.batches} batches`}
        />
        <StatCard
          label="Scheduled and in transit"
          value={formatCompactCurrency(settlementSummary.upcomingNet)}
          caption={
            settlementSummary.nextPayoutDate
              ? `Next payout ${formatDate(settlementSummary.nextPayoutDate)}`
              : 'No payouts scheduled'
          }
          icon={CalendarDays}
        />
        <StatCard
          label="Held"
          value={formatCompactCurrency(settlementSummary.heldNet)}
          caption="Awaiting acquirer release"
          icon={AlertTriangle}
        />
        <StatCard
          label="Unmatched transactions"
          value={formatNumber(settlementSummary.unmatched)}
          caption="Across all paid batches"
          direction="down-is-good"
        />
      </div>

      <ChartCard
        title="Net payout by acquirer"
        height={220}
        className="mb-4"
        note="Net of fees, refunds, chargebacks and reserve."
      >
        <Bars
          data={settlementByAcquirer}
          xKey="name"
          yKey="net"
          layout="horizontal"
          categoryWidth={104}
          formatY={formatCompactCurrency}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        state={state}
        caption="Settlement batches"
        exportName={`${brand.id}-settlements`}
        toolbar={toolbar}
        onRowClick={setSelected}
        emptyTitle="No settlements match those filters"
        emptyDescription="Clear the filters or pick a different payout window."
      />

      <SettlementDetail settlement={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default Settlements;

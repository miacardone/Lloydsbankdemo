import { useState } from 'react';
import { CircleCheck, CircleX, Clock, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge, Modal, Select, StatCard } from '@/components/ui';
import { useTableState } from '@/hooks/useTableState';
import { useBrand } from '@/hooks/useBrand';
import { transactions, transactionSummary } from '@/data/transactions';
import { ACQUIRERS, AUTH_RESULTS, PAYMENT_METHODS } from '@/data/reference';
import {
  formatBps,
  formatCompactCurrency,
  formatCurrencyIn,
  formatDateTime,
  formatLatency,
  formatNumber,
  formatPercent,
  maskCard,
} from '@/lib/format';

const RESULT_TONE = {
  approved: 'positive',
  recovered: 'positive',
  declined: 'negative',
  pending: 'neutral',
};

const RESULT_ICON = {
  approved: CircleCheck,
  recovered: RefreshCw,
  declined: CircleX,
  pending: Clock,
};

function ResultBadge({ result }) {
  const label = AUTH_RESULTS.find((r) => r.value === result)?.label ?? result;
  const Icon = RESULT_ICON[result];
  return (
    <Badge tone={RESULT_TONE[result]}>
      <Icon size={11} aria-hidden="true" />
      {label}
    </Badge>
  );
}

/**
 * The row detail. A merchant asking "why did this one cost more?" gets the
 * whole answer here — which acquirer, on what basis, at what rate, after how
 * many attempts — rather than a support ticket.
 */
function TransactionDetail({ transaction, onClose }) {
  if (!transaction) return null;

  const rows = [
    ['Transaction ID', transaction.id],
    ['Merchant', transaction.merchantName],
    ['Amount', formatCurrencyIn(transaction.amount, transaction.currency)],
    ['Method', transaction.methodLabel],
    [
      'Card',
      transaction.cardBrand ? `${transaction.cardBrand} ${maskCard(transaction.last4)}` : '—',
    ],
    ['BIN', transaction.bin],
    ['Acquirer', `${transaction.acquirerName} (Tier ${transaction.acquirerTier})`],
    ['Routed on', transaction.routingReasonLabel],
    ['Attempts', String(transaction.attempts)],
    ['Effective rate', formatBps(transaction.effectiveBps)],
    ['Fee', formatCurrencyIn(transaction.feeAmount, transaction.currency)],
    ['Authorization time', formatLatency(transaction.latencyMs)],
    ['3-D Secure', transaction.threeDS ? 'Applied' : 'Frictionless'],
    ['Network token', transaction.networkToken ? 'Yes' : 'No'],
    ['Processed', formatDateTime(transaction.createdAt)],
  ];

  if (transaction.declineCode) {
    rows.push([
      'Decline',
      `${transaction.declineCode} — ${transaction.declineLabel} (${transaction.declineType})`,
    ]);
  }

  return (
    <Modal open onClose={onClose} title="Transaction detail">
      <div className="mb-4 flex items-center gap-2">
        <ResultBadge result={transaction.result} />
        {transaction.attempts > 1 ? (
          <Badge tone="brand">Cleared on attempt {transaction.attempts}</Badge>
        ) : null}
      </div>
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2">
            <dt className="text-cf-body text-ink-muted">{label}</dt>
            <dd className="text-right text-cf-body font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

export function Transactions() {
  const { brand } = useBrand();
  const [selected, setSelected] = useState(null);

  const state = useTableState(transactions, {
    searchKeys: ['id', 'merchantName', 'acquirerName', 'bin', 'last4', 'methodLabel'],
    initialSort: { key: 'createdAt', direction: 'desc' },
    initialPageSize: 25,
  });

  const columns = [
    {
      key: 'createdAt',
      header: 'Processed',
      width: 160,
      render: (row) => (
        <span className="tabular-nums text-ink-muted">{formatDateTime(row.createdAt)}</span>
      ),
      value: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'merchantName',
      header: 'Merchant',
      render: (row) => <span className="font-medium text-ink">{row.merchantName}</span>,
      value: (row) => row.merchantName,
    },
    {
      key: 'methodLabel',
      header: 'Method',
      render: (row) => (
        <span className="text-ink-muted">
          {row.cardBrand ? `${row.cardBrand} ${maskCard(row.last4)}` : row.methodLabel}
        </span>
      ),
      value: (row) => row.methodLabel,
    },
    {
      key: 'acquirerName',
      header: 'Acquirer',
      render: (row) => (
        <span className="flex flex-col">
          <span className="text-ink">{row.acquirerName}</span>
          <span className="text-[0.6875rem] text-ink-subtle">{row.routingReasonLabel}</span>
        </span>
      ),
      value: (row) => row.acquirerName,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums font-medium text-ink">
          {formatCurrencyIn(row.amount, row.currency)}
        </span>
      ),
      value: (row) => row.amount,
    },
    {
      key: 'effectiveBps',
      header: 'Rate',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-ink-muted">{formatBps(row.effectiveBps)}</span>
      ),
      value: (row) => row.effectiveBps,
    },
    {
      key: 'result',
      header: 'Result',
      render: (row) => <ResultBadge result={row.result} />,
      value: (row) => row.result,
    },
  ];

  const toolbar = (
    <>
      <Select
        aria-label="Result"
        className="w-40"
        options={[
          { value: 'all', label: 'All results' },
          ...AUTH_RESULTS.map((r) => ({ value: r.value, label: r.label })),
        ]}
        value={state.filters.result ?? 'all'}
        onChange={(event) => state.setFilter('result', event.target.value)}
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
        aria-label="Payment method"
        className="w-40"
        options={[
          { value: 'all', label: 'All methods' },
          ...PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.label })),
        ]}
        value={state.filters.methodId ?? 'all'}
        onChange={(event) => state.setFilter('methodId', event.target.value)}
      />
    </>
  );

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every authorization across every acquirer, with the routing decision attached."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Processed volume"
          value={formatCompactCurrency(transactionSummary.processedVolume)}
          caption={`${formatNumber(transactionSummary.approvedCount)} approved payments`}
          delta={6.4}
        />
        <StatCard
          label="Approval rate"
          value={formatPercent(transactionSummary.approvalRate, 1)}
          caption="Including cascaded retries"
          delta={1.8}
        />
        <StatCard
          label="Blended effective rate"
          value={formatBps(transactionSummary.blendedEffectiveBps)}
          caption="Across all acquirers, all methods"
          delta={-3.2}
          direction="down-is-good"
        />
        <StatCard
          label="Recovered on retry"
          value={formatCompactCurrency(transactionSummary.recoveredVolume)}
          caption={`${formatNumber(transactionSummary.recoveredCount)} payments cleared on a second acquirer`}
          delta={11.5}
        />
      </div>

      <DataTable
        columns={columns}
        state={state}
        caption="Transactions"
        exportName={`${brand.id}-transactions`}
        toolbar={toolbar}
        onRowClick={setSelected}
        emptyTitle="No transactions match those filters"
        emptyDescription="Clear the filters or widen the date range."
      />

      <TransactionDetail transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default Transactions;

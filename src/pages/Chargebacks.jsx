import { useState } from 'react';
import { CheckCircle2, Circle, SlidersHorizontal, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { chargebacks } from '@/data/chargebacks';
import { CARD_BRANDS, CYCLES, MERCHANTS } from '@/data/reference';
import { formatCurrency, formatDate, maskCard } from '@/lib/format';

const OUTCOME_META = {
  won: { icon: CheckCircle2, tone: 'positive', label: 'Won' },
  lost: { icon: XCircle, tone: 'negative', label: 'Lost' },
  pending: { icon: Circle, tone: 'caution', label: 'In progress' },
};

function OutcomeCell({ outcome }) {
  const meta = OUTCOME_META[outcome];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon
        size={15}
        aria-hidden="true"
        className={
          meta.tone === 'positive'
            ? 'text-positive'
            : meta.tone === 'negative'
              ? 'text-negative'
              : 'text-accent'
        }
      />
      <span className="sr-only">{meta.label}</span>
    </span>
  );
}

export function Chargebacks() {
  const [selected, setSelected] = useState(null);

  const table = useTableState(chargebacks, {
    searchKeys: ['caseNumber', 'mid', 'midAlias', 'reasonCode', 'last4', 'merchantName'],
    initialSort: { key: 'postDate', direction: 'desc' },
  });

  const columns = [
    {
      key: 'outcome',
      header: 'Outcome',
      width: 84,
      align: 'center',
      render: (row) => <OutcomeCell outcome={row.outcome} />,
      value: (row) => OUTCOME_META[row.outcome].label,
    },
    {
      key: 'caseNumber',
      header: 'Case number',
      render: (row) => <span className="font-semibold text-brand">{row.caseNumber}</span>,
    },
    { key: 'cycle', header: 'Cycle' },
    { key: 'mid', header: 'MID' },
    { key: 'midAlias', header: 'MID alias' },
    {
      key: 'cardBrand',
      header: 'Card',
      render: (row) => (
        <Badge tone="info" className="normal-case tracking-normal">
          {row.cardBrand}
        </Badge>
      ),
    },
    { key: 'reasonCode', header: 'Reason' },
    { key: 'postDate', header: 'Post date', render: (row) => formatDate(row.postDate) },
    {
      key: 'disputeAmount',
      header: 'Disputed',
      align: 'right',
      render: (row) => formatCurrency(row.disputeAmount),
      value: (row) => row.disputeAmount,
    },
    { key: 'transDate', header: 'Trans. date', render: (row) => formatDate(row.transDate) },
    { key: 'bin', header: 'BIN' },
    {
      key: 'last4',
      header: 'Card',
      render: (row) => maskCard(row.last4),
      value: (row) => row.last4,
    },
  ];

  return (
    <>
      <PageHeader
        title="Chargebacks"
        description="Every dispute across your merchant accounts. Select a case to see the full history."
        actions={
          <>
            <Select
              aria-label="Merchant account"
              className="w-56"
              options={[
                { value: 'all', label: 'All merchant accounts' },
                ...MERCHANTS.map((merchant) => ({ value: merchant.id, label: merchant.name })),
              ]}
              value={table.filters.merchantId ?? 'all'}
              onChange={(event) => table.setFilter('merchantId', event.target.value)}
            />
            <Button variant="secondary" icon={SlidersHorizontal}>
              Advanced search
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        state={table}
        caption="Chargebacks"
        exportName="chargebacks"
        rowKey={(row) => row.caseNumber}
        onRowClick={setSelected}
        toolbar={
          <>
            <Select
              aria-label="Card brand"
              className="w-36"
              options={[{ value: 'all', label: 'All cards' }, ...CARD_BRANDS]}
              value={table.filters.cardBrand ?? 'all'}
              onChange={(event) => table.setFilter('cardBrand', event.target.value)}
            />
            <Select
              aria-label="Cycle"
              className="w-40"
              options={[{ value: 'all', label: 'All cycles' }, ...CYCLES]}
              value={table.filters.cycle ?? 'all'}
              onChange={(event) => table.setFilter('cycle', event.target.value)}
            />
            <Select
              aria-label="Outcome"
              className="w-36"
              options={[
                { value: 'all', label: 'All outcomes' },
                { value: 'won', label: 'Won' },
                { value: 'lost', label: 'Lost' },
                { value: 'pending', label: 'In progress' },
              ]}
              value={table.filters.outcome ?? 'all'}
              onChange={(event) => table.setFilter('outcome', event.target.value)}
            />
          </>
        }
      />

      <CaseDetail case_={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function CaseDetail({ case_, onClose }) {
  if (!case_) return null;

  const rows = [
    ['Merchant', case_.merchantName],
    ['MID', `${case_.mid} · ${case_.midAlias}`],
    ['Cycle', case_.cycle],
    ['Card brand', case_.cardBrand],
    ['Reason code', `${case_.reasonCode} — ${case_.reasonLabel}`],
    ['Category', case_.reasonCategory],
    ['Disputed amount', formatCurrency(case_.disputeAmount)],
    ['Transaction date', formatDate(case_.transDate)],
    ['Post date', formatDate(case_.postDate)],
    ['Card', `${case_.bin} · ${maskCard(case_.last4)}`],
    ['Representment filed', case_.defended ? 'Yes' : 'No'],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title={`Case ${case_.caseNumber}`}
      description={OUTCOME_META[case_.outcome].label}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button>Open full case</Button>
        </>
      }
    >
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2">
            <dt className="text-cf-body text-ink-muted">{label}</dt>
            <dd className="text-right text-cf-body font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

export default Chargebacks;

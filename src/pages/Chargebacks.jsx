import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Shield, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Field';
import {
  DeadlinePill,
  RepresentmentModal,
  SubmittedRepresentment,
} from '@/components/chargebacks/Representment';
import { useTableState } from '@/hooks/useTableState';
import { chargebacks } from '@/data/chargebacks';
import { daysUntil, responseDeadline } from '@/data/evidence';
import { TODAY } from '@/data/seed';
import { CARD_BRANDS, CYCLES, MERCHANTS } from '@/data/reference';
import { formatCurrencyIn, formatDate, maskCard } from '@/lib/format';

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

/** Where a case sits in the merchant's own workflow, as opposed to the scheme's. */
function responseState(row) {
  if (row.outcome !== 'pending') return 'closed';
  if (row.representment || row.defended) return 'submitted';
  const days = daysUntil(responseDeadline(row.postDate, row.cycle), TODAY);
  return days !== null && days < 0 ? 'expired' : 'todo';
}

const RESPONSE_META = {
  todo: { label: 'Needs a response', tone: 'caution' },
  submitted: { label: 'Evidence submitted', tone: 'positive' },
  expired: { label: 'Window closed', tone: 'negative' },
  closed: { label: 'Case closed', tone: 'neutral' },
};

export function Chargebacks() {
  const [selected, setSelected] = useState(null);
  const [defending, setDefending] = useState(null);
  /* Cases live in state so defending one is visible everywhere it should be —
     the row, the detail panel and the counter at the top. */
  const [cases, setCases] = useState(chargebacks);

  const submitRepresentment = (bundle) => {
    setCases((current) =>
      current.map((row) =>
        row.caseNumber === bundle.caseNumber
          ? { ...row, defended: true, representment: bundle }
          : row,
      ),
    );
    setSelected((current) =>
      current && current.caseNumber === bundle.caseNumber
        ? { ...current, defended: true, representment: bundle }
        : current,
    );
  };

  const withdrawRepresentment = (caseNumber) => {
    setCases((current) =>
      current.map((row) =>
        row.caseNumber === caseNumber ? { ...row, defended: false, representment: null } : row,
      ),
    );
    setSelected((current) =>
      current && current.caseNumber === caseNumber
        ? { ...current, defended: false, representment: null }
        : current,
    );
  };

  const awaiting = useMemo(
    () => cases.filter((row) => responseState(row) === 'todo').length,
    [cases],
  );

  const table = useTableState(cases, {
    searchKeys: ['caseNumber', 'mid', 'midAlias', 'reasonCode', 'last4', 'merchantName'],
    initialSort: { key: 'postDate', direction: 'desc' },
  });

  const columns = [
    {
      key: 'response',
      header: 'Response',
      width: 150,
      hint: 'Whether this case still needs evidence from you, and whether the window is still open.',
      render: (row) => {
        const meta = RESPONSE_META[responseState(row)];
        return <Badge tone={meta.tone}>{meta.label}</Badge>;
      },
      value: (row) => RESPONSE_META[responseState(row)].label,
    },
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
      render: (row) => formatCurrencyIn(row.disputeAmount, row.currency),
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
        description="Every dispute across your merchant accounts. Select a case to read it and send evidence back to the issuer."
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
          </>
        }
      />

      {awaiting > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-cf border border-caution/40 bg-accent-soft/50 px-3 py-2">
          <Shield size={15} className="text-ink-muted" aria-hidden="true" />
          <p className="text-cf-body text-ink">
            <strong className="font-semibold">{awaiting}</strong>{' '}
            {awaiting === 1 ? 'case is' : 'cases are'} still waiting on evidence from you. Open one
            to defend it.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.setFilter('outcome', 'pending')}
            className="ml-auto"
          >
            Show open cases
          </Button>
        </div>
      ) : null}

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

      <CaseDetail
        case_={defending ? null : selected}
        onClose={() => setSelected(null)}
        onDefend={() => setDefending(selected)}
        onWithdraw={() => withdrawRepresentment(selected.caseNumber)}
      />

      <RepresentmentModal
        open={Boolean(defending)}
        dispute={defending}
        /* Back to the case, not out to the list — people cancel to re-read it. */
        onClose={() => setDefending(null)}
        onSubmit={submitRepresentment}
      />
    </>
  );
}

function CaseDetail({ case_, onClose, onDefend, onWithdraw }) {
  if (!case_) return null;

  const state = responseState(case_);
  const deadline = responseDeadline(case_.postDate, case_.cycle);

  const rows = [
    ['Merchant', case_.merchantName],
    ['MID', `${case_.mid} · ${case_.midAlias}`],
    ['Cycle', case_.cycle],
    ['Card brand', case_.cardBrand],
    ['Reason code', `${case_.reasonCode} — ${case_.reasonLabel}`],
    ['Category', case_.reasonCategory],
    ['Disputed amount', formatCurrencyIn(case_.disputeAmount, case_.currency)],
    ['Transaction date', formatDate(case_.transDate)],
    ['Post date', formatDate(case_.postDate)],
    ['Respond by', formatDate(deadline)],
    ['Card', `${case_.bin} · ${maskCard(case_.last4)}`],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Case ${case_.caseNumber}`}
      description={OUTCOME_META[case_.outcome].label}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {state === 'closed' ? null : (
            <Button icon={Shield} onClick={onDefend}>
              {state === 'submitted' ? 'Revise evidence' : 'Defend this chargeback'}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {state === 'submitted' ? (
          case_.representment ? (
            <SubmittedRepresentment representment={case_.representment} onWithdraw={onWithdraw} />
          ) : (
            <p className="rounded-cf border border-positive/40 bg-positive/5 p-3 text-cf-body text-ink">
              A representment was already filed on this case. Revise the evidence to send the issuer
              more.
            </p>
          )
        ) : state === 'closed' ? (
          <p className="rounded-cf border border-line bg-surface-sunken p-3 text-cf-body text-ink-muted">
            This case is closed — the issuer decided it{' '}
            {OUTCOME_META[case_.outcome].label.toLowerCase()}. Nothing further can be submitted.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-cf border border-line bg-surface-sunken p-3">
            <p className="text-cf-body text-ink">
              No evidence sent yet. Defending it puts your case in front of the issuer.
            </p>
            <DeadlinePill dispute={case_} />
          </div>
        )}

        <dl className="divide-y divide-line">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-2">
              <dt className="text-cf-body text-ink-muted">{label}</dt>
              <dd className="text-right text-cf-body font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  );
}

export default Chargebacks;

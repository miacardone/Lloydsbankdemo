import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Check, GripVertical, Lock, Plus, Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { MultiArea } from '@/components/charts/Charts';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Modal,
  Select,
  StatCard,
  Toggle,
  Tooltip,
} from '@/components/ui';
import {
  acquirerHealth,
  cascadeLadder,
  recoveryTrend,
  routingRules,
  ROUTING_BASES,
} from '@/data/routing';
import { acquirerPerformance, transactionSummary } from '@/data/transactions';
import { ACQUIRERS, CURRENCIES, PAYMENT_METHODS, REGIONS } from '@/data/reference';
import { useReorder } from '@/hooks/useReorder';
import { evaluateRouting, RULE_FIELDS, RULE_OPERATORS } from '@/lib/routingEngine';
import { cn } from '@/lib/cn';
import {
  formatBps,
  formatCompactCurrency,
  formatLatency,
  formatNumber,
  formatPercent,
  formatShortDate,
} from '@/lib/format';

const acquirerName = (id) => ACQUIRERS.find((a) => a.id === id)?.name ?? id;

const HEALTH_TONE = { healthy: 'positive', degraded: 'caution', down: 'negative' };

/* This table is hand-rolled rather than a DataTable, so its headers carry their
   own definitions instead of inheriting the glossary lookup. */
const ACQUIRER_COLUMNS = [
  {
    header: 'Acquirer',
    hint: 'The institution that holds the merchant account and settles funds.',
  },
  { header: 'Status', hint: 'Connection uptime over the last 30 days.' },
  { header: 'Share', align: 'right', hint: 'Share of your transactions this acquirer took.' },
  { header: 'Volume', align: 'right', hint: 'Approved value routed through this acquirer.' },
  { header: 'Approval', align: 'right', hint: 'Share of attempts this acquirer got approved.' },
  {
    header: 'Effective rate',
    align: 'right',
    hint: 'Blended cost of acceptance — interchange, scheme fees and acquirer margin, in basis points.',
  },
  {
    header: 'Latency',
    align: 'right',
    hint: 'Time from the first attempt to the scheme’s response.',
  },
];

/**
 * The cascade ladder.
 *
 * This is the screen's argument: a soft decline is not a lost sale until the
 * last rung. Each step is drawn as a proportion of the traffic that reached it,
 * so the shrinking bars carry the meaning rather than a table of percentages.
 */
function CascadeLadder() {
  const totalCleared = cascadeLadder.reduce((sum, step) => sum + step.cleared, 0);

  return (
    <Card>
      <CardHeader
        title="Cascade ladder"
        description="What happens to a payment after the first acquirer says no."
        actions={<Badge tone="positive">{formatPercent(totalCleared, 1)} cleared overall</Badge>}
      />

      <ol className="space-y-1">
        {cascadeLadder.map((step, index) => (
          <li key={step.step}>
            <div className="flex items-center gap-3 rounded-cf border border-line bg-surface-sunken p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[0.75rem] font-bold text-brand-contrast">
                {step.step}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-cf-body font-semibold text-ink">{step.label}</p>
                  <p className="text-[0.75rem] text-ink-subtle">{acquirerName(step.acquirerId)}</p>
                </div>

                {/* Track = traffic reaching this rung. Fill = traffic that cleared here. */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand-light"
                    style={{ width: `${step.reached}%` }}
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(step.cleared / step.reached) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="mt-1.5 text-[0.75rem] text-ink-subtle">
                  {formatPercent(step.reached, 1)} of traffic reached this step ·{' '}
                  <span className="font-semibold text-positive">
                    {formatPercent(step.cleared, 1)} cleared
                  </span>
                </p>
              </div>
            </div>

            {index < cascadeLadder.length - 1 ? (
              <div className="flex justify-center py-0.5 text-ink-subtle">
                <Tooltip label="Whatever this step did not clear falls through to the next one">
                  <span tabIndex={0} className="cursor-help">
                    <ArrowDown size={14} aria-hidden="true" />
                  </span>
                </Tooltip>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** One rule in the ladder. Order is meaningful, so the handle and number stay visible. */
function RuleRow({
  rule,
  priority,
  enabled,
  onToggle,
  slotProps,
  handleProps,
  dragging,
  dropSide,
  onMoveBy,
}) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-start gap-3 border-b border-line p-3 transition last:border-b-0',
        !enabled && 'opacity-55',
        dragging && 'opacity-40',
        dropSide === 'before' && 'shadow-[inset_0_2px_0_0_var(--cf-brand-hex)]',
        dropSide === 'after' && 'shadow-[inset_0_-2px_0_0_var(--cf-brand-hex)]',
      )}
      {...slotProps}
    >
      <span className="flex items-center gap-2 pt-0.5 text-ink-subtle">
        {rule.locked ? (
          <Lock size={14} aria-label="Fixed position" />
        ) : (
          <button
            type="button"
            aria-label={`Reorder ${rule.name}. Use alt and the up or down arrow keys.`}
            {...handleProps}
            onKeyDown={(event) => {
              if (!event.altKey) return;
              if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                onMoveBy?.(event.key === 'ArrowUp' ? -1 : 1);
              }
            }}
            className="cursor-grab rounded-cf p-0.5 text-ink-subtle transition hover:bg-surface-sunken hover:text-ink active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <GripVertical size={14} aria-hidden="true" />
          </button>
        )}
        <span className="w-4 text-center text-[0.75rem] font-bold tabular-nums text-ink-subtle">
          {priority}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-cf-body font-semibold text-ink">{rule.name}</p>
          {rule.locked ? <Badge tone="neutral">Always last</Badge> : null}
        </div>

        <p className="mt-1 text-[0.75rem] text-ink-muted">
          {rule.conditions
            .map((c) => [c.field, c.operator, c.value].filter(Boolean).join(' '))
            .join(' · ')}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="brand">{acquirerName(rule.primary)}</Badge>
          {rule.fallbacks.map((fallback) => (
            <span key={fallback} className="flex items-center gap-1.5">
              <span className="text-ink-subtle" aria-hidden="true">
                →
              </span>
              <Badge tone="neutral">{acquirerName(fallback)}</Badge>
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 pt-0.5">
        <div className="text-right">
          <p className="text-[0.75rem] tabular-nums font-semibold text-ink">
            {rule.matched ? formatNumber(rule.matched) : '—'}
          </p>
          <p className="text-[0.6875rem] text-ink-subtle">matched</p>
        </div>
        <div className="text-right">
          <p className="text-[0.75rem] tabular-nums font-semibold text-ink">
            {rule.approvalRate ? formatPercent(rule.approvalRate, 1) : '—'}
          </p>
          <p className="text-[0.6875rem] text-ink-subtle">approved</p>
        </div>
        <Toggle
          checked={enabled}
          onChange={onToggle}
          disabled={rule.locked}
          srLabel={`Enable rule: ${rule.name}`}
        />
      </div>
    </li>
  );
}

const BLANK_RULE = {
  name: '',
  field: 'Amount',
  operator: 'is above',
  value: '',
  primary: ACQUIRERS[0].id,
  fallback: ACQUIRERS[1].id,
  basis: 'least-cost',
};

/** Build a rule from the form. Kept out of the component so it stays testable. */
function draftToRule(draft, index) {
  return {
    id: `rule_local_${index}`,
    priority: 0,
    name: draft.name.trim() || 'Untitled rule',
    enabled: true,
    conditions: [{ field: draft.field, operator: draft.operator, value: draft.value.trim() }],
    primary: draft.primary,
    fallbacks: draft.fallback && draft.fallback !== draft.primary ? [draft.fallback] : [],
    basis: draft.basis,
    matched: 0,
    approvalRate: 0,
    locked: false,
  };
}

function AddRuleModal({ open, onClose, onAdd }) {
  const [draft, setDraft] = useState(BLANK_RULE);
  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const submit = (event) => {
    event.preventDefault();
    onAdd(draft);
    setDraft(BLANK_RULE);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add routing rule"
      description="New rules land directly above the default route. Drag them higher once they exist."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-rule-form" icon={Plus}>
            Add rule
          </Button>
        </>
      }
    >
      <form id="add-rule-form" onSubmit={submit} className="space-y-4">
        <Input
          label="Rule name"
          value={draft.name}
          onChange={(event) => set({ name: event.target.value })}
          placeholder="High-value US cards"
          required
        />

        <fieldset className="space-y-1.5">
          <legend className="text-cf-label uppercase text-ink-muted">Condition</legend>
          <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr]">
            <Select
              aria-label="Field"
              options={RULE_FIELDS}
              value={draft.field}
              onChange={(event) => set({ field: event.target.value })}
            />
            <Select
              aria-label="Operator"
              options={RULE_OPERATORS}
              value={draft.operator}
              onChange={(event) => set({ operator: event.target.value })}
            />
            <Input
              aria-label="Value"
              value={draft.value}
              onChange={(event) => set({ value: event.target.value })}
              placeholder="500.00"
            />
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Primary acquirer"
            options={ACQUIRERS.map((acquirer) => ({ value: acquirer.id, label: acquirer.name }))}
            value={draft.primary}
            onChange={(event) => set({ primary: event.target.value })}
          />
          <Select
            label="Fallback acquirer"
            options={[
              { value: '', label: 'None' },
              ...ACQUIRERS.map((acquirer) => ({ value: acquirer.id, label: acquirer.name })),
            ]}
            value={draft.fallback}
            onChange={(event) => set({ fallback: event.target.value })}
          />
        </div>

        <Select
          label="Routing basis"
          options={ROUTING_BASES.map((basis) => ({ value: basis.value, label: basis.label }))}
          value={draft.basis}
          onChange={(event) => set({ basis: event.target.value })}
          hint={ROUTING_BASES.find((basis) => basis.value === draft.basis)?.hint}
        />
      </form>
    </Modal>
  );
}

const BLANK_PAYMENT = {
  amount: '750',
  currency: CURRENCIES[0],
  country: 'United States',
  region: REGIONS[0],
  method: PAYMENT_METHODS[0].label,
  transactionType: 'One-off',
  networkToken: false,
  mcc: '5812',
};

/**
 * Runs a hypothetical payment down the live rule ladder.
 *
 * The value is in the misses as much as the hit: showing which rules were
 * stepped over, and on which condition, is how someone debugs a rule that
 * "should have matched".
 */
function TestPaymentModal({ open, onClose, rules, enabled }) {
  const [payment, setPayment] = useState(BLANK_PAYMENT);
  const [result, setResult] = useState(null);
  const set = (patch) => {
    setPayment((current) => ({ ...current, ...patch }));
    setResult(null);
  };

  const run = (event) => {
    event.preventDefault();
    setResult(evaluateRouting(rules, { ...payment, amount: Number(payment.amount) || 0 }, enabled));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Test a payment"
      description="Send a hypothetical payment down the ladder and see which rule claims it."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" form="test-payment-form" icon={Zap}>
            Run test
          </Button>
        </>
      }
    >
      <form id="test-payment-form" onSubmit={run} className="grid gap-3 sm:grid-cols-3">
        <Input
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          value={payment.amount}
          onChange={(event) => set({ amount: event.target.value })}
        />
        <Select
          label="Currency"
          options={CURRENCIES}
          value={payment.currency}
          onChange={(event) => set({ currency: event.target.value })}
        />
        <Select
          label="Issuer region"
          options={REGIONS}
          value={payment.region}
          onChange={(event) => set({ region: event.target.value })}
        />
        <Input
          label="Issuer country"
          value={payment.country}
          onChange={(event) => set({ country: event.target.value })}
        />
        <Select
          label="Payment method"
          options={PAYMENT_METHODS.map((method) => method.label)}
          value={payment.method}
          onChange={(event) => set({ method: event.target.value })}
        />
        <Select
          label="Transaction type"
          options={['One-off', 'Recurring']}
          value={payment.transactionType}
          onChange={(event) => set({ transactionType: event.target.value })}
        />
        <Input
          label="MCC"
          value={payment.mcc}
          onChange={(event) => set({ mcc: event.target.value })}
        />
        <Select
          label="Network token"
          options={['Absent', 'Present']}
          value={payment.networkToken ? 'Present' : 'Absent'}
          onChange={(event) => set({ networkToken: event.target.value === 'Present' })}
        />
      </form>

      {result ? (
        <div className="mt-4 border-t border-line pt-4">
          {result.rule ? (
            <div className="rounded-cf border border-brand/40 bg-brand-lightest/60 p-3">
              <p className="flex items-center gap-2 text-cf-body font-semibold text-ink">
                <Check size={15} className="text-brand" aria-hidden="true" />
                Matched “{result.rule.name}”
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge tone="brand">{acquirerName(result.rule.primary)}</Badge>
                {result.rule.fallbacks.map((fallback) => (
                  <span key={fallback} className="flex items-center gap-1.5">
                    <ArrowRight size={12} className="text-ink-subtle" aria-hidden="true" />
                    <Badge tone="neutral">{acquirerName(fallback)}</Badge>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[0.75rem] text-ink-muted">
                Routed on{' '}
                {ROUTING_BASES.find((basis) => basis.value === result.rule.basis)?.label ??
                  result.rule.basis}
                {result.rule.fallbacks.length
                  ? ` · cascades to ${result.rule.fallbacks.length} fallback${
                      result.rule.fallbacks.length > 1 ? 's' : ''
                    } on a soft decline`
                  : ' · no fallback configured'}
              </p>
            </div>
          ) : (
            <p className="rounded-cf border border-caution/40 bg-surface-sunken p-3 text-cf-body text-ink">
              Nothing claimed this payment — every rule was skipped, including the default route.
            </p>
          )}

          {result.skipped.length ? (
            <>
              <p className="mb-1 mt-3 text-cf-label uppercase text-ink-muted">
                Stepped over on the way
              </p>
              <ul className="space-y-1">
                {result.skipped.map(({ rule, reason, condition }) => (
                  <li key={rule.id} className="flex flex-wrap gap-2 text-[0.75rem] text-ink-muted">
                    <span className="font-semibold text-ink">{rule.name}</span>
                    <span>
                      {reason === 'disabled'
                        ? 'rule is turned off'
                        : `failed on ${[condition?.field, condition?.operator, condition?.value]
                            .filter(Boolean)
                            .join(' ')}`}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

export function Routing() {
  /* Local only — a demo should let people click without pretending to persist. */
  const [rules, setRules] = useState(routingRules);
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(routingRules.map((rule) => [rule.id, rule.enabled])),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const ruleIds = useMemo(() => rules.map((rule) => rule.id), [rules]);
  const lockedIds = useMemo(
    () => rules.filter((rule) => rule.locked).map((rule) => rule.id),
    [rules],
  );
  const { order, dragKey, target, slotProps, handleProps, moveBy } = useReorder(ruleIds, {
    locked: lockedIds,
  });

  /* The ladder as it currently reads, top to bottom — this is what both the
     list and the payment tester evaluate against. */
  const orderedRules = useMemo(() => {
    const byId = new Map(rules.map((rule) => [rule.id, rule]));
    return order.map((id) => byId.get(id)).filter(Boolean);
  }, [rules, order]);

  const toggle = (id) => setEnabled((current) => ({ ...current, [id]: !current[id] }));

  const addRule = (draft) => {
    const rule = draftToRule(draft, rules.length);
    /* Above the default route, never below it — the ladder needs a terminal rule. */
    setRules((current) => {
      const lastIndex = current.findIndex((item) => item.locked);
      const at = lastIndex === -1 ? current.length : lastIndex;
      return [...current.slice(0, at), rule, ...current.slice(at)];
    });
    setEnabled((current) => ({ ...current, [rule.id]: true }));
  };

  const activeCount = Object.values(enabled).filter(Boolean).length;
  const healthy = acquirerHealth.filter((a) => a.status === 'healthy').length;

  return (
    <>
      <PageHeader
        title="Smart routing"
        description="Rules run top to bottom and stop at the first match. Everything that falls through takes the default route."
        actions={
          <>
            <Button variant="secondary" icon={Zap} onClick={() => setTestOpen(true)}>
              Test a payment
            </Button>
            <Button icon={Plus} onClick={() => setAddOpen(true)}>
              Add rule
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active rules"
          value={String(activeCount)}
          caption={`of ${rules.length} configured`}
        />
        <StatCard
          label="Acquirers connected"
          value={String(ACQUIRERS.length)}
          caption={`${healthy} healthy right now`}
        />
        <StatCard
          label="Recovered by cascading"
          value={formatCompactCurrency(transactionSummary.recoveredVolume)}
          caption="Would have been lost at authorization"
          delta={11.5}
        />
        <StatCard
          label="Median auth time"
          value={formatLatency(transactionSummary.avgLatencyMs)}
          caption="First attempt to scheme response"
          delta={-4.1}
          direction="down-is-good"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card padded={false}>
          <div className="p-4 pb-2">
            <CardHeader
              title="Routing rules"
              description="Drag to reorder. The default route cannot be moved or removed."
              className="pb-0"
            />
          </div>
          <ul>
            {orderedRules.map((rule, index) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                priority={index + 1}
                enabled={enabled[rule.id]}
                onToggle={() => toggle(rule.id)}
                slotProps={slotProps(rule.id)}
                handleProps={handleProps(rule.id)}
                dragging={dragKey === rule.id}
                dropSide={target?.key === rule.id && dragKey !== rule.id ? target.side : null}
                onMoveBy={(delta) => moveBy(rule.id, delta)}
              />
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <CascadeLadder />

          <ChartCard
            title="Decline recovery, last 30 days"
            height={200}
            note="Green is value recovered on a second acquirer. Grey is what no rung caught."
          >
            <MultiArea
              data={recoveryTrend}
              xKey="date"
              keys={['recovered', 'lost']}
              formatX={formatShortDate}
              stacked
            />
          </ChartCard>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Acquirer network"
          description="Live status, cost and approval rate for every connection on your account."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-y border-line bg-surface-sunken text-cf-label uppercase text-ink-subtle">
                {ACQUIRER_COLUMNS.map((column) => (
                  <th
                    key={column.header}
                    className={cn('px-3 py-2 font-bold', column.align === 'right' && 'text-right')}
                  >
                    <Tooltip label={column.hint}>
                      <span
                        tabIndex={0}
                        className="cursor-help underline decoration-dotted underline-offset-2"
                      >
                        {column.header}
                      </span>
                    </Tooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {acquirerPerformance.map((acquirer) => {
                const health = acquirerHealth.find((a) => a.id === acquirer.id);
                return (
                  <tr key={acquirer.id} className="border-b border-line last:border-b-0">
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-ink">{acquirer.name}</span>
                      <span className="ml-2 text-[0.6875rem] text-ink-subtle">
                        {acquirer.region} · Tier {acquirer.tier}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={HEALTH_TONE[health?.status] ?? 'neutral'} dot>
                        {formatPercent(health?.uptime ?? 0, 2)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">
                      {formatPercent(acquirer.share, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                      {formatCompactCurrency(acquirer.volume)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                      {formatPercent(acquirer.approvalRate, 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">
                      {formatBps(acquirer.effectiveBps)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">
                      {formatLatency(acquirer.avgLatencyMs)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AddRuleModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addRule} />
      <TestPaymentModal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        rules={orderedRules}
        enabled={enabled}
      />
    </>
  );
}

export default Routing;

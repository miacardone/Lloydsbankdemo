import { useState } from 'react';
import { ArrowDown, GripVertical, Lock, Plus, Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/charts/ChartCard';
import { MultiArea } from '@/components/charts/Charts';
import { Badge, Button, Card, CardHeader, StatCard, Toggle } from '@/components/ui';
import { acquirerHealth, cascadeLadder, recoveryTrend, routingRules } from '@/data/routing';
import { acquirerPerformance, transactionSummary } from '@/data/transactions';
import { ACQUIRERS } from '@/data/reference';
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
                <ArrowDown size={14} aria-hidden="true" />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** One rule in the ladder. Order is meaningful, so the handle and number stay visible. */
function RuleRow({ rule, enabled, onToggle }) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-start gap-3 border-b border-line p-3 last:border-b-0',
        !enabled && 'opacity-55',
      )}
    >
      <span className="flex items-center gap-2 pt-0.5 text-ink-subtle">
        {rule.locked ? (
          <Lock size={14} aria-label="Fixed position" />
        ) : (
          <GripVertical size={14} aria-hidden="true" className="cursor-grab" />
        )}
        <span className="w-4 text-center text-[0.75rem] font-bold tabular-nums text-ink-subtle">
          {rule.priority}
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

export function Routing() {
  /* Local only — a demo should let people click without pretending to persist. */
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(routingRules.map((rule) => [rule.id, rule.enabled])),
  );

  const toggle = (id) => setEnabled((current) => ({ ...current, [id]: !current[id] }));

  const activeCount = Object.values(enabled).filter(Boolean).length;
  const healthy = acquirerHealth.filter((a) => a.status === 'healthy').length;

  return (
    <>
      <PageHeader
        title="Smart routing"
        description="Rules run top to bottom and stop at the first match. Everything that falls through takes the default route."
        actions={
          <>
            <Button variant="secondary" icon={Zap}>
              Test a payment
            </Button>
            <Button icon={Plus}>Add rule</Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active rules"
          value={String(activeCount)}
          caption={`of ${routingRules.length} configured`}
        />
        <StatCard
          label="Acquirers connected"
          value={String(ACQUIRERS.length)}
          caption={`${healthy} healthy right now`}
        />
        <StatCard
          label="Recovered by cascading"
          value={formatCompactCurrency(transactionSummary.recoveredVolume)}
          caption="Would have been lost at authorisation"
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
            {routingRules.map((rule) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                enabled={enabled[rule.id]}
                onToggle={() => toggle(rule.id)}
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
                <th className="px-3 py-2 font-bold">Acquirer</th>
                <th className="px-3 py-2 font-bold">Status</th>
                <th className="px-3 py-2 text-right font-bold">Share</th>
                <th className="px-3 py-2 text-right font-bold">Volume</th>
                <th className="px-3 py-2 text-right font-bold">Approval</th>
                <th className="px-3 py-2 text-right font-bold">Effective rate</th>
                <th className="px-3 py-2 text-right font-bold">Latency</th>
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
    </>
  );
}

export default Routing;

import { useState } from 'react';
import { Plus, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Toggle } from '@/components/ui/Field';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/components/ui/Toast';
import { useTableState } from '@/hooks/useTableState';
import { alertKpis, alerts, autoRefundRules } from '@/data/alerts';
import { ALERT_OUTCOMES, ALERT_SOURCES } from '@/data/reference';
import { formatCurrency, formatDate, formatNumber, formatPercent, maskCard } from '@/lib/format';

const STATUS_TONE = { resolved: 'positive', open: 'caution', expired: 'neutral' };
const STATUS_LABEL = { resolved: 'Resolved', open: 'Open', expired: 'Expired' };

export function Alerts() {
  const { notify } = useToast();
  const [rules, setRules] = useState(autoRefundRules);
  const [rulesOpen, setRulesOpen] = useState(false);

  const addRule = (draft) => {
    const rule = {
      id: `rule-${rules.length + 1}`,
      name: draft.name.trim() || `${draft.when} ${draft.value}`.trim(),
      criteria: `${draft.when} ${draft.value}`.trim(),
      action: draft.action,
      enabled: true,
      matchedLast30: 0,
    };
    setRules((current) => [...current, rule]);
    notify(`Rule "${rule.name}" is live — matching alerts are actioned automatically.`);
  };

  const table = useTableState(alerts, {
    searchKeys: ['alertId', 'orderId', 'last4', 'mid', 'merchantName'],
    initialSort: { key: 'alertDate', direction: 'desc' },
  });

  const columns = [
    {
      key: 'status',
      header: 'Status',
      width: 110,
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status]} dot>
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
      value: (row) => STATUS_LABEL[row.status],
    },
    { key: 'alertId', header: 'Alert ID' },
    { key: 'source', header: 'Source' },
    { key: 'orderId', header: 'Order ID' },
    {
      key: 'transAmount',
      header: 'Amount',
      align: 'right',
      render: (row) => formatCurrency(row.transAmount),
      value: (row) => row.transAmount,
    },
    { key: 'transDate', header: 'Trans. date', render: (row) => formatDate(row.transDate) },
    { key: 'cardBrand', header: 'Card' },
    {
      key: 'last4',
      header: 'Card no.',
      render: (row) => maskCard(row.last4),
      value: (row) => row.last4,
    },
    { key: 'midGroup', header: 'MID group' },
    { key: 'alertDate', header: 'Alert date', render: (row) => formatDate(row.alertDate) },
    { key: 'expirationDate', header: 'Expires', render: (row) => formatDate(row.expirationDate) },
    { key: 'outcome', header: 'Outcome' },
    { key: 'completedBy', header: 'Completed by' },
  ];

  const openCount = alerts.filter((alert) => alert.status === 'open').length;
  const autoResolved = rules
    .filter((rule) => rule.enabled)
    .reduce((sum, rule) => sum + rule.matchedLast30, 0);

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Pre-dispute notifications from the card networks. Resolve one and the chargeback never posts."
        actions={
          <Button icon={Wand2} variant="secondary" onClick={() => setRulesOpen(true)}>
            Auto-refund rules
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open alerts"
          value={formatNumber(openCount)}
          caption="Waiting on a decision"
          icon={undefined}
        />
        <StatCard
          label="Alerts by transaction"
          value={formatPercent(alertKpis.alertsPerTransactionRate, 1)}
          caption={`${formatNumber(alertKpis.totalRequests)} requests on ${formatNumber(
            alertKpis.totalTransactions,
          )} transactions`}
        />
        <StatCard
          label="Refunded"
          value={formatPercent(alertKpis.refundedShare, 0)}
          caption="Share of resolved alerts"
          delta={6}
        />
        <StatCard
          label="Auto-resolved"
          value={formatNumber(autoResolved)}
          caption="Last 30 days, by rule"
          delta={12}
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          state={table}
          caption="Alerts"
          exportName="alerts"
          rowKey={(row) => row.alertId}
          toolbar={
            <>
              <Select
                aria-label="Source"
                className="w-44"
                options={[{ value: 'all', label: 'All sources' }, ...ALERT_SOURCES]}
                value={table.filters.source ?? 'all'}
                onChange={(event) => table.setFilter('source', event.target.value)}
              />
              <Select
                aria-label="Outcome"
                className="w-48"
                options={[{ value: 'all', label: 'All outcomes' }, ...ALERT_OUTCOMES]}
                value={table.filters.outcome ?? 'all'}
                onChange={(event) => table.setFilter('outcome', event.target.value)}
              />
            </>
          }
        />
      </div>

      <AutoRefundRules
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        rules={rules}
        onAdd={addRule}
        onToggle={(id) =>
          setRules((current) =>
            current.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)),
          )
        }
      />
    </>
  );
}

const BLANK_AUTO_RULE = { name: '', when: 'Amount is under', value: '', action: 'Refund' };

function AutoRefundRules({ open, onClose, rules, onAdd, onToggle }) {
  const [draft, setDraft] = useState(BLANK_AUTO_RULE);
  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const ready = draft.value.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Auto-refund rules"
      description="Alerts that match a rule are resolved without an analyst touching them."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            icon={Plus}
            disabled={!ready}
            onClick={() => {
              onAdd(draft);
              setDraft(BLANK_AUTO_RULE);
            }}
          >
            Add rule
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} rule={false} className="border-line">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-cf-body font-bold text-ink">{rule.name}</p>
                <p className="mt-0.5 text-cf-body text-ink-muted">{rule.criteria}</p>
                <p className="mt-1 text-[0.75rem] text-ink-subtle">
                  {rule.action} · matched {rule.matchedLast30} alerts in the last 30 days
                </p>
              </div>
              <Toggle
                checked={rule.enabled}
                onChange={() => onToggle(rule.id)}
                label={rule.enabled ? 'On' : 'Off'}
              />
            </div>
          </Card>
        ))}

        <Card rule={false} className="border-dashed">
          <CardHeader
            title="New rule"
            description="Alerts matching all of these are actioned automatically."
          />
          <Input
            label="Rule name"
            placeholder="Low-value instant refund"
            value={draft.name}
            onChange={(event) => set({ name: event.target.value })}
            className="mb-3"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="When"
              options={['Amount is under', 'Amount is over', 'Card type is', 'Descriptor contains']}
              value={draft.when}
              onChange={(event) => set({ when: event.target.value })}
            />
            <Input
              label="Value"
              placeholder="75.00"
              value={draft.value}
              onChange={(event) => set({ value: event.target.value })}
            />
            <Select
              label="Then"
              options={['Refund', 'Route to analyst', 'Ignore']}
              value={draft.action}
              onChange={(event) => set({ action: event.target.value })}
            />
          </div>
        </Card>
      </div>
    </Modal>
  );
}

export default Alerts;

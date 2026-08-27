import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge, RiskDot } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { MERCHANTS } from '@/data/reference';
import { combinedMonitoring, monitoringSummary } from '@/data/merchants';
import { formatNumber } from '@/lib/format';

const RATING_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
const RATING_TONE = { low: 'positive', medium: 'caution', high: 'negative' };

export function Monitoring() {
  const [summaryOpen, setSummaryOpen] = useState(true);

  const table = useTableState(combinedMonitoring, {
    searchKeys: ['merchantName', 'month'],
    initialSort: { key: 'month', direction: 'desc' },
    initialPageSize: 25,
  });

  const columns = [
    { key: 'month', header: 'Reporting month' },
    { key: 'merchantName', header: 'Merchant' },
    {
      key: 'complaintRisk',
      header: 'Complaint risk',
      render: (row) => (
        <Badge tone={RATING_TONE[row.complaintRisk]}>{RATING_LABEL[row.complaintRisk]}</Badge>
      ),
      value: (row) => row.complaintRisk,
    },
    {
      key: 'fulfillmentRisk',
      header: 'Fulfillment risk',
      render: (row) => (
        <Badge tone={RATING_TONE[row.fulfillmentRisk]}>{RATING_LABEL[row.fulfillmentRisk]}</Badge>
      ),
      value: (row) => row.fulfillmentRisk,
    },
    {
      key: 'midHealthRisk',
      header: 'MID health risk',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          <RiskDot level={row.midHealthRisk} />
          <span>{RATING_LABEL[row.midHealthRisk]}</span>
        </span>
      ),
      value: (row) => row.midHealthRisk,
    },
    {
      key: 'complaints',
      header: 'Complaints',
      align: 'right',
      render: (row) => formatNumber(row.complaints),
      value: (row) => row.complaints,
    },
    {
      key: 'rating',
      header: 'Avg. rating',
      align: 'right',
      render: (row) => row.rating.toFixed(1),
      value: (row) => row.rating,
    },
  ];

  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Complaint volume, fulfillment signals and MID health rolled into one view per merchant, per month."
        actions={
          <>
            <Select
              aria-label="Merchant account"
              className="w-52"
              options={[
                { value: 'all', label: 'All merchant accounts' },
                ...MERCHANTS.map((merchant) => ({ value: merchant.name, label: merchant.name })),
              ]}
              value={table.filters.merchantName ?? 'all'}
              onChange={(event) => table.setFilter('merchantName', event.target.value)}
            />
            <Button
              variant="secondary"
              icon={Sparkles}
              onClick={() => setSummaryOpen((value) => !value)}
            >
              {summaryOpen ? 'Hide summary' : 'Show summary'}
            </Button>
          </>
        }
      />

      {summaryOpen ? (
        <Card className="mb-4">
          <div className="flex items-start gap-3">
            <span
              title="Written from this window's complaint, fulfillment and MID health figures"
              className="mt-0.5 flex h-8 w-8 shrink-0 cursor-help items-center justify-center rounded-full bg-accent-soft text-accent"
            >
              <Sparkles size={16} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-cf-body font-bold text-ink">Risk and performance summary</h2>
              <p className="mt-1 max-w-3xl text-cf-body text-ink-muted">{monitoringSummary}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <DataTable
        columns={columns}
        state={table}
        caption="Combined monitoring reports"
        exportName="monitoring"
        dense
      />
    </>
  );
}

export default Monitoring;

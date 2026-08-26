import { useState } from 'react';
import { Check, Eye, MessageSquare, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTableState } from '@/hooks/useTableState';
import { ertNotices } from '@/data/ert';
import { ERT_LEVELS, ERT_TYPES } from '@/data/reference';
import { formatDate } from '@/lib/format';

const LEVEL_TONE = { notice: 'info', warning: 'caution', urgent: 'negative' };
const STATUS_TONE = { resolved: 'positive', viewed: 'neutral', new: 'brand' };
const STATUS_LABEL = { resolved: 'Resolved', viewed: 'Viewed', new: 'New' };

export function RiskNotices() {
  const [tab, setTab] = useState('open');
  const [selected, setSelected] = useState(null);
  /* Local copy so resolving a notice moves it between tabs. Nothing persists —
     a refresh puts the demo back where it started, on purpose. */
  const [notices, setNotices] = useState(ertNotices);

  const resolve = (id) =>
    setNotices((current) =>
      current.map((notice) => (notice.id === id ? { ...notice, status: 'resolved' } : notice)),
    );

  const filtered = notices.filter((notice) =>
    tab === 'all'
      ? true
      : tab === 'open'
        ? notice.status !== 'resolved'
        : notice.status === 'resolved',
  );

  const table = useTableState(filtered, {
    searchKeys: ['merchantName', 'content', 'typeLabel'],
    initialSort: { key: 'addedAt', direction: 'desc' },
    initialPageSize: 25,
  });

  const columns = [
    { key: 'id', header: 'ID', width: 72 },
    { key: 'merchantName', header: 'Merchant' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
      value: (row) => STATUS_LABEL[row.status],
    },
    {
      key: 'level',
      header: 'Level',
      render: (row) => (
        <Badge tone={LEVEL_TONE[row.level]} dot>
          {ERT_LEVELS.find((level) => level.value === row.level)?.label}
        </Badge>
      ),
      value: (row) => row.level,
    },
    { key: 'typeLabel', header: 'Type' },
    {
      key: 'content',
      header: 'What we found',
      width: '38%',
      sortable: false,
      render: (row) => <span className="line-clamp-2 text-ink-muted">{row.content}</span>,
      value: (row) => row.content,
    },
    { key: 'addedAt', header: 'Raised', render: (row) => formatDate(row.addedAt) },
    {
      key: 'assignee',
      header: 'Assigned to',
      render: (row) => row.assignee ?? <span className="text-ink-subtle">Unassigned</span>,
      value: (row) => row.assignee ?? '',
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton
            icon={Eye}
            label={`Open notice ${row.id}`}
            onClick={(event) => {
              event.stopPropagation();
              setSelected(row);
            }}
          />
          <IconButton icon={MessageSquare} label={`Comment on notice ${row.id}`} />
          <IconButton icon={UserPlus} label={`Assign notice ${row.id}`} />
        </div>
      ),
      value: () => '',
    },
  ];

  const counts = {
    open: ertNotices.filter((notice) => notice.status !== 'resolved').length,
    resolved: ertNotices.filter((notice) => notice.status === 'resolved').length,
    all: ertNotices.length,
  };

  return (
    <>
      <PageHeader
        title="Risk notices"
        description="Problems we spotted in your account before they turned into disputes. Each one names the fix."
        actions={
          <Select
            aria-label="Notice type"
            className="w-52"
            options={[{ value: 'all', label: 'All types' }, ...ERT_TYPES]}
            value={table.filters.type ?? 'all'}
            onChange={(event) => table.setFilter('type', event.target.value)}
          />
        }
      >
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'open', label: 'Needs attention', count: counts.open },
            { value: 'resolved', label: 'Resolved', count: counts.resolved },
            { value: 'all', label: 'All', count: counts.all },
          ]}
        />
      </PageHeader>

      <DataTable
        columns={columns}
        state={table}
        caption="Risk notices"
        exportName="risk-notices"
        onRowClick={setSelected}
        emptyTitle="No notices here"
        emptyDescription="Nothing on this account needs attention right now."
      />

      <NoticeDetail notice={selected} onClose={() => setSelected(null)} onResolve={resolve} />
    </>
  );
}

function NoticeDetail({ notice, onClose, onResolve }) {
  if (!notice) return null;

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={`${notice.typeLabel} · ${notice.merchantName}`}
      description={`Raised ${formatDate(notice.addedAt)} by ${notice.createdBy}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            icon={Check}
            disabled={notice.status === 'resolved'}
            onClick={() => {
              onResolve?.(notice.id);
              onClose();
            }}
          >
            {notice.status === 'resolved' ? 'Already resolved' : 'Mark resolved'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Badge tone={LEVEL_TONE[notice.level]} dot>
            {ERT_LEVELS.find((level) => level.value === notice.level)?.label}
          </Badge>
          <Badge tone={STATUS_TONE[notice.status]}>{STATUS_LABEL[notice.status]}</Badge>
          {notice.apiIssue ? <Badge tone="caution">API issue</Badge> : null}
        </div>

        <div>
          <h3 className="text-cf-label uppercase text-ink-subtle">What we found</h3>
          <p className="mt-1 text-cf-body text-ink">{notice.content}</p>
        </div>

        <div className="rounded-cf bg-brand-lightest p-3">
          <h3 className="text-cf-label uppercase text-brand">Suggested next step</h3>
          <p className="mt-1 text-cf-body text-ink">
            Assign this to whoever owns the affected MID, make the change, then mark it resolved so
            it stops counting against your open notices.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default RiskNotices;

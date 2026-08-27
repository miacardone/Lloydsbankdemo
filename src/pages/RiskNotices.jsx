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
import { Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
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
  const [commenting, setCommenting] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [comment, setComment] = useState('');
  const [assignee, setAssignee] = useState('');
  const { notify } = useToast();

  const saveComment = () => {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === commenting.id
          ? { ...notice, comments: [...(notice.comments ?? []), comment.trim()] }
          : notice,
      ),
    );
    notify(`Comment added to notice ${commenting.id}.`);
    setCommenting(null);
    setComment('');
  };

  const saveAssignee = () => {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === assigning.id ? { ...notice, assignee: assignee.trim() || null } : notice,
      ),
    );
    notify(
      assignee.trim()
        ? `Notice ${assigning.id} assigned to ${assignee.trim()}.`
        : `Notice ${assigning.id} unassigned.`,
    );
    setAssigning(null);
    setAssignee('');
  };

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
          <IconButton
            icon={MessageSquare}
            label={`Comment on notice ${row.id}`}
            onClick={(event) => {
              event.stopPropagation();
              setComment('');
              setCommenting(row);
            }}
          />
          <IconButton
            icon={UserPlus}
            label={`Assign notice ${row.id}`}
            onClick={(event) => {
              event.stopPropagation();
              setAssignee(row.assignee ?? '');
              setAssigning(row);
            }}
          />
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

      <Modal
        open={Boolean(commenting)}
        onClose={() => setCommenting(null)}
        size="sm"
        title={commenting ? `Comment on notice ${commenting.id}` : ''}
        description="Visible to everyone on your account who can see this notice."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCommenting(null)}>
              Cancel
            </Button>
            <Button disabled={comment.trim().length < 3} onClick={saveComment}>
              Add comment
            </Button>
          </>
        }
      >
        <Textarea
          label="Comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you change, and when will it take effect?"
        />
      </Modal>

      <Modal
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
        size="sm"
        title={assigning ? `Assign notice ${assigning.id}` : ''}
        description="Whoever owns this is responsible for closing it out."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssigning(null)}>
              Cancel
            </Button>
            <Button onClick={saveAssignee}>Save</Button>
          </>
        }
      >
        <Input
          label="Assignee"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
          placeholder="K. Alvarez"
          hint="Leave blank to unassign."
        />
      </Modal>
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

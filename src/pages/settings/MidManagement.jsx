import { useState } from 'react';
import { Copy, Pencil, Plus, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Toggle } from '@/components/ui/Field';
import { useTableState } from '@/hooks/useTableState';
import { mids } from '@/data/merchants';
import { MERCHANTS } from '@/data/reference';
import { formatDate } from '@/lib/format';

const STATUS_TONE = { active: 'positive', paused: 'caution', closed: 'neutral' };

const ALERT_SERVICES = ['Ethoca', 'Verifi CDRN', 'Verifi Order Insight', 'RDR', 'Consumer Clarity'];

export function MidManagement() {
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const table = useTableState(mids, {
    searchKeys: ['mid', 'alias', 'descriptor', 'merchantName', 'group'],
    initialSort: { key: 'onboardedAt', direction: 'desc' },
  });

  const columns = [
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status]} dot>
          {row.status}
        </Badge>
      ),
      value: (row) => row.status,
    },
    { key: 'merchantName', header: 'Merchant' },
    { key: 'mid', header: 'MID' },
    { key: 'alias', header: 'Alias' },
    { key: 'group', header: 'MID group' },
    { key: 'descriptor', header: 'Descriptor' },
    { key: 'mcc', header: 'MCC' },
    { key: 'platform', header: 'Platform' },
    {
      key: 'alertServices',
      header: 'Alert services',
      sortable: false,
      render: (row) => <span className="text-ink-muted">{row.alertServices.join(', ')}</span>,
      value: (row) => row.alertServices.join(' | '),
    },
    { key: 'onboardedAt', header: 'Onboarded', render: (row) => formatDate(row.onboardedAt) },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton icon={Pencil} label={`Edit MID ${row.mid}`} />
          <IconButton
            icon={Copy}
            label={`Copy MID ${row.mid}`}
            onClick={() => navigator.clipboard?.writeText(row.mid)}
          />
        </div>
      ),
      value: () => '',
    },
  ];

  return (
    <>
      <PageHeader
        title="MIDs"
        description="Every merchant ID we monitor, which services are on, and how each one is described on a statement."
        actions={
          <>
            <Button variant="secondary" icon={Upload} onClick={() => setBulkOpen(true)}>
              Bulk upload
            </Button>
            <Button icon={Plus} onClick={() => setAddOpen(true)}>
              Add MID
            </Button>
          </>
        }
      />

      <DataTable columns={columns} state={table} caption="MID management" exportName="mids" dense />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        size="lg"
        title="Add MID"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddOpen(false)}>Save MID</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Select
              label="Merchant"
              required
              options={MERCHANTS.map((merchant) => ({ value: merchant.id, label: merchant.name }))}
            />
            <Input label="MID" required placeholder="5544221111" />
            <Input label="Alias" required placeholder="Store #201" />
            <Input label="Descriptor" required placeholder="ACME*STORE201" />
            <Input label="Store URL" type="url" placeholder="https://shop.example.com" />
          </div>
          <div>
            <p className="mb-2 text-cf-label uppercase text-ink-muted">Alert services</p>
            <div className="space-y-2.5 rounded-cf border border-line p-3">
              {ALERT_SERVICES.map((service, index) => (
                <Toggle key={service} checked={index < 2} onChange={() => {}} label={service} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk upload MIDs"
        description="Download the template, fill one MID per row, then upload it here."
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setBulkOpen(false)}>Upload file</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Merchant"
            required
            options={MERCHANTS.map((merchant) => ({ value: merchant.id, label: merchant.name }))}
          />
          <div className="rounded-cf border border-dashed border-lineStrong p-6 text-center">
            <p className="text-cf-body text-ink-muted">Drop a CSV here, or choose a file.</p>
            <input
              type="file"
              accept=".csv"
              aria-label="MID upload file"
              className="mt-3 w-full text-cf-body file:mr-3 file:rounded-cf file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-cf-body file:font-semibold file:text-brand-contrast"
            />
          </div>
          <Button variant="ghost" size="sm">
            Download template
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default MidManagement;

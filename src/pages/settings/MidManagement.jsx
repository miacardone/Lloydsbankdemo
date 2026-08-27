import { useState } from 'react';
import { Copy, Download, Pencil, Plus, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Dropzone } from '@/components/ui/Dropzone';
import { Input, Select, Toggle } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/csv';
import { useTableState } from '@/hooks/useTableState';
import { mids } from '@/data/merchants';
import { MERCHANTS } from '@/data/reference';
import { formatDate } from '@/lib/format';

const STATUS_TONE = { active: 'positive', paused: 'caution', closed: 'neutral' };

const ALERT_SERVICES = ['Ethoca', 'Verifi CDRN', 'Verifi Order Insight', 'RDR', 'Consumer Clarity'];

/* The bulk importer's expected shape, with one filled row so the format is
   obvious without reading documentation. */
const TEMPLATE_COLUMNS = [
  { key: 'mid', header: 'MID' },
  { key: 'alias', header: 'Alias' },
  { key: 'descriptor', header: 'Descriptor' },
  { key: 'mcc', header: 'MCC' },
  { key: 'caid', header: 'CAID' },
  { key: 'processor', header: 'Processor' },
  { key: 'serviceLevel', header: 'Service level' },
];

const downloadMidTemplate = () =>
  downloadCsv('mid-import-template', TEMPLATE_COLUMNS, [
    {
      mid: '5544220001',
      alias: 'Store #201',
      descriptor: 'ACME*201',
      mcc: '5812',
      caid: '100000001',
      processor: 'Adyen',
      serviceLevel: 'Full service',
    },
  ]);

const BLANK_MID = {
  merchantId: MERCHANTS[0].id,
  mid: '',
  alias: '',
  descriptor: '',
  location: '',
  services: ALERT_SERVICES.slice(0, 2),
};

export function MidManagement() {
  const { notify } = useToast();
  const [rows, setRows] = useState(mids);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [draft, setDraft] = useState(BLANK_MID);
  const [editing, setEditing] = useState(null);
  const [bulkMerchant, setBulkMerchant] = useState(MERCHANTS[0].id);
  const [bulkFile, setBulkFile] = useState(null);

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const draftReady = draft.mid.trim() && draft.alias.trim() && draft.descriptor.trim();

  const toggleService = (service) =>
    set({
      services: draft.services.includes(service)
        ? draft.services.filter((item) => item !== service)
        : [...draft.services, service],
    });

  const saveMid = () => {
    const merchant = MERCHANTS.find((item) => item.id === draft.merchantId) ?? MERCHANTS[0];
    setRows((current) => [
      {
        id: `${merchant.id}-mid-new-${current.length}`,
        merchantId: merchant.id,
        merchantName: merchant.name,
        group: merchant.group,
        mid: draft.mid.trim(),
        alias: draft.alias.trim(),
        descriptor: draft.descriptor.trim(),
        mcc: '5399',
        caid: String(100000000 + current.length),
        platform: 'Custom API',
        processor: 'Adyen',
        serviceLevel: 'Full service',
        status: 'active',
        onboardedAt: '2026-08-04',
        alertServices: draft.services.length ? draft.services : ['Ethoca'],
        location: draft.location.trim() || 'https://shop.example.com',
      },
      ...current,
    ]);
    setDraft(BLANK_MID);
    setAddOpen(false);
    notify(`MID ${draft.mid.trim()} added to ${merchant.name}.`);
  };

  const saveEdit = () => {
    setRows((current) =>
      current.map((row) => (row.id === editing.id ? { ...row, ...editing } : row)),
    );
    notify(`MID ${editing.mid} updated.`);
    setEditing(null);
  };

  const uploadBulk = () => {
    const merchant = MERCHANTS.find((item) => item.id === bulkMerchant) ?? MERCHANTS[0];
    setBulkOpen(false);
    notify(
      bulkFile
        ? `${bulkFile.name} queued for ${merchant.name}. We will email you when the import finishes.`
        : 'Nothing to upload — choose a CSV first.',
      bulkFile ? {} : { tone: 'info' },
    );
    setBulkFile(null);
  };

  const table = useTableState(rows, {
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
          <IconButton
            icon={Pencil}
            label={`Edit MID ${row.mid}`}
            onClick={() => setEditing({ ...row })}
          />
          <IconButton
            icon={Copy}
            label={`Copy MID ${row.mid}`}
            onClick={() => {
              navigator.clipboard?.writeText(row.mid);
              notify(`Copied ${row.mid} to the clipboard.`, { tone: 'info' });
            }}
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
            <Button disabled={!draftReady} onClick={saveMid}>
              Save MID
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Select
              label="Merchant"
              required
              options={MERCHANTS.map((merchant) => ({ value: merchant.id, label: merchant.name }))}
              value={draft.merchantId}
              onChange={(event) => set({ merchantId: event.target.value })}
            />
            <Input
              label="MID"
              required
              placeholder="5544221111"
              value={draft.mid}
              onChange={(event) => set({ mid: event.target.value })}
            />
            <Input
              label="Alias"
              required
              placeholder="Store #201"
              value={draft.alias}
              onChange={(event) => set({ alias: event.target.value })}
            />
            <Input
              label="Descriptor"
              required
              placeholder="ACME*STORE201"
              value={draft.descriptor}
              onChange={(event) => set({ descriptor: event.target.value })}
            />
            <Input
              label="Store URL"
              type="url"
              placeholder="https://shop.example.com"
              value={draft.location}
              onChange={(event) => set({ location: event.target.value })}
            />
          </div>
          <div>
            <p className="mb-2 text-cf-label uppercase text-ink-muted">Alert services</p>
            <div className="space-y-2.5 rounded-cf border border-line p-3">
              {ALERT_SERVICES.map((service) => (
                <Toggle
                  key={service}
                  checked={draft.services.includes(service)}
                  onChange={() => toggleService(service)}
                  label={service}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit MID ${editing.mid}` : ''}
        description="Changes apply to this MID only, not the merchant above it."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Alias"
              value={editing.alias}
              onChange={(event) =>
                setEditing((current) => ({ ...current, alias: event.target.value }))
              }
            />
            <Input
              label="Descriptor"
              value={editing.descriptor}
              onChange={(event) =>
                setEditing((current) => ({ ...current, descriptor: event.target.value }))
              }
            />
            <Input
              label="MCC"
              value={editing.mcc}
              onChange={(event) =>
                setEditing((current) => ({ ...current, mcc: event.target.value }))
              }
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'closed', label: 'Closed' },
              ]}
              value={editing.status}
              onChange={(event) =>
                setEditing((current) => ({ ...current, status: event.target.value }))
              }
            />
            <Select
              label="Service level"
              className="sm:col-span-2"
              options={['Basic service', 'Full service']}
              value={editing.serviceLevel}
              onChange={(event) =>
                setEditing((current) => ({ ...current, serviceLevel: event.target.value }))
              }
            />
          </div>
        ) : null}
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
            <Button onClick={uploadBulk}>Upload file</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Merchant"
            required
            options={MERCHANTS.map((merchant) => ({ value: merchant.id, label: merchant.name }))}
            value={bulkMerchant}
            onChange={(event) => setBulkMerchant(event.target.value)}
          />
          <Dropzone
            label="MID file"
            accept=".csv"
            multiple={false}
            files={bulkFile ? [bulkFile] : []}
            onChange={(next) => setBulkFile(next[0] ?? null)}
            emptyText="Drag a CSV here, or choose one from your computer."
            hint="One MID per row, matching the template."
          />
          <Button variant="ghost" size="sm" icon={Download} onClick={downloadMidTemplate}>
            Download template
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default MidManagement;

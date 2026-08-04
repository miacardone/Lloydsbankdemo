import { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Toggle } from '@/components/ui/Field';
import { merchantTree } from '@/data/merchants';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const ALERT_SERVICES = ['Ethoca', 'Verifi CDRN', 'Verifi Order Insight', 'RDR', 'Consumer Clarity'];

export function MerchantSettings() {
  const [activeId, setActiveId] = useState(merchantTree[0].id);
  const [addOpen, setAddOpen] = useState(false);

  const active = merchantTree.find((merchant) => merchant.id === activeId) ?? merchantTree[0];

  return (
    <>
      <PageHeader
        title="Merchants"
        description="Each merchant inherits its services to every MID underneath it, unless a MID overrides them."
        actions={
          <Button icon={Plus} onClick={() => setAddOpen(true)}>
            Add MID
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card padded={false}>
          <nav aria-label="Merchants" className="p-2">
            <p className="px-2 pb-1 pt-2 text-cf-label uppercase text-ink-subtle">
              Merchant accounts
            </p>
            <ul className="space-y-0.5">
              {merchantTree.map((merchant) => (
                <li key={merchant.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(merchant.id)}
                    aria-current={merchant.id === activeId ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-cf px-2.5 py-2 text-left text-cf-body transition',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                      merchant.id === activeId
                        ? 'bg-brand-lightest font-semibold text-brand'
                        : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                    )}
                  >
                    <span className="truncate">{merchant.name}</span>
                    <span className="flex items-center gap-1 text-[0.75rem] text-ink-subtle">
                      {merchant.mids.length}
                      <ChevronRight size={13} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title={active.name}
              description={`${active.group} · ${active.mids.length} MIDs`}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ALERT_SERVICES.map((service, index) => (
                <div key={service} className="rounded-cf border border-line p-3">
                  <Toggle
                    checked={index % 2 === 0}
                    onChange={() => {}}
                    label={service}
                    description={index % 2 === 0 ? 'Active for all MIDs' : 'Not enabled'}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card padded={false}>
            <div className="px-4 pt-4">
              <CardHeader title="MIDs" description="Overrides set here apply to this MID only." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-y border-line bg-surface-sunken">
                    {[
                      'Status',
                      'MID',
                      'Alias',
                      'Descriptor',
                      'Platform',
                      'Service level',
                      'Onboarded',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-3 py-2 text-cf-label uppercase text-ink-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.mids.map((mid) => (
                    <tr key={mid.id} className="border-b border-line/70 last:border-b-0">
                      <td className="px-3 py-2.5">
                        <Badge
                          tone={
                            mid.status === 'active'
                              ? 'positive'
                              : mid.status === 'paused'
                                ? 'caution'
                                : 'neutral'
                          }
                          dot
                        >
                          {mid.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-cf-body text-ink">{mid.mid}</td>
                      <td className="px-3 py-2.5 text-cf-body text-ink">{mid.alias}</td>
                      <td className="px-3 py-2.5 text-cf-body text-ink-muted">{mid.descriptor}</td>
                      <td className="px-3 py-2.5 text-cf-body text-ink-muted">{mid.platform}</td>
                      <td className="px-3 py-2.5 text-cf-body text-ink-muted">
                        {mid.serviceLevel}
                      </td>
                      <td className="px-3 py-2.5 text-cf-body text-ink-muted">
                        {formatDate(mid.onboardedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        size="lg"
        title={`Add MID to ${active.name}`}
        description="Services are inherited from the merchant. Override them here if this MID differs."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddOpen(false)}>Add MID</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="MID" required placeholder="5544221111" />
          <Input label="Affiliate ID" placeholder="Optional" />
          <Input label="MID descriptor" required placeholder="ACME*STORE201" />
          <Input label="MCC" required placeholder="5399" />
          <Input label="CAID" placeholder="Optional" />
          <Select
            label="Platform"
            required
            options={['Shopify', 'BigCommerce', 'Custom API', 'Recurly']}
          />
          <Select
            label="Service level"
            options={['Basic service', 'Full service']}
            className="sm:col-span-2"
          />
        </div>
      </Modal>
    </>
  );
}

export default MerchantSettings;

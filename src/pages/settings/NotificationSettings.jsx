import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Toggle } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { features } from '@/config/features';
import {
  notificationPreferences as seedPreferences,
  webhookEvents,
  webhooks as seedWebhooks,
} from '@/data/users';
import { formatDate } from '@/lib/format';

/**
 * Emails and webhooks live together because they answer the same question:
 * how does this account find out something happened?
 */
export function NotificationSettings() {
  const [preferences, setPreferences] = useState(seedPreferences);
  const [hooks, setHooks] = useState(seedWebhooks);
  const [addOpen, setAddOpen] = useState(false);

  const toggle = (id) =>
    setPreferences((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Choose what reaches your inbox, and where we should post events in your own systems."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Email" description="These apply to your account only." />
          <div className="space-y-3">
            {preferences.map((preference) => (
              <Toggle
                key={preference.id}
                checked={preference.enabled}
                onChange={() => toggle(preference.id)}
                label={preference.label}
              />
            ))}
          </div>
        </Card>

        {features.webhooks ? (
          <Card>
            <CardHeader
              title="Webhooks"
              description="We post a JSON payload to your endpoint as soon as the event happens."
              actions={
                <Button size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
                  Add endpoint
                </Button>
              }
            />
            {hooks.length === 0 ? (
              <EmptyState
                title="No endpoints yet"
                description="Add one and we will start posting events to it immediately."
                actionLabel="Add endpoint"
                onAction={() => setAddOpen(true)}
              />
            ) : (
              <ul className="divide-y divide-line">
                {hooks.map((hook) => (
                  <li key={hook.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-cf-body font-bold text-ink">{hook.event}</p>
                        <Badge tone={hook.active ? 'positive' : 'neutral'} dot>
                          {hook.active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[0.75rem] text-ink-muted">
                        {hook.endpoint}
                      </p>
                      <p className="mt-0.5 text-[0.75rem] text-ink-subtle">
                        Added {formatDate(hook.createdAt)} by {hook.createdBy}
                      </p>
                    </div>
                    <IconButton
                      icon={Trash2}
                      label={`Remove ${hook.event} endpoint`}
                      onClick={() =>
                        setHooks((current) => current.filter((item) => item.id !== hook.id))
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add endpoint"
        description="We retry a failed delivery three times over the following hour."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddOpen(false)}>Add endpoint</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select label="Event" required options={webhookEvents} />
          <Input
            label="Endpoint URL"
            required
            type="url"
            placeholder="https://api.yourdomain.com/webhooks/disputes"
            hint="Must be HTTPS and reachable from the public internet."
          />
        </div>
      </Modal>
    </>
  );
}

export default NotificationSettings;

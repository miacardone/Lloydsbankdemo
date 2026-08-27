import { useState } from 'react';
import { ExternalLink, Mail, MessageSquare, Phone, Play, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Field';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';
import { currentUser } from '@/data/users';
import { useBrand } from '@/hooks/useBrand';

const GUIDES = [
  {
    title: 'Working a chargeback',
    length: '0:50',
    description:
      'How to find a case, read its history, and file a representment with the evidence attached.',
  },
  {
    title: 'Handling alerts',
    length: '0:41',
    description:
      'Subscribe to an alert service, monitor what comes in, and resolve an alert before it becomes a dispute.',
  },
  {
    title: 'Managing users',
    length: '0:51',
    description: 'Add a colleague, set their role, and limit them to the MIDs they should see.',
  },
  {
    title: 'Reading risk notices',
    length: '1:04',
    description:
      'What each notice type means, and how to close one out once you have made the change.',
  },
  {
    title: 'Setting up your profile',
    length: '0:38',
    description: 'Change your email, set a password, and choose which notifications reach you.',
  },
  {
    title: 'Building a report',
    length: '1:12',
    description: 'Filter by date, MID and card brand, then export what you need as CSV.',
  },
];

const TOPICS = [
  'A chargeback case',
  'A pre-dispute alert',
  'Settlement or payouts',
  'Routing rules',
  'Users and access',
  'Something else',
];

export function Support() {
  const { brand } = useBrand();
  const { notify } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');

  const send = () => {
    setChatOpen(false);
    setMessage('');
    notify(`Message sent. ${brand.name} support usually replies within the hour.`);
  };

  return (
    <>
      <PageHeader
        title="Support"
        description="Short walkthroughs for the things people ask about most, and a direct line when they do not cover it."
        actions={
          <Button icon={MessageSquare} onClick={() => setChatOpen(true)}>
            Start a chat
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-cf-body font-bold text-ink">Talk to someone</h2>
            <p className="mt-0.5 text-cf-body text-ink-muted">
              Weekdays, 8am to 8pm Eastern. Urgent cases are answered within the hour.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button as="a" href={`mailto:${brand.supportEmail}`} variant="secondary" icon={Mail}>
              {brand.supportEmail}
            </Button>
            <Button as="a" href={`tel:${brand.supportPhone}`} variant="secondary" icon={Phone}>
              {brand.supportPhone}
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Start a chat"
        description={`Weekdays, 8am to 8pm Eastern. We reply to ${currentUser.email}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setChatOpen(false)}>
              Cancel
            </Button>
            <Button icon={Send} disabled={message.trim().length < 10} onClick={send}>
              Send message
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="What is this about?"
            options={TOPICS}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
          <Textarea
            label="Message"
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Include the case or alert number if you have one."
          />
        </div>
      </Modal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GUIDES.map((guide) => (
          <Card key={guide.title}>
            <button
              type="button"
              onClick={() =>
                notify(`"${guide.title}" is a placeholder in this demo — no video is attached.`, {
                  tone: 'info',
                })
              }
              aria-label={`Play ${guide.title}`}
              className="mb-3 flex aspect-video w-full items-center justify-center rounded-cf bg-brand-lightest transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-contrast">
                <Play size={20} aria-hidden="true" />
              </span>
            </button>
            <h3 className="text-cf-body font-bold text-ink">{guide.title}</h3>
            <p className="mt-1 text-cf-body text-ink-muted">{guide.description}</p>
            <Tooltip label="Placeholder in this demo — no video is attached yet.">
              <p
                tabIndex={0}
                className="mt-2 flex w-fit cursor-help items-center gap-1 text-[0.75rem] text-ink-subtle"
              >
                <ExternalLink size={12} aria-hidden="true" />
                Video · {guide.length}
              </p>
            </Tooltip>
          </Card>
        ))}
      </div>
    </>
  );
}

export default Support;

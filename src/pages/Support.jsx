import { ExternalLink, Mail, MessageSquare, Phone, Play } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

export function Support() {
  const { brand } = useBrand();

  return (
    <>
      <PageHeader
        title="Support"
        description="Short walkthroughs for the things people ask about most, and a direct line when they do not cover it."
        actions={<Button icon={MessageSquare}>Start a chat</Button>}
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GUIDES.map((guide) => (
          <Card key={guide.title}>
            <div className="mb-3 flex aspect-video items-center justify-center rounded-cf bg-brand-lightest">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-contrast">
                <Play size={20} aria-hidden="true" />
              </span>
            </div>
            <h3 className="text-cf-body font-bold text-ink">{guide.title}</h3>
            <p className="mt-1 text-cf-body text-ink-muted">{guide.description}</p>
            <p className="mt-2 flex items-center gap-1 text-[0.75rem] text-ink-subtle">
              <ExternalLink size={12} aria-hidden="true" />
              Video · {guide.length}
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}

export default Support;

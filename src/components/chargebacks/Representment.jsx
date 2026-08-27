import { useMemo, useState } from 'react';
import { AlertTriangle, Check, FileText, Paperclip, Shield, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Field';
import { Tooltip } from '@/components/ui/Tooltip';
import { daysUntil, draftRebuttal, evidenceFor, responseDeadline } from '@/data/evidence';
import { TODAY } from '@/data/seed';
import { formatCurrencyIn, formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

/** The countdown that decides whether a case is worth working today. */
export function DeadlinePill({ dispute }) {
  const deadline = responseDeadline(dispute.postDate, dispute.cycle);
  const days = daysUntil(deadline, TODAY);
  if (days === null) return null;

  const tone = days < 0 ? 'negative' : days <= 5 ? 'caution' : 'neutral';
  const text =
    days < 0
      ? `Window closed ${Math.abs(days)}d ago`
      : days === 0
        ? 'Due today'
        : `${days}d to respond`;

  return (
    <Tooltip label={`Response window closes ${formatDate(deadline)}`}>
      <span>
        <Badge tone={tone} dot={days <= 5}>
          {text}
        </Badge>
      </span>
    </Tooltip>
  );
}

/**
 * The representment builder — where a merchant actually fights a chargeback.
 *
 * Three things have to be true before a submission is worth making: the right
 * artifacts for this reason code, a rebuttal that answers the code rather than
 * restating the order, and time left on the clock. The form is arranged in that
 * order and refuses to submit until the first two hold.
 */
export function RepresentmentModal({ open, dispute, onClose, onSubmit }) {
  const checklist = useMemo(
    () => (dispute ? evidenceFor(dispute.reasonCategory) : []),
    [dispute?.reasonCategory], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [selected, setSelected] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [files, setFiles] = useState([]);
  const [touchedNarrative, setTouchedNarrative] = useState(false);

  /* Reset when a different case opens, rather than carrying one merchant's
     argument into the next case. */
  const [seenCase, setSeenCase] = useState(null);
  if (dispute && seenCase !== dispute.caseNumber) {
    setSeenCase(dispute.caseNumber);
    setSelected([]);
    setFiles([]);
    setNarrative(draftRebuttal(dispute));
    setTouchedNarrative(false);
  }

  if (!dispute) return null;

  const deadline = responseDeadline(dispute.postDate, dispute.cycle);
  const days = daysUntil(deadline, TODAY);
  const expired = days !== null && days < 0;

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const ready = selected.length > 0 && narrative.trim().length > 40;

  const submit = () => {
    onSubmit({
      caseNumber: dispute.caseNumber,
      evidence: selected.map((id) => checklist.find((item) => item.id === id)?.label ?? id),
      narrative: narrative.trim(),
      attachments: files,
      submittedAt: formatDate(TODAY),
      deadline,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Defend case ${dispute.caseNumber}`}
      description={`${dispute.reasonCode} — ${dispute.reasonLabel} · ${formatCurrencyIn(
        dispute.disputeAmount,
        dispute.currency,
      )} disputed`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Tooltip
            label={
              ready
                ? null
                : 'Attach at least one piece of evidence and write a rebuttal before submitting.'
            }
          >
            <span>
              <Button icon={Shield} disabled={!ready} onClick={submit}>
                Submit representment
              </Button>
            </span>
          </Tooltip>
        </>
      }
    >
      <div className="space-y-5">
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 rounded-cf border p-3',
            expired ? 'border-negative/40 bg-negative/5' : 'border-line bg-surface-sunken',
          )}
        >
          <div className="flex items-center gap-2">
            {expired ? (
              <AlertTriangle size={16} className="text-negative" aria-hidden="true" />
            ) : null}
            <div>
              <p className="text-cf-body font-semibold text-ink">
                {expired ? 'The response window has closed' : 'Response window'}
              </p>
              <p className="text-[0.75rem] text-ink-muted">
                {dispute.cycle} · closes {formatDate(deadline)}
                {expired ? ' · the issuer may refuse a late submission' : ''}
              </p>
            </div>
          </div>
          <DeadlinePill dispute={dispute} />
        </div>

        <section>
          <h3 className="text-cf-body font-bold text-ink">
            Evidence for this reason code
            <span className="ml-2 font-normal text-ink-subtle">
              {selected.length} of {checklist.length} attached
            </span>
          </h3>
          <p className="mb-2 mt-0.5 text-[0.75rem] text-ink-muted">
            Issuers weigh these specific artifacts for {dispute.reasonCategory.toLowerCase()}{' '}
            disputes. Everything you can supply raises the odds.
          </p>

          <ul className="space-y-1.5">
            {checklist.map((item) => {
              const on = selected.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={on}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-cf border p-2.5 text-left transition',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                      on
                        ? 'border-brand bg-brand-lightest/60'
                        : 'border-line hover:border-lineStrong hover:bg-surface-sunken',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                        on ? 'border-brand bg-brand text-brand-contrast' : 'border-lineStrong',
                      )}
                    >
                      {on ? <Check size={11} strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-cf-body font-semibold text-ink">
                        {item.label}
                      </span>
                      <span className="block text-[0.75rem] text-ink-muted">{item.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <Textarea
            label="Rebuttal to the issuer"
            rows={7}
            value={narrative}
            onChange={(event) => {
              setNarrative(event.target.value);
              setTouchedNarrative(true);
            }}
          />
          <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-ink-subtle">
            <FileText size={12} aria-hidden="true" />
            {touchedNarrative
              ? `${narrative.trim().length} characters`
              : 'Drafted from the reason code — edit it to match what actually happened.'}
          </p>
        </section>

        <section>
          <label
            htmlFor="representment-files"
            className="block text-cf-label uppercase text-ink-muted"
          >
            Attachments
          </label>
          <input
            id="representment-files"
            type="file"
            multiple
            onChange={(event) =>
              setFiles(Array.from(event.target.files ?? []).map((file) => file.name))
            }
            className="mt-1.5 w-full text-cf-body file:mr-3 file:rounded-cf file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-cf-body file:font-semibold file:text-brand-contrast"
          />
          {files.length ? (
            <ul className="mt-2 space-y-1">
              {files.map((name) => (
                <li key={name} className="flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
                  <Paperclip size={12} aria-hidden="true" />
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[0.75rem] text-ink-subtle">
              Nothing attached yet. Files stay in your browser in this demo.
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
}

/** What a case looks like once the merchant has answered it. */
export function SubmittedRepresentment({ representment, onWithdraw }) {
  if (!representment) return null;
  return (
    <div className="rounded-cf border border-positive/40 bg-positive/5 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-cf-body font-semibold text-ink">
          <Shield size={15} className="text-positive" aria-hidden="true" />
          Representment submitted {formatDate(representment.submittedAt)}
        </p>
        {onWithdraw ? (
          <Button variant="ghost" size="sm" icon={X} onClick={onWithdraw}>
            Withdraw
          </Button>
        ) : null}
      </div>

      <p className="mt-2 text-cf-label uppercase text-ink-muted">Evidence sent</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {representment.evidence.map((item) => (
          <li key={item}>
            <Badge tone="positive" className="normal-case tracking-normal">
              {item}
            </Badge>
          </li>
        ))}
      </ul>

      {representment.attachments?.length ? (
        <p className="mt-2 text-[0.75rem] text-ink-muted">
          {representment.attachments.length} file
          {representment.attachments.length > 1 ? 's' : ''} attached ·{' '}
          {representment.attachments.join(', ')}
        </p>
      ) : null}

      <p className="mt-2 whitespace-pre-line border-t border-positive/25 pt-2 text-[0.75rem] text-ink-muted">
        {representment.narrative}
      </p>
    </div>
  );
}

export default RepresentmentModal;

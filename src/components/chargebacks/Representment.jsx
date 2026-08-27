import { useMemo, useState } from 'react';
import { AlertTriangle, Check, FileText, Package, Printer, Shield, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Dropzone } from '@/components/ui/Dropzone';
import { Textarea } from '@/components/ui/Field';
import { Tooltip } from '@/components/ui/Tooltip';
import { daysUntil, draftRebuttal, evidenceFor, responseDeadline } from '@/data/evidence';
import { TODAY } from '@/data/seed';
import { downloadCaseBundle, printCaseFile } from '@/lib/caseFile';
import { formatBytes, formatCurrencyIn, formatDate } from '@/lib/format';
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

  /* Two ways to answer a chargeback, and both are legitimate: build the case
     here from the checklist, or attach one you compiled yourself. Requiring the
     checklist from someone who already has a finished representment is busywork
     that costs them time they may not have on the clock. */
  const ready = (selected.length > 0 || files.length > 0) && narrative.trim().length > 40;

  const submit = () => {
    onSubmit({
      caseNumber: dispute.caseNumber,
      evidence: selected.map((id) => checklist.find((item) => item.id === id)?.label ?? id),
      narrative: narrative.trim(),
      attachments: files.map((file) => file.name),
      files,
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
                : 'Tick an evidence item or attach a file, and leave a rebuttal, before submitting.'
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
              {selected.length} of {checklist.length} selected
            </span>
          </h3>
          <p className="mb-2 mt-0.5 text-[0.75rem] text-ink-muted">
            Issuers weigh these specific artifacts for {dispute.reasonCategory.toLowerCase()}{' '}
            disputes. Everything you can supply raises the odds — or skip straight to attaching a
            representment you have already put together.
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
          <Dropzone
            label="Attachments"
            files={files}
            onChange={setFiles}
            hint="Already have a representment PDF? Attach it and send — the checklist above is optional."
            emptyText="Drag your evidence here, or choose files from your computer."
          />
          <p className="mt-1.5 text-[0.75rem] text-ink-subtle">
            Files stay in your browser in this demo — nothing is uploaded anywhere.
          </p>
        </section>
      </div>
    </Modal>
  );
}

/**
 * What a case looks like once the merchant has answered it.
 *
 * The two buttons are the payoff for filling the checklist in: the pack is
 * assembled here rather than left as a list of things the merchant still has to
 * collate into an email.
 */
export function SubmittedRepresentment({ dispute, representment, brand, onWithdraw, onNotify }) {
  const [zipping, setZipping] = useState(false);
  if (!representment) return null;

  const bundle = async () => {
    setZipping(true);
    try {
      const name = await downloadCaseBundle(dispute, representment, brand);
      onNotify?.(`${name} downloaded — cover sheet, rebuttal, manifest and evidence.`);
    } catch (error) {
      onNotify?.(`Could not build the bundle: ${error.message}`, { tone: 'info' });
    } finally {
      setZipping(false);
    }
  };

  const print = () => {
    if (!printCaseFile(dispute, representment, brand)) {
      onNotify?.('Your browser blocked the print window — allow pop-ups for this site.', {
        tone: 'info',
      });
    }
  };

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

      <div className="mt-2 flex flex-wrap gap-2">
        <Tooltip label="Cover sheet, rebuttal, manifest and every attached file, in one zip">
          <Button variant="secondary" size="sm" icon={Package} disabled={zipping} onClick={bundle}>
            {zipping ? 'Building…' : 'Download case file'}
          </Button>
        </Tooltip>
        <Tooltip label="Opens the cover sheet on its own so you can print or save it as PDF">
          <Button variant="ghost" size="sm" icon={Printer} onClick={print}>
            Print cover sheet
          </Button>
        </Tooltip>
      </div>

      <p className="mt-3 text-cf-label uppercase text-ink-muted">Evidence sent</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {representment.evidence.length ? (
          representment.evidence.map((item) => (
            <li key={item}>
              <Badge tone="positive" className="normal-case tracking-normal">
                {item}
              </Badge>
            </li>
          ))
        ) : (
          <li className="text-[0.75rem] text-ink-subtle">
            Answered with attachments rather than the checklist.
          </li>
        )}
      </ul>

      {representment.files?.length ? (
        <ul className="mt-2 space-y-0.5">
          {representment.files.map((file, index) => (
            <li
              key={`${file.name}:${file.size}`}
              className="flex items-center gap-1.5 text-[0.75rem] text-ink-muted"
            >
              <span className="font-bold text-positive">{String.fromCharCode(65 + index)}</span>
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="tabular-nums">{formatBytes(file.size)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-2 whitespace-pre-line border-t border-positive/25 pt-2 text-[0.75rem] text-ink-muted">
        {representment.narrative}
      </p>
    </div>
  );
}

export default RepresentmentModal;

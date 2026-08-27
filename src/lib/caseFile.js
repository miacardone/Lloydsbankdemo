import { strToU8, zipSync } from 'fflate';
import { responseDeadline } from '@/data/evidence';
import { formatBytes, formatCurrencyIn, formatDate, maskCard } from './format';

/**
 * The case file — what a merchant actually sends an issuer.
 *
 * Ticking six boxes and typing a rebuttal is only useful if something comes out
 * the other end. This assembles the pack: a cover sheet the acquirer can read
 * without opening anything else, the rebuttal on its own, a manifest tying each
 * attachment to the evidence item it satisfies, and the files themselves.
 *
 * Everything is built in the browser. No server sees the evidence, which for a
 * demo means it works offline and for a real deployment means one less place
 * cardholder data has to travel through.
 */

const escape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** The facts an issuer checks first, in the order they check them. */
export function caseFacts(dispute) {
  return [
    ['Case number', dispute.caseNumber],
    ['Merchant', dispute.merchantName],
    ['Merchant ID', `${dispute.mid} · ${dispute.midAlias}`],
    ['Card', `${dispute.cardBrand} · ${dispute.bin} · ${maskCard(dispute.last4)}`],
    ['Reason code', `${dispute.reasonCode} — ${dispute.reasonLabel}`],
    ['Category', dispute.reasonCategory],
    ['Dispute stage', dispute.cycle],
    ['Disputed amount', formatCurrencyIn(dispute.disputeAmount, dispute.currency)],
    ['Transaction date', formatDate(dispute.transDate)],
    ['Chargeback posted', formatDate(dispute.postDate)],
    ['Response due', formatDate(responseDeadline(dispute.postDate, dispute.cycle))],
  ];
}

/**
 * A standalone cover sheet.
 *
 * Self-contained HTML with its own styles rather than a React view, because it
 * has to survive being printed, saved, and opened from inside a zip by someone
 * who has never seen this portal.
 */
export function caseFileHtml(dispute, representment, brand = {}) {
  const facts = caseFacts(dispute)
    .map(
      ([label, value]) => `<tr><th scope="row">${escape(label)}</th><td>${escape(value)}</td></tr>`,
    )
    .join('');

  const evidence = (representment.evidence ?? [])
    .map((item, index) => `<li><span class="n">${index + 1}</span>${escape(item)}</li>`)
    .join('');

  const attachments = (representment.attachments ?? [])
    .map(
      (name, index) =>
        `<li><span class="n">${String.fromCharCode(65 + index)}</span>${escape(name)}</li>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8" />
<title>Representment — case ${escape(dispute.caseNumber)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 40px;
    font: 14px/1.5 -apple-system, "Segoe UI", system-ui, sans-serif;
    color: #14181a; background: #fff;
  }
  .sheet { max-width: 46rem; margin: 0 auto; }
  header { border-bottom: 3px solid #00693e; padding-bottom: 12px; margin-bottom: 20px; }
  .kicker { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #57655d; }
  h1 { margin: 4px 0 0; font-size: 22px; letter-spacing: -0.01em; }
  h2 {
    margin: 28px 0 8px; font-size: 12px; letter-spacing: .08em;
    text-transform: uppercase; color: #57655d;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 6px 0; border-bottom: 1px solid #e6ece8; vertical-align: top; }
  th { width: 40%; font-weight: 500; color: #57655d; }
  td { font-weight: 600; }
  ol, ul { margin: 0; padding: 0; list-style: none; }
  li { padding: 6px 0; border-bottom: 1px solid #e6ece8; }
  .n {
    display: inline-block; min-width: 22px; margin-right: 10px;
    font-weight: 700; color: #00693e;
  }
  .rebuttal { white-space: pre-wrap; padding: 14px; background: #f4f7f5; border-radius: 6px; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e6ece8; font-size: 11px; color: #8b968e; }
  .empty { color: #8b968e; font-style: italic; padding: 6px 0; }
  @media print { body { padding: 0; } @page { margin: 18mm; } }
</style>
</head>
<body>
  <div class="sheet">
    <header>
      <p class="kicker">${escape(brand.name ?? 'Merchant portal')} · Chargeback representment</p>
      <h1>Case ${escape(dispute.caseNumber)}</h1>
    </header>

    <h2>Case details</h2>
    <table><tbody>${facts}</tbody></table>

    <h2>Rebuttal</h2>
    <div class="rebuttal">${escape(representment.narrative ?? '')}</div>

    <h2>Evidence supplied</h2>
    ${evidence ? `<ol>${evidence}</ol>` : '<p class="empty">No checklist items selected.</p>'}

    <h2>Attachments</h2>
    ${
      attachments
        ? `<ul>${attachments}</ul>`
        : '<p class="empty">No files attached to this submission.</p>'
    }

    <footer>
      Submitted ${escape(formatDate(representment.submittedAt))} ·
      Response window closes ${escape(formatDate(representment.deadline))} ·
      Compiled by ${escape(brand.name ?? 'the merchant portal')}.
    </footer>
  </div>
</body>
</html>`;
}

/** The same pack as plain text, for anyone who would rather not open HTML. */
export function caseFileText(dispute, representment, brand = {}) {
  const line = '-'.repeat(60);
  const facts = caseFacts(dispute)
    .map(([label, value]) => `${label.padEnd(20)} ${value}`)
    .join('\n');
  const evidence = (representment.evidence ?? []).map((e, i) => `  ${i + 1}. ${e}`).join('\n');
  const attachments = (representment.attachments ?? [])
    .map((a, i) => `  ${String.fromCharCode(65 + i)}. ${a}`)
    .join('\n');

  return [
    `${brand.name ?? 'Merchant portal'} — chargeback representment`,
    `Case ${dispute.caseNumber}`,
    line,
    facts,
    '',
    'REBUTTAL',
    line,
    representment.narrative ?? '',
    '',
    'EVIDENCE SUPPLIED',
    line,
    evidence || '  (none selected)',
    '',
    'ATTACHMENTS',
    line,
    attachments || '  (none attached)',
    '',
    `Submitted ${formatDate(representment.submittedAt)}. Response window closes ${formatDate(
      representment.deadline,
    )}.`,
  ].join('\n');
}

/** Opens the cover sheet in its own window and sends it to the printer. */
export function printCaseFile(dispute, representment, brand = {}) {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return false;
  win.document.write(caseFileHtml(dispute, representment, brand));
  win.document.close();
  win.focus();
  /* Give the styles a tick to apply before the print dialog freezes the page. */
  win.setTimeout(() => win.print(), 250);
  return true;
}

const safeName = (value) => String(value).replace(/[^A-Za-z0-9._-]+/g, '-');

/**
 * Zips the whole pack and hands it to the browser.
 *
 * The browser cannot write a folder, so a zip is the only way to deliver the
 * cover sheet and the evidence together — which is the point: one file the
 * merchant forwards, rather than seven they have to remember to attach.
 */
export async function downloadCaseBundle(dispute, representment, brand = {}) {
  const root = `case-${safeName(dispute.caseNumber)}`;
  const entries = {
    [`${root}/cover-sheet.html`]: strToU8(caseFileHtml(dispute, representment, brand)),
    [`${root}/case-file.txt`]: strToU8(caseFileText(dispute, representment, brand)),
    [`${root}/rebuttal.txt`]: strToU8(representment.narrative ?? ''),
  };

  const files = representment.files ?? [];
  const manifest = [`Case ${dispute.caseNumber} — attachment manifest`, ''];

  for (const [index, file] of files.entries()) {
    const label = String.fromCharCode(65 + index);
    const name = `${label}-${safeName(file.name)}`;
    /* eslint-disable no-await-in-loop -- a handful of files; sequential keeps
       memory flat and the order in the manifest predictable. */
    const buffer = await file.arrayBuffer();
    /* eslint-enable no-await-in-loop */
    entries[`${root}/attachments/${name}`] = new Uint8Array(buffer);
    manifest.push(`${label}. ${file.name} (${formatBytes(file.size)})`);
  }

  if (!files.length) manifest.push('(no files attached)');
  entries[`${root}/manifest.txt`] = strToU8(manifest.join('\n'));

  const zipped = zipSync(entries, { level: 6 });
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${root}-representment.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return `${root}-representment.zip`;
}

export default downloadCaseBundle;

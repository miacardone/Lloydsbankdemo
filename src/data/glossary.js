/**
 * Plain-English readings for the jargon on screen.
 *
 * Keys are lowercased so a lookup works regardless of how a label was cased.
 * `glossaryHint` tries the whole label first ("CB amount %") and falls back to
 * any abbreviation inside it ("MID health"), which means a table column only
 * needs an explicit `hint` when it invents a term this file has never seen.
 *
 * Written as sentences a merchant would recognize, not as scheme definitions —
 * the reader is trying to finish a task, not study for a certification.
 */
export const GLOSSARY = {
  /* --- abbreviations ------------------------------------------------------ */
  mid: 'Merchant ID — the account a card scheme sees when it settles your payments.',
  mids: 'Merchant IDs — the accounts a card scheme sees when it settles your payments.',
  mcc: 'Merchant Category Code — the four-digit code that tells schemes what you sell.',
  bin: 'Bank Identification Number — the first six digits of a card, identifying the issuer.',
  caid: 'Card Acceptor ID — the acquirer’s own identifier for this merchant outlet.',
  bps: 'Basis points — hundredths of a percent. 100 bps is 1% of processed value.',
  ctr: 'Chargeback-to-transaction ratio — chargebacks as a percentage of transactions.',
  ert: 'Error, Risk and Threat notice — an advisory raised against your account.',
  cb: 'Chargeback — a payment the cardholder’s bank has reversed.',
  rdr: 'Rapid Dispute Resolution — Visa’s service that refunds a dispute before it becomes a chargeback.',
  cdrn: 'Cardholder Dispute Resolution Network — Verifi’s pre-dispute alert network.',
  ivr: 'Interactive Voice Response — the automated phone menu, rather than a live agent.',
  rma: 'Return Merchandise Authorization — a return approved before the goods come back.',
  '3ds': '3-D Secure — the issuer’s step-up authentication on a card payment.',
  a2a: 'Account to account — a payment that moves bank to bank rather than over a card rail.',
  bnpl: 'Buy now, pay later — the payment is split into installments by a third party.',
  ach: 'Automated Clearing House — the US bank-to-bank rail for debits and credits.',
  psp: 'Payment service provider — the platform that connects you to acquirers.',
  kpi: 'Key performance indicator — the headline number a report is judged on.',
  mtd: 'Month to date — from the first of the month up to today.',

  /* --- column headers ----------------------------------------------------- */
  'mid alias': 'Your own name for this MID, so you do not have to read account numbers.',
  'mid group': 'The grouping this MID reports under.',
  'mid health risk': 'Traffic-light rating from this MID’s chargeback and alert ratios.',
  'alert / cb': 'Alerts raised against chargebacks posted, for the same period.',
  'alert ratio': 'Alerts as a percentage of transactions on this MID.',
  'alert services': 'The pre-dispute networks switched on for this MID.',
  'cb #': 'Number of chargebacks.',
  'cb #%': 'Chargebacks as a percentage of transactions.',
  'cb amount': 'Total value charged back.',
  'cb amount %': 'Charged-back value as a percentage of processed value.',
  'trans. #': 'Number of transactions.',
  'trans. amount': 'Total value of transactions.',
  'trans. date': 'When the original payment was taken.',
  'post date': 'When the chargeback landed on your account.',
  'payout date': 'When the money reaches your bank.',
  'total sales': 'Processed value on this MID over the reporting window.',
  'win rate': 'Share of represented disputes decided in your favor.',
  'sub id': 'The affiliate’s own sub-channel identifier for a traffic source.',
  'affiliate id': 'The partner who sent the traffic behind these payments.',
  'effective rate': 'Blended cost of acceptance — interchange, scheme fees and acquirer margin.',
  'awaiting response': 'Disputes still inside the response window, with nothing submitted yet.',
  'complaint risk': 'Rating from complaint volume against this merchant.',
  'fulfillment risk': 'Rating from how reliably orders reach the customer.',
  'no call #': 'Cardholders who disputed without ever contacting support.',
  'no call %': 'Share of disputes where the cardholder never contacted support.',
  'live rep #': 'Calls that reached a human agent.',
  'live rep %': 'Share of calls that reached a human agent.',
  'ivr #': 'Calls that ended inside the automated phone menu.',
  'ivr %': 'Share of calls that ended inside the automated phone menu.',
  'rma #': 'Returns authorized before the goods came back.',
  'rma %': 'Share of contacts that ended in an authorized return.',
  'threat #': 'Calls where the cardholder threatened a chargeback.',
  'threat %': 'Share of calls where the cardholder threatened a chargeback.',
  'card no.': 'Masked card number — only the last four digits are ever stored for display.',
  'ip address': 'Where the session signed in from.',
  'completed by': 'Who resolved this — a person, or the automation rules.',
  'assigned to': 'The analyst who owns this case.',
  'reporting month': 'The month these figures roll up to.',
  'what we found': 'The advisory raised against your account, and what to do about it.',
  'date and time': 'When the payment was authorized, in UTC.',
  'last active': 'When this user last signed in.',
  descriptor: 'The text a cardholder sees on their statement for this merchant.',
  cycle: 'The dispute stage: first chargeback, pre-arbitration, or arbitration.',
  gross: 'Value processed in the batch, before any deductions.',
  net: 'What actually reaches your bank after fees, refunds, chargebacks and reserve.',
  reconciled: 'Transactions in the batch matched to the payout.',
  reference: 'The settlement batch reference to quote when reconciling.',
  processor: 'The gateway processing this MID’s payments.',
  platform: 'The commerce platform the merchant sells on.',
  gateway: 'The gateway the disputes were posted through.',
  posted: 'Disputes raised against you in this period.',
  responded: 'Disputes you submitted evidence for.',
  recovered: 'Value won back — from representments, or from retrying a decline.',
  raised: 'When the notice was opened.',
  expires: 'The deadline after which the alert can no longer be actioned.',
  result: 'What the issuer did with the authorization request.',
  outcome: 'How the case or alert was finally resolved.',
  latency: 'Time from the first attempt to the scheme’s response.',
  'auth time': 'Time from the first attempt to the scheme’s response.',

  /* --- terms that appear in body copy ------------------------------------- */
  representment: 'Re-presenting a disputed payment to the issuer with evidence.',
  cascade: 'Retrying a declined payment on a second acquirer.',
  'soft decline': 'A decline worth retrying — funds or issuer availability, not a dead card.',
  'hard decline': 'A decline not worth retrying — the card is expired, lost or invalid.',
  interchange: 'The share of each payment that goes to the cardholder’s issuing bank.',
  reserve: 'Money the acquirer holds back against future chargebacks.',
};

/* Only short single-word keys are worth hunting for inside a longer label —
   matching "net" or "cycle" mid-sentence would fire on the wrong thing. */
const TERM_PATTERN = new RegExp(
  `\\b(${Object.keys(GLOSSARY)
    .filter((term) => term.length <= 5 && !term.includes(' ') && term !== 'net')
    .join('|')})\\b`,
  'i',
);

export function glossaryHint(label) {
  if (typeof label !== 'string') return null;
  const whole = GLOSSARY[label.trim().toLowerCase()];
  if (whole) return whole;

  const match = label.match(TERM_PATTERN);
  return match ? (GLOSSARY[match[1].toLowerCase()] ?? null) : null;
}

export default GLOSSARY;

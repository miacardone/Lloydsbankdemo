/**
 * What a merchant has to send back to win a dispute.
 *
 * The evidence an issuer will accept depends entirely on why the cardholder
 * disputed: a "goods never arrived" case is won with a delivery scan, and a
 * "this wasn't me" case is won with AVS/CVV and device history. Asking for the
 * wrong artifacts is the most common reason a representment loses on paper it
 * should have won on, so the checklist is keyed to the reason category rather
 * than being one generic upload box.
 */

const COMMON = [
  {
    id: 'receipt',
    label: 'Order receipt or invoice',
    hint: 'Itemized, showing the amount that was charged.',
  },
  {
    id: 'terms',
    label: 'Terms the cardholder accepted',
    hint: 'With the timestamp and IP of acceptance if you have it.',
  },
];

export const EVIDENCE_BY_CATEGORY = {
  Fraudulent: [
    {
      id: 'avs-cvv',
      label: 'AVS and CVV match results',
      hint: 'A full match is the single strongest signal against a fraud claim.',
    },
    {
      id: '3ds',
      label: '3-D Secure authentication result',
      hint: 'If the issuer authenticated the payment, liability usually sits with them.',
    },
    {
      id: 'device',
      label: 'Device, IP and login history',
      hint: 'Prior orders from the same device tie the cardholder to this one.',
    },
    {
      id: 'prior-orders',
      label: 'History of undisputed orders',
      hint: 'Same card, same address, previously delivered and never disputed.',
    },
    ...COMMON,
  ],
  'Not received': [
    {
      id: 'delivery',
      label: 'Proof of delivery',
      hint: 'Carrier scan showing the delivery date and address.',
    },
    {
      id: 'tracking',
      label: 'Tracking number and carrier',
      hint: 'So the issuer can verify the scan independently.',
    },
    {
      id: 'address-match',
      label: 'Shipping address matches the billing address',
      hint: 'Or evidence the cardholder asked for a different address.',
    },
    {
      id: 'comms',
      label: 'Correspondence with the cardholder',
      hint: 'Dispatch confirmations, delivery notifications, replies.',
    },
    ...COMMON,
  ],
  'Not as described': [
    {
      id: 'listing',
      label: 'Product description as it was listed',
      hint: 'A capture of the page at the time of the order, not today.',
    },
    {
      id: 'photos',
      label: 'Photographs of the item shipped',
      hint: 'Packing or QA photos dated to the dispatch.',
    },
    {
      id: 'returns-policy',
      label: 'Returns policy the cardholder accepted',
      hint: 'Showing they had a route to a refund and did not take it.',
    },
    {
      id: 'comms',
      label: 'Support conversation about the complaint',
      hint: 'What they told you was wrong, and what you offered.',
    },
    ...COMMON,
  ],
  Authorization: [
    {
      id: 'auth-code',
      label: 'Authorization code and response',
      hint: 'Showing the payment was approved by the issuer at the time.',
    },
    {
      id: 'auth-amount',
      label: 'Settled amount matches the authorized amount',
      hint: 'Or the documented reason for a difference, such as a tip or shipping.',
    },
    {
      id: 'auth-timing',
      label: 'Settlement inside the authorization window',
      hint: 'Late settlement is the usual cause of this code.',
    },
    ...COMMON,
  ],
  'Canceled recurring': [
    {
      id: 'subscription',
      label: 'Subscription sign-up record',
      hint: 'When they subscribed, and to what billing schedule.',
    },
    {
      id: 'cancel-policy',
      label: 'Cancellation terms shown at sign-up',
      hint: 'Including any notice period before the next billing run.',
    },
    {
      id: 'no-cancel',
      label: 'Evidence no cancellation was received',
      hint: 'Account log showing the subscription active on the billing date.',
    },
    {
      id: 'usage',
      label: 'Usage after the disputed billing date',
      hint: 'Logins or consumption after the charge undercut the claim.',
    },
    ...COMMON,
  ],
};

/** A category the demo has no checklist for still gets the universal items. */
export const evidenceFor = (category) => EVIDENCE_BY_CATEGORY[category] ?? COMMON;

/**
 * Days to respond, by dispute stage. Real windows vary by scheme; these are the
 * conservative end so the countdown never tells a merchant they have longer
 * than they do.
 */
const RESPONSE_WINDOW_DAYS = {
  '1st Cycle': 30,
  'Pre-arbitration': 21,
  Arbitration: 10,
};

export function responseDeadline(postDate, cycle) {
  const date = new Date(postDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + (RESPONSE_WINDOW_DAYS[cycle] ?? 30));
  return date.toISOString().slice(0, 10);
}

/** Negative once the window has closed, which the UI shows differently. */
export function daysUntil(deadline, today) {
  if (!deadline) return null;
  const end = new Date(deadline);
  const start = today instanceof Date ? today : new Date(today);
  if (Number.isNaN(end.getTime()) || Number.isNaN(start.getTime())) return null;
  return Math.round((end - start) / 86400000);
}

/**
 * A first draft of the rebuttal, so nobody starts at a blank box.
 *
 * Deliberately written as a skeleton with the specifics left to the merchant —
 * a letter that reads as boilerplate is worse than a short one that answers
 * the actual reason code.
 */
export function draftRebuttal(dispute) {
  const opener = `We are contesting case ${dispute.caseNumber} for ${dispute.merchantName}, a ${dispute.currency} ${dispute.disputeAmount} charge taken on ${dispute.transDate} under reason code ${dispute.reasonCode} (${dispute.reasonLabel}).`;

  const argument =
    {
      Fraudulent:
        'The cardholder authenticated this payment and the transaction matches their established ordering pattern. AVS and CVV results are attached, along with prior undisputed orders from the same card and device.',
      'Not received':
        'The order was delivered to the address on the account. The carrier scan and tracking history are attached, showing the delivery date and location.',
      'Not as described':
        'The item shipped matches the listing as it appeared at the time of the order. The listing capture and dispatch photographs are attached, along with our returns policy, which the cardholder did not use.',
      Authorization:
        'This payment carried a valid authorization and settled inside the permitted window for the authorized amount. The authorization code and settlement record are attached.',
      'Canceled recurring':
        'The subscription was active on the billing date and no cancellation was received before the charge. The sign-up record, cancellation terms and account activity log are attached.',
    }[dispute.reasonCategory] ??
    'The charge is valid and the supporting records for the order are attached.';

  return `${opener}\n\n${argument}\n\nWe ask that the chargeback be reversed on the strength of the attached evidence.`;
}

/**
 * The router, as far as the demo is concerned.
 *
 * Rules are stored as human-readable condition strings ("Amount is above
 * $500.00") because that is what the rule list has to render. Rather than keep
 * a second machine-readable copy in sync, this reads the strings back — one
 * source of truth, and a rule someone adds in the UI is testable the moment it
 * exists.
 */

const FIELD_READERS = {
  'Issuer country': (payment) => payment.country,
  'Issuer region': (payment) => payment.region,
  Amount: (payment) => payment.amount,
  Currency: (payment) => payment.currency,
  'Transaction type': (payment) => payment.transactionType,
  'Network token': (payment) => (payment.networkToken ? 'Present' : 'Absent'),
  'Payment method': (payment) => payment.method,
  MCC: (payment) => payment.mcc,
};

export const RULE_FIELDS = Object.keys(FIELD_READERS);

export const RULE_OPERATORS = ['is', 'is not', 'is above', 'is below', 'is one of'];

const text = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/** "$500.00" / "1,250" -> 500 / 1250. Currency symbols are display, not data. */
const amount = (value) => Number(String(value ?? '').replace(/[^0-9.-]/g, ''));

export function conditionMatches(condition, payment) {
  if (!condition?.field || condition.field === 'Everything else') return true;

  const read = FIELD_READERS[condition.field];
  if (!read) return false;
  const actual = read(payment);

  switch (condition.operator) {
    case 'is':
      return text(actual) === text(condition.value);
    case 'is not':
      return text(actual) !== text(condition.value);
    case 'is above': {
      const left = Number(actual);
      const right = amount(condition.value);
      return Number.isFinite(left) && Number.isFinite(right) && left > right;
    }
    case 'is below': {
      const left = Number(actual);
      const right = amount(condition.value);
      return Number.isFinite(left) && Number.isFinite(right) && left < right;
    }
    case 'is one of':
      return String(condition.value ?? '')
        .split(',')
        .map((entry) => text(entry))
        .filter(Boolean)
        .includes(text(actual));
    default:
      return false;
  }
}

/**
 * Walk the ladder top to bottom and stop at the first enabled rule whose
 * conditions all hold — the same contract the page promises in its subtitle.
 *
 * Returns the winning rule plus every rule it stepped over, so the tester can
 * explain the decision rather than just assert it.
 */
export function evaluateRouting(rules, payment, enabled = {}) {
  const skipped = [];

  for (const rule of rules) {
    if (enabled[rule.id] === false) {
      skipped.push({ rule, reason: 'disabled' });
      continue;
    }
    const failing = rule.conditions.find((condition) => !conditionMatches(condition, payment));
    if (failing) {
      skipped.push({ rule, reason: 'no-match', condition: failing });
      continue;
    }
    return { rule, skipped };
  }

  return { rule: null, skipped };
}

export default evaluateRouting;

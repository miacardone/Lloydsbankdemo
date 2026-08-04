import { ACQUIRERS, CURRENCIES, REGIONS } from './reference';
import { between, createRandom, daysAgo, id } from './seed';

const random = createRandom(70413355);

/**
 * Routing rules.
 *
 * The router evaluates these top-down and stops at the first match, so order is
 * meaningful and the UI has to make that visible. Anything that falls through
 * lands on the default route at the bottom of the list, which is why that row
 * cannot be deleted or reordered.
 */

export const routingRules = [
  {
    id: `rule_${id(random, 8)}`,
    priority: 1,
    name: 'UK cards, high value',
    enabled: true,
    conditions: [
      { field: 'Issuer country', operator: 'is', value: 'United Kingdom' },
      { field: 'Amount', operator: 'is above', value: '£500.00' },
    ],
    primary: 'aq-worldpay',
    fallbacks: ['aq-checkout', 'aq-adyen'],
    basis: 'success-rate',
    matched: 4182,
    approvalRate: 94.8,
    locked: false,
  },
  {
    id: `rule_${id(random, 8)}`,
    priority: 2,
    name: 'EUR settlement, local acquiring',
    enabled: true,
    conditions: [
      { field: 'Currency', operator: 'is', value: 'EUR' },
      { field: 'Issuer region', operator: 'is', value: 'EU' },
    ],
    primary: 'aq-adyen',
    fallbacks: ['aq-elavon'],
    basis: 'currency-match',
    matched: 6017,
    approvalRate: 93.1,
    locked: false,
  },
  {
    id: `rule_${id(random, 8)}`,
    priority: 3,
    name: 'Subscription rebills',
    enabled: true,
    conditions: [
      { field: 'Transaction type', operator: 'is', value: 'Recurring' },
      { field: 'Network token', operator: 'is', value: 'Present' },
    ],
    primary: 'aq-checkout',
    fallbacks: ['aq-adyen', 'aq-elavon'],
    basis: 'bin-affinity',
    matched: 9330,
    approvalRate: 91.6,
    locked: false,
  },
  {
    id: `rule_${id(random, 8)}`,
    priority: 4,
    name: 'Wallets — Apple Pay and Google Pay',
    enabled: true,
    conditions: [
      { field: 'Payment method', operator: 'is one of', value: 'Apple Pay, Google Pay' },
    ],
    primary: 'aq-adyen',
    fallbacks: ['aq-worldpay'],
    basis: 'least-cost',
    matched: 3204,
    approvalRate: 96.2,
    locked: false,
  },
  {
    id: `rule_${id(random, 8)}`,
    priority: 5,
    name: 'High-risk MCC overflow',
    enabled: false,
    conditions: [{ field: 'MCC', operator: 'is one of', value: '5967, 7995, 6051' }],
    primary: 'aq-emerchant',
    fallbacks: ['aq-truevo'],
    basis: 'rule',
    matched: 0,
    approvalRate: 0,
    locked: false,
  },
  {
    id: 'rule_default',
    priority: 6,
    name: 'Default route',
    enabled: true,
    conditions: [{ field: 'Everything else', operator: '', value: '' }],
    primary: 'aq-elavon',
    fallbacks: ['aq-worldpay', 'aq-nuvei'],
    basis: 'least-cost',
    matched: 12844,
    approvalRate: 89.4,
    /* Cannot be removed or reordered — every transaction needs a terminal route. */
    locked: true,
  },
];

export const ROUTING_BASES = [
  { value: 'least-cost', label: 'Least cost', hint: 'Cheapest acquirer that clears the floor' },
  { value: 'success-rate', label: 'Live success rate', hint: 'Highest rolling approval rate' },
  {
    value: 'bin-affinity',
    label: 'BIN affinity',
    hint: 'Acquirer with the best history on this BIN',
  },
  { value: 'currency-match', label: 'Local currency', hint: 'Settle in the issuer currency' },
  { value: 'rule', label: 'Fixed', hint: 'Always this acquirer' },
];

/**
 * Cascade ladder — what happens after a soft decline.
 * Each rung shows how much of the traffic that reached it actually cleared.
 */
export const cascadeLadder = [
  { step: 1, label: 'First attempt', acquirerId: 'aq-elavon', reached: 100, cleared: 78.4 },
  {
    step: 2,
    label: 'Retry — second acquirer',
    acquirerId: 'aq-worldpay',
    reached: 21.6,
    cleared: 8.9,
  },
  { step: 3, label: 'Retry — third acquirer', acquirerId: 'aq-adyen', reached: 12.7, cleared: 3.1 },
  {
    step: 4,
    label: 'Scheduled retry (24h)',
    acquirerId: 'aq-checkout',
    reached: 9.6,
    cleared: 2.4,
  },
];

/** 30-day recovery from cascading, in value. */
export const recoveryTrend = Array.from({ length: 30 }, (_, index) => ({
  date: daysAgo(29 - index)
    .toISOString()
    .slice(0, 10),
  recovered: between(random, 3100, 11800),
  lost: between(random, 1900, 6400),
}));

/** Live health of each acquirer connection, for the routing status strip. */
export const acquirerHealth = ACQUIRERS.map((acquirer, index) => {
  /* One connection is deliberately degraded — a status board where everything
     is always green teaches people to stop reading it. */
  const degraded = index === 5;
  const uptime = degraded ? between(random, 9930, 9968) / 100 : between(random, 9991, 10000) / 100;
  return {
    ...acquirer,
    uptime,
    status: uptime >= 99.9 ? 'healthy' : uptime >= 99.0 ? 'degraded' : 'down',
    latencyMs: between(random, 180, 720),
    lastIncident: daysAgo(between(random, 4, 180))
      .toISOString()
      .slice(0, 10),
    currencies: CURRENCIES.slice(0, between(random, 3, 6)),
    regions: REGIONS.slice(0, between(random, 2, 4)),
  };
});

export default routingRules;

import { ALERT_OUTCOMES, ALERT_SOURCES, CARD_BRANDS, MERCHANTS } from './reference';
import { between, createRandom, daysAgo, isoDate, pick, trendSeries, weighted } from './seed';

const random = createRandom(8586175);

const RESOLVERS = ['Automated', 'K. Alvarez', 'D. Whitfield', 'M. Osei', 'Unassigned'];

function buildAlert(index) {
  const merchant = pick(random, MERCHANTS);
  const alertedDaysAgo = between(random, 0, 45);
  const alertDate = daysAgo(alertedDaysAgo);
  const transDate = daysAgo(alertedDaysAgo + between(random, 0, 9));
  const expiration = daysAgo(alertedDaysAgo - 3);

  return {
    alertId: String(17548000 + index * 7 + between(random, 0, 6)),
    status: weighted(random, [
      { value: 'resolved', weight: 62 },
      { value: 'open', weight: 26 },
      { value: 'expired', weight: 12 },
    ]),
    source: pick(random, ALERT_SOURCES),
    orderId: String(between(random, 1103084, 9987654)),
    transAmount: between(random, 12, 219, 2),
    currency: 'USD',
    transDate: isoDate(transDate),
    cardBrand: pick(random, CARD_BRANDS),
    last4: String(between(random, 1000, 9999)),
    identifier: `${between(random, 40000, 69999)}xxxxxx${between(random, 1000, 9999)}`,
    midGroup: `MID Group #${between(random, 1, 9)}`,
    mid: `ACME ${String(between(random, 1, 9)).padStart(3, '0')}`,
    merchantName: merchant.name,
    alertDate: isoDate(alertDate),
    expirationDate: isoDate(expiration),
    outcome: pick(random, ALERT_OUTCOMES),
    completedBy: pick(random, RESOLVERS),
  };
}

export const alerts = Array.from({ length: 186 }, (_, index) => buildAlert(index));

/* ---------------------------------------------------------------- derived */

export const alertKpis = {
  totalTransactions: 100200,
  totalRequests: 1650,
  alertsPerTransactionRate: 1.5,
  refundedShare: 58,
};

export const alertsBySource = ALERT_SOURCES.map((source) => ({
  name: source,
  value: alerts.filter((alert) => alert.source === source).length,
})).sort((a, b) => b.value - a.value);

export const alertsByCardType = CARD_BRANDS.map((brand) => {
  const value = alerts.filter((alert) => alert.cardBrand === brand).length;
  return { name: brand, value };
}).sort((a, b) => b.value - a.value);

export const alertsByOutcome = ALERT_OUTCOMES.map((outcome) => ({
  name: outcome,
  value: alerts.filter((alert) => alert.outcome === outcome).length,
})).sort((a, b) => b.value - a.value);

/** One line per source, 30 days — the stacked area chart on the Alerts report. */
export const newAlertsByDate = (() => {
  const perSource = Object.fromEntries(
    ALERT_SOURCES.map((source, index) => [
      source,
      trendSeries(random, {
        points: 30,
        base: 90 + index * 18,
        amplitude: 40 + index * 12,
        spikeAt: index === 0 ? 4 : null,
      }),
    ]),
  );

  return Array.from({ length: 30 }, (_, day) => {
    const row = { date: isoDate(daysAgo(29 - day)) };
    ALERT_SOURCES.forEach((source) => {
      row[source] = perSource[source][day];
    });
    return row;
  });
})();

export const alertsVsChargebacksByMonth = [
  { month: '2026-04', chargebacks: 34, alerts: 62 },
  { month: '2026-05', chargebacks: 28, alerts: 40 },
  { month: '2026-06', chargebacks: 58, alerts: 66 },
  { month: '2026-07', chargebacks: 51, alerts: 74 },
  { month: '2026-08', chargebacks: 268, alerts: 31 },
];

export const alertBreakdown = [
  { source: 'Verifi CDRN', count: 400, share: 24 },
  { source: 'Consumer Clarity', count: 250, share: 15 },
  { source: 'Order Insight', count: 200, share: 12 },
  { source: 'Ethoca', count: 450, share: 27 },
  { source: 'RDR', count: 200, share: 12 },
  { source: 'Direct', count: 150, share: 10 },
];

/** Rules that auto-resolve inbound alerts before a human ever sees them. */
export const autoRefundRules = [
  {
    id: 'rule-1',
    name: 'Low-value instant refund',
    criteria: 'Amount under $75 · USD · any source',
    action: 'Refund',
    enabled: true,
    matchedLast30: 214,
  },
  {
    id: 'rule-2',
    name: 'Subscription descriptor match',
    criteria: 'MID descriptor contains "SUBSCR" · Ethoca',
    action: 'Refund',
    enabled: true,
    matchedLast30: 96,
  },
  {
    id: 'rule-3',
    name: 'Amex high value review',
    criteria: 'Amount over $400 · Amex',
    action: 'Route to analyst',
    enabled: false,
    matchedLast30: 12,
  },
];

import {
  ACQUIRERS,
  CARD_BRANDS,
  CURRENCIES,
  DECLINE_CODES,
  MERCHANTS,
  PAYMENT_METHODS,
  ROUTING_REASONS,
} from './reference';
import { between, createRandom, daysAgo, id, pick, trendSeries, weighted } from './seed';

const random = createRandom(48201773);

/**
 * The transaction ledger.
 *
 * Every row carries the routing decision alongside the payment, because that is
 * the thing Cardflo does that a single-acquirer portal cannot show you: which
 * acquirer took it, why, what it cost, and whether it only cleared on the
 * second attempt.
 */

const SOFT = DECLINE_CODES.filter((code) => code.type === 'soft');
const HARD = DECLINE_CODES.filter((code) => code.type === 'hard');

function buildTransaction(index) {
  const merchant = pick(random, MERCHANTS);
  const acquirer = weighted(random, [
    { value: ACQUIRERS[0], weight: 24 },
    { value: ACQUIRERS[1], weight: 20 },
    { value: ACQUIRERS[2], weight: 18 },
    { value: ACQUIRERS[3], weight: 14 },
    { value: ACQUIRERS[4], weight: 10 },
    { value: ACQUIRERS[5], weight: 6 },
    { value: ACQUIRERS[6], weight: 5 },
    { value: ACQUIRERS[7], weight: 3 },
  ]);

  const result = weighted(random, [
    { value: 'approved', weight: 78 },
    { value: 'recovered', weight: 7 },
    { value: 'declined', weight: 13 },
    { value: 'pending', weight: 2 },
  ]);

  const method = weighted(random, [
    { value: PAYMENT_METHODS[0], weight: 58 },
    { value: PAYMENT_METHODS[1], weight: 11 },
    { value: PAYMENT_METHODS[2], weight: 8 },
    { value: PAYMENT_METHODS[3], weight: 7 },
    { value: PAYMENT_METHODS[4], weight: 7 },
    { value: PAYMENT_METHODS[5], weight: 4 },
    { value: PAYMENT_METHODS[6], weight: 3 },
    { value: PAYMENT_METHODS[7], weight: 2 },
  ]);

  const attempts = result === 'recovered' ? between(random, 2, 3) : 1;

  /* A recovered payment was cascaded, so its reason is fixed. Everything else
     gets whichever rule the router would plausibly have fired on. */
  const routingReason =
    result === 'recovered'
      ? ROUTING_REASONS.find((r) => r.value === 'cascade')
      : weighted(random, [
          { value: ROUTING_REASONS[0], weight: 34 },
          { value: ROUTING_REASONS[1], weight: 28 },
          { value: ROUTING_REASONS[2], weight: 16 },
          { value: ROUTING_REASONS[3], weight: 14 },
          { value: ROUTING_REASONS[5], weight: 8 },
        ]);

  const declineCode =
    result === 'declined' ? (random() > 0.42 ? pick(random, SOFT) : pick(random, HARD)) : null;

  const amount = between(random, 8, 940, 2);
  const currency = weighted(random, [
    { value: CURRENCIES[0], weight: 44 },
    { value: CURRENCIES[1], weight: 26 },
    { value: CURRENCIES[2], weight: 18 },
    { value: CURRENCIES[3], weight: 5 },
    { value: CURRENCIES[4], weight: 4 },
    { value: CURRENCIES[5], weight: 3 },
  ]);

  /* Effective rate in bps: interchange + scheme + acquirer margin. Tier 2
     acquirers cost more, which is exactly what least-cost routing trades off. */
  const effectiveBps = between(
    random,
    acquirer.tier === 1 ? 118 : 168,
    acquirer.tier === 1 ? 214 : 286,
  );

  const createdAt = daysAgo(between(random, 0, 89));
  createdAt.setUTCHours(between(random, 0, 23), between(random, 0, 59), between(random, 0, 59));

  return {
    id: `txn_${id(random, 12)}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    acquirerId: acquirer.id,
    acquirerName: acquirer.name,
    acquirerTier: acquirer.tier,
    result,
    attempts,
    methodId: method.id,
    methodLabel: method.label,
    methodGroup: method.group,
    cardBrand: method.group === 'Cards' ? pick(random, CARD_BRANDS) : null,
    last4: String(between(random, 1000, 9999)),
    bin: String(between(random, 400000, 559999)),
    amount,
    currency,
    effectiveBps,
    feeAmount: Number(((amount * effectiveBps) / 10000).toFixed(2)),
    latencyMs: between(random, 240, attempts > 1 ? 1850 : 940),
    routingReason: routingReason.value,
    routingReasonLabel: routingReason.label,
    declineCode: declineCode?.code ?? null,
    declineLabel: declineCode?.label ?? null,
    declineType: declineCode?.type ?? null,
    threeDS: random() > 0.38,
    networkToken: random() > 0.45,
    createdAt: createdAt.toISOString(),
    index,
  };
}

export const transactions = Array.from({ length: 320 }, (_, index) => buildTransaction(index)).sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
);

/**
 * Headline figures for a set of rows.
 *
 * Written as a function over rows rather than a constant so a date-range picker
 * can recompute it for the window the reader chose. The full-ledger constant
 * below is just this applied to everything.
 */
export function summarize(rows) {
  const approved = rows.filter((t) => t.result === 'approved' || t.result === 'recovered');
  const recovered = rows.filter((t) => t.result === 'recovered');
  const declined = rows.filter((t) => t.result === 'declined');

  const processedVolume = approved.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = approved.reduce((sum, t) => sum + t.feeAmount, 0);

  return {
    count: rows.length,
    approvedCount: approved.length,
    declinedCount: declined.length,
    recoveredCount: recovered.length,
    recoveredVolume: recovered.reduce((sum, t) => sum + t.amount, 0),
    processedVolume,
    totalFees,
    approvalRate: rows.length ? (approved.length / rows.length) * 100 : 0,
    /* The number Cardflo is judged on: blended cost across every acquirer. */
    blendedEffectiveBps: processedVolume ? (totalFees / processedVolume) * 10000 : 0,
    avgLatencyMs: rows.length
      ? Math.round(rows.reduce((sum, t) => sum + t.latencyMs, 0) / rows.length)
      : 0,
  };
}

export const transactionSummary = summarize(transactions);

/** 90-day approval-rate and volume trend for the dashboard chart. */
export const volumeTrend = (() => {
  const seriesRandom = createRandom(90210);
  const volume = trendSeries(seriesRandom, { points: 90, base: 82000, amplitude: 16000 });
  const approvals = trendSeries(seriesRandom, {
    points: 90,
    base: 862,
    amplitude: 42,
    noise: 0.05,
  });

  return volume.map((value, index) => ({
    date: daysAgo(89 - index)
      .toISOString()
      .slice(0, 10),
    volume: value,
    approvalRate: Math.min(97.5, approvals[index] / 10),
  }));
})();

/** Volume and approval rate split by acquirer — feeds the routing page. */
export function acquirerSplit(source) {
  return ACQUIRERS.map((acquirer) => {
    const rows = source.filter((t) => t.acquirerId === acquirer.id);
    const approved = rows.filter((t) => t.result === 'approved' || t.result === 'recovered');
    const volume = approved.reduce((sum, t) => sum + t.amount, 0);
    const fees = approved.reduce((sum, t) => sum + t.feeAmount, 0);

    return {
      ...acquirer,
      transactions: rows.length,
      volume,
      approvalRate: rows.length ? (approved.length / rows.length) * 100 : 0,
      effectiveBps: volume ? (fees / volume) * 10000 : 0,
      avgLatencyMs: rows.length
        ? Math.round(rows.reduce((sum, t) => sum + t.latencyMs, 0) / rows.length)
        : 0,
      share: 0, // filled below
    };
  })
    .map((row, _index, all) => {
      const total = all.reduce((sum, item) => sum + item.transactions, 0);
      return { ...row, share: total ? (row.transactions / total) * 100 : 0 };
    })
    .sort((a, b) => b.volume - a.volume);
}

export const acquirerPerformance = acquirerSplit(transactions);

/** Method mix, for the dashboard donut. */
export function methodSplit(source) {
  return PAYMENT_METHODS.map((method) => {
    const rows = source.filter((t) => t.methodId === method.id);
    return {
      name: method.label,
      group: method.group,
      value: rows.reduce((sum, t) => sum + t.amount, 0),
      count: rows.length,
    };
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.value - a.value);
}

export const methodMix = methodSplit(transactions);

/** Decline reasons, ranked. Soft declines are the recoverable revenue. */
export function declineSplit(source) {
  return DECLINE_CODES.map((code) => {
    const rows = source.filter((t) => t.declineCode === code.code);
    return {
      ...code,
      count: rows.length,
      value: rows.reduce((sum, t) => sum + t.amount, 0),
    };
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export const declineBreakdown = declineSplit(transactions);

export default transactions;

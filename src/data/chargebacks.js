import { CARD_BRANDS, CYCLES, MERCHANTS, MID_ALIASES, REASON_CODES } from './reference';
import { between, createRandom, daysAgo, id, isoDate, pick, trendSeries, weighted } from './seed';

const random = createRandom(515190);

function buildChargeback() {
  const reason = pick(random, REASON_CODES);
  const merchant = pick(random, MERCHANTS);
  const postedDaysAgo = between(random, 0, 89);
  const postDate = daysAgo(postedDaysAgo);
  const transDate = daysAgo(postedDaysAgo + between(random, 3, 55));
  const amount = between(random, 18, 495, 2);
  const outcome = weighted(random, [
    { value: 'pending', weight: 52 },
    { value: 'won', weight: 30 },
    { value: 'lost', weight: 18 },
  ]);

  return {
    caseNumber: id(random, 10),
    outcome,
    cycle: weighted(random, [
      { value: CYCLES[0], weight: 82 },
      { value: CYCLES[1], weight: 13 },
      { value: CYCLES[2], weight: 5 },
    ]),
    merchantId: merchant.id,
    merchantName: merchant.name,
    mid: String(between(random, 5544220000, 6546946700)),
    midAlias: pick(random, MID_ALIASES),
    cardBrand: reason.brand,
    reasonCode: reason.code,
    reasonLabel: reason.label,
    reasonCategory: reason.category,
    postDate: isoDate(postDate),
    transDate: isoDate(transDate),
    disputeAmount: amount,
    transAmount: amount,
    currency: 'USD',
    bin: String(between(random, 400000, 549999)),
    last4: String(between(random, 1000, 9999)),
    isFraud: reason.category === 'Fraudulent',
    defended: random() > 0.28,
  };
}

export const chargebacks = Array.from({ length: 264 }, buildChargeback);

/* ---------------------------------------------------------------- derived */

const thisMonth = chargebacks.filter((row) => row.postDate >= isoDate(daysAgo(30)));

export const chargebackKpis = {
  total: thisMonth.length,
  fraudShare:
    Math.round((thisMonth.filter((row) => row.isFraud).length / thisMonth.length) * 1000) / 10,
  transactionRatio: 0.62,
  activeMids: 177,
  wonRate: Math.round(
    (chargebacks.filter((row) => row.outcome === 'won').length /
      chargebacks.filter((row) => row.outcome !== 'pending').length) *
      100,
  ),
  disputedValue: thisMonth.reduce((sum, row) => sum + row.disputeAmount, 0),
};

/** 13 weeks of posted volume, with the late-July spike from the reference screens. */
export const chargebacksByPostDate = trendSeries(random, {
  points: 14,
  base: 46,
  amplitude: 22,
  spikeAt: 11,
}).map((value, index) => ({
  date: isoDate(daysAgo((13 - index) * 7)),
  chargebacks: value,
}));

/* Written as functions over rows so a date-range picker can recompute them for
   the window the reader chose; the constants underneath are the whole ledger. */
export function cardTypeSplit(rows) {
  const counts = CARD_BRANDS.map((brand) => ({
    name: brand,
    value: rows.filter((row) => row.cardBrand === brand).length,
  }));
  const total = counts.reduce((sum, entry) => sum + entry.value, 0) || 1;
  return counts
    .map((entry) => ({ ...entry, share: Math.round((entry.value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export const chargebacksByCardType = cardTypeSplit(chargebacks);

export function reasonCodeSplit(rows) {
  const map = new Map();
  rows.forEach((row) => map.set(row.reasonCode, (map.get(row.reasonCode) ?? 0) + 1));
  const total = rows.length || 1;
  return [...map.entries()]
    .map(([code, value]) => ({ name: code, value, share: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export const chargebacksByReasonCode = reasonCodeSplit(chargebacks);

export function reasonCategorySplit(rows) {
  const map = new Map();
  rows.forEach((row) => map.set(row.reasonCategory, (map.get(row.reasonCategory) ?? 0) + 1));
  const total = rows.length || 1;
  return [...map.entries()]
    .map(([name, value]) => ({ name, value, share: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export const chargebacksByReasonCategory = reasonCategorySplit(chargebacks);

/** Value bands, counted from the rows rather than hard-coded. */
const BANDS = [
  { band: '$1 – 25', min: 0, max: 25 },
  { band: '$25 – 50', min: 25, max: 50 },
  { band: '$50 – 100', min: 50, max: 100 },
  { band: '$100 – 200', min: 100, max: 200 },
  { band: '$200 – 1,000', min: 200, max: Infinity },
];

export function amountBandSplit(rows) {
  return BANDS.map(({ band, min, max }) => ({
    band,
    value: rows.filter((row) => row.disputeAmount >= min && row.disputeAmount < max).length,
  }));
}

export const chargebacksByAmountBand = amountBandSplit(chargebacks);

export const topMidsByChargebacks = MID_ALIASES.slice(0, 5).map((alias, index) => {
  const won = between(random, 39, 415);
  const lost = between(random, 19, 259);
  const nonFraud = between(random, 84, 786);
  const fraud = between(random, 31, 682);
  return {
    mid: String(between(random, 88710, 9611400)),
    merchantIdentifier: `Store #2${index + 1}${index}`,
    midAlias: alias,
    won,
    lost,
    new: between(random, 72, 479),
    nonFraud,
    nonFraudRate: Number((nonFraud / 100000).toFixed(4)),
    fraud,
    fraudRate: Number((fraud / 100000).toFixed(4)),
    defended: between(random, 435, 889),
  };
});

/** Average days between transaction and post date, by week. */
export const spanBetweenTransactionAndPost = trendSeries(random, {
  points: 12,
  base: 44,
  amplitude: 20,
}).map((value, index) => ({
  week: isoDate(daysAgo((11 - index) * 7)),
  days: value,
}));

export const chargebackRatioByWeek = trendSeries(random, {
  points: 10,
  base: 32,
  amplitude: 24,
}).map((value, index) => ({
  week: isoDate(daysAgo((9 - index) * 7)),
  ratio: Number((value / 100).toFixed(2)),
}));

export const chargebacksByTransactionMonth = trendSeries(random, {
  points: 6,
  base: 26,
  amplitude: 12,
}).map((value, index) => ({
  month: isoDate(daysAgo((5 - index) * 30)),
  share: value,
}));

export const monthOverMonthChange = [
  { month: '2026-03', change: 8 },
  { month: '2026-04', change: -6 },
  { month: '2026-05', change: 14 },
  { month: '2026-06', change: 22 },
  { month: '2026-07', change: -11 },
  { month: '2026-08', change: -4 },
];

export const highChargebackBins = [
  { bin: '439995', rate: 2.5 },
  { bin: '436999', rate: 1.25 },
  { bin: '437999', rate: 1.05 },
  { bin: '438999', rate: 0.95 },
  { bin: '439999', rate: 0.8 },
];

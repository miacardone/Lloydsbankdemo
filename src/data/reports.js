import { between, createRandom, isoDate, daysAgo, trendSeries } from './seed';

const random = createRandom(367801);

export const affiliateReport = Array.from({ length: 15 }, (_, index) => {
  const transAmount = between(random, 1407627, 8737695, 2);
  const cbAmount = between(random, 7111, 89151, 2);
  const transCount = between(random, 43132, 197531);
  const cbCount = between(random, 62, 1564);
  return {
    id: `affiliate-${index}`,
    affiliateId: String(between(random, 1062, 1492)),
    subId: String(between(random, 1801, 8687)),
    transAmount,
    cbAmount,
    cbAmountShare: Number(((cbAmount / transAmount) * 100).toFixed(2)),
    transCount,
    cbCount,
    cbCountShare: Number(((cbCount / transCount) * 100).toFixed(2)),
  };
}).sort((a, b) => b.cbAmountShare - a.cbAmountShare);

export const resultantKpi = [
  { month: '2025-10', transactions: 820, chargebacks: 32, ratio: 3.9 },
  { month: '2025-11', transactions: 910, chargebacks: 29, ratio: 3.2 },
  { month: '2025-12', transactions: 1040, chargebacks: 41, ratio: 3.9 },
  { month: '2026-01', transactions: 4200, chargebacks: 386, ratio: 91.9 },
  { month: '2026-02', transactions: 1180, chargebacks: 44, ratio: 3.7 },
  { month: '2026-03', transactions: 3980, chargebacks: 302, ratio: 75.9 },
  { month: '2026-04', transactions: 1320, chargebacks: 48, ratio: 3.6 },
  { month: '2026-05', transactions: 2100, chargebacks: 96, ratio: 4.6 },
  { month: '2026-06', transactions: 1260, chargebacks: 44, ratio: 3.5 },
  { month: '2026-07', transactions: 1190, chargebacks: 39, ratio: 3.3 },
];

export const callCentrePerformance = [
  {
    campaign: 'Campaign 1',
    noCall: 170,
    noCallPct: 27.64,
    liveRep: 188,
    liveRepPct: 30.57,
    rma: 144,
    rmaPct: 23.41,
    ivr: 37,
    ivrPct: 6.02,
    threat: 76,
    threatPct: 12.36,
  },
  {
    campaign: 'Campaign 2',
    noCall: 414,
    noCallPct: 67.32,
    liveRep: 160,
    liveRepPct: 26.02,
    rma: 9,
    rmaPct: 1.46,
    ivr: 17,
    ivrPct: 2.76,
    threat: 15,
    threatPct: 2.44,
  },
  {
    campaign: 'Campaign 3',
    noCall: 60,
    noCallPct: 9.76,
    liveRep: 81,
    liveRepPct: 13.17,
    rma: 321,
    rmaPct: 52.2,
    ivr: 66,
    ivrPct: 13.61,
    threat: 57,
    threatPct: 9.27,
  },
  {
    campaign: 'Campaign 4',
    noCall: 285,
    noCallPct: 46.02,
    liveRep: 313,
    liveRepPct: 50.99,
    rma: 7,
    rmaPct: 1.14,
    ivr: 3,
    ivrPct: 0.49,
    threat: 9,
    threatPct: 1.46,
  },
  {
    campaign: 'Campaign 5',
    noCall: 197,
    noCallPct: 32.03,
    liveRep: 309,
    liveRepPct: 50.24,
    rma: 0,
    rmaPct: 0,
    ivr: 51,
    ivrPct: 8.29,
    threat: 58,
    threatPct: 9.43,
  },
  {
    campaign: 'Campaign 6',
    noCall: 504,
    noCallPct: 81.95,
    liveRep: 91,
    liveRepPct: 14.8,
    rma: 18,
    rmaPct: 2.93,
    ivr: 0,
    ivrPct: 0,
    threat: 2,
    threatPct: 0.33,
  },
];

/** Month-to-date operating figures, the table analysts live in at month end. */
export const monthToDate = Array.from({ length: 12 }, (_, index) => {
  const posted = between(random, 40, 260);
  const responded = Math.round(posted * (0.62 + random() * 0.3));
  const won = Math.round(responded * (0.4 + random() * 0.35));
  return {
    id: `mtd-${index}`,
    gateway: `Gateway ${String.fromCharCode(65 + (index % 5))}`,
    mid: String(between(random, 5544220000, 6546946700)),
    posted,
    responded,
    won,
    lost: responded - won,
    winRate: Number(((won / responded) * 100).toFixed(1)),
    recovered: between(random, 4200, 48000, 2),
    pending: posted - responded,
  };
});

export const midHealthTrend = trendSeries(random, { points: 20, base: 62, amplitude: 26 }).map(
  (value, index) => ({ date: isoDate(daysAgo((19 - index) * 3)), score: value }),
);

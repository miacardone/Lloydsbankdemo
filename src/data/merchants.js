import { MERCHANTS, MID_ALIASES, PLATFORMS, PROCESSORS } from './reference';
import { between, createRandom, daysAgo, isoDate, pick, weighted } from './seed';

const random = createRandom(4744558);

const ALERT_SERVICES = ['Ethoca', 'Verifi CDRN', 'Verifi Order Insight', 'RDR', 'Consumer Clarity'];

function buildMid(merchant, index) {
  const enabled = ALERT_SERVICES.filter(() => random() > 0.45);
  return {
    id: `${merchant.id}-mid-${index}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    mid: String(between(random, 5544220000, 6546946799)),
    alias: pick(random, MID_ALIASES),
    descriptor: `${merchant.name.split(' ')[0].toUpperCase()}*${between(random, 100, 999)}`,
    mcc: String(between(random, 5300, 5999)),
    caid: String(between(random, 100000000, 999999999)),
    group: merchant.group,
    platform: pick(random, PLATFORMS),
    processor: pick(random, PROCESSORS),
    serviceLevel: weighted(random, [
      { value: 'Full service', weight: 60 },
      { value: 'Basic service', weight: 40 },
    ]),
    status: weighted(random, [
      { value: 'active', weight: 78 },
      { value: 'paused', weight: 14 },
      { value: 'closed', weight: 8 },
    ]),
    onboardedAt: isoDate(daysAgo(between(random, 30, 1400))),
    alertServices: enabled.length ? enabled : ['Ethoca'],
    location: 'https://shop.example.com',
  };
}

export const mids = MERCHANTS.flatMap((merchant) =>
  Array.from({ length: between(random, 1, 3) }, (_, index) => buildMid(merchant, index)),
);

export const merchantTree = MERCHANTS.map((merchant) => ({
  ...merchant,
  mids: mids.filter((mid) => mid.merchantId === merchant.id),
}));

/** MID Health: the traffic-light table that tells an analyst where to look first. */
export const midHealth = mids.slice(0, 8).map((mid) => {
  const transactions = between(random, 440, 3200);
  const chargebacks = between(random, 0, 52);
  const ctr = Number(((chargebacks / transactions) * 100).toFixed(2));
  const alertCount = between(random, 0, 44);
  return {
    id: mid.id,
    mid: `xxxx${mid.mid.slice(-6)}`,
    alias: mid.alias,
    group: mid.group,
    processor: mid.processor,
    transactions,
    totalSales: between(random, 45000, 78000),
    chargebacks,
    ctr,
    alertCount,
    ethocaAlerts: between(random, 0, 30),
    verifiAlerts: between(random, 0, 9),
    directAlerts: between(random, 0, 5),
    alertRatio: Number(((alertCount / transactions) * 100).toFixed(2)),
    alertToChargebackRatio: chargebacks === 0 ? 0 : Number((alertCount / chargebacks).toFixed(2)),
    rating: ctr > 1.2 ? 'high' : ctr > 0.5 ? 'medium' : 'low',
  };
});

/** Combined monitoring: one row per merchant-month with rolled-up risk. */
export const combinedMonitoring = MERCHANTS.flatMap((merchant) =>
  ['2026-06', '2026-07', '2026-08'].map((month) => {
    const complaints = between(random, 1004, 1600);
    return {
      id: `${merchant.id}-${month}`,
      month,
      merchantName: merchant.name,
      complaintRisk: weighted(random, [
        { value: 'low', weight: 55 },
        { value: 'medium', weight: 30 },
        { value: 'high', weight: 15 },
      ]),
      fulfilmentRisk: weighted(random, [
        { value: 'low', weight: 60 },
        { value: 'medium', weight: 25 },
        { value: 'high', weight: 15 },
      ]),
      midHealthRisk: weighted(random, [
        { value: 'low', weight: 45 },
        { value: 'medium', weight: 35 },
        { value: 'high', weight: 20 },
      ]),
      complaints,
      rating: Number((between(random, 28, 45) / 10).toFixed(1)),
    };
  }),
);

export const monitoringSummary =
  'Across the reporting window, complaint volume held steady between 1,100 and 1,600 per month, ' +
  'with average customer ratings between 3.0 and 4.1. Most merchants sit at low to medium risk. ' +
  'Harborlight Supply and Northwind Fitness have carried a high complaint rating for three ' +
  'consecutive months and should be reviewed before the next processor submission.';

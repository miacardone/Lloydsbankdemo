import { ERT_LEVELS, ERT_TYPES, MERCHANTS } from './reference';
import { between, createRandom, daysAgo, isoDate, pick, weighted } from './seed';

const random = createRandom(2567690);

/**
 * ERT = Error, Risk and Threat notices. Written as advice an analyst can act on,
 * because that is what the screen is for.
 */
const CONTENT = [
  'Descriptor shows only a city and state. Cardholders cannot recognise it, which is driving avoidable disputes.',
  'You are settling 59 days after the transaction. Anything past 72 hours risks an authorisation mismatch or a declined representment.',
  '32% of chargebacks were filed under "refund not processed". Either the refund is failing at the gateway or it is landing later than your policy promises.',
  'BIN 439995 carries the highest chargeback rate on your account at 38%. The issuer is Banktown Bank, N.A.',
  'Your support descriptor has no URL or phone number attached. Add both so issuers can route cardholders back to you.',
  'Cancellation requests are reaching support less than 72 hours before the next bill. Traffic sources are sending customers to the wrong cancellation page.',
  '57.5% of chargebacks are categorised as cancelled recurring. This usually means cancellations are not clearing before the next billing run.',
];

function buildErt(index) {
  const merchant = pick(random, MERCHANTS);
  const type = pick(random, ERT_TYPES);
  return {
    id: 63000 + index * 3,
    merchantName: merchant.name,
    status: weighted(random, [
      { value: 'resolved', weight: 55 },
      { value: 'viewed', weight: 30 },
      { value: 'new', weight: 15 },
    ]),
    level: weighted(random, [
      { value: 'notice', weight: 45 },
      { value: 'warning', weight: 35 },
      { value: 'urgent', weight: 20 },
    ]),
    apiIssue: random() > 0.86,
    type: type.value,
    typeLabel: type.label,
    content: CONTENT[index % CONTENT.length],
    createdBy: 'Cardflo Reporting',
    addedAt: isoDate(daysAgo(between(random, 1, 45))),
    assignee: random() > 0.6 ? 'K. Alvarez' : null,
  };
}

export const ertNotices = Array.from({ length: 28 }, (_, index) => buildErt(index));

export const ertLevelMeta = Object.fromEntries(ERT_LEVELS.map((level) => [level.value, level]));

export const ertKpis = {
  noticesThisMonth: 267,
  lossPreventionOpportunity: 15895,
  merchantErrorNotifications: 10,
  totalPrevented: 256769,
};

export const ertRevenueByMonth = [
  { month: '2025-09', total: 3000, resolved: 1400 },
  { month: '2025-10', total: 5000, resolved: 900 },
  { month: '2025-11', total: 4050, resolved: 700 },
  { month: '2025-12', total: 6050, resolved: 4300 },
  { month: '2026-01', total: 7240, resolved: 1050 },
  { month: '2026-02', total: 9070, resolved: 6100 },
  { month: '2026-03', total: 10565, resolved: 5400 },
  { month: '2026-04', total: 6480, resolved: 4300 },
  { month: '2026-05', total: 4200, resolved: 2600 },
  { month: '2026-06', total: 4233, resolved: 2500 },
  { month: '2026-07', total: 5683, resolved: 3400 },
  { month: '2026-08', total: 2672, resolved: 600 },
];

export const ertTypesByRank = [
  { name: 'Revenue threat', value: 35 },
  { name: 'Merchant error', value: 24 },
  { name: 'Processor risk', value: 19 },
  { name: 'Documentation required', value: 15 },
  { name: 'Bad case archive', value: 7 },
];

export const merchantErrorBreakdown = [
  { label: 'Failed transaction month', count: 400, share: 24 },
  { label: 'Repeated chargeback customer', count: 250, share: 15 },
  { label: 'Failed alert refund', count: 200, share: 12 },
  { label: 'Failed evidence', count: 800, share: 49 },
];

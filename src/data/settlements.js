import { ACQUIRERS, CURRENCIES, MERCHANTS, SETTLEMENT_STATES } from './reference';
import { between, createRandom, daysAgo, id, pick, weighted } from './seed';

const random = createRandom(33518802);

/**
 * Settlement batches.
 *
 * One row per acquirer per currency per payout date, which is how the money
 * actually arrives — a merchant with four acquirers and three currencies is
 * reconciling twelve streams, and the whole point of the portal is that they
 * only have to look at one screen to do it.
 */

function buildSettlement(index) {
  const acquirer = pick(random, ACQUIRERS);
  const merchant = pick(random, MERCHANTS);
  const currency = weighted(random, [
    { value: CURRENCIES[0], weight: 46 },
    { value: CURRENCIES[1], weight: 26 },
    { value: CURRENCIES[2], weight: 18 },
    { value: CURRENCIES[3], weight: 5 },
    { value: CURRENCIES[4], weight: 5 },
  ]);

  const daysOut = between(random, -6, 45);
  const status =
    daysOut > 3 ? 'paid' : daysOut > 0 ? 'in-transit' : random() > 0.12 ? 'scheduled' : 'held';

  const gross = between(random, 4200, 186000, 2);
  const feeBps = between(random, 122, 246);
  const fees = Number(((gross * feeBps) / 10000).toFixed(2));
  const refunds = Number((gross * (between(random, 4, 190) / 10000)).toFixed(2));
  const chargebacks = Number((gross * (between(random, 0, 62) / 10000)).toFixed(2));
  const reserve = random() > 0.7 ? Number((gross * 0.05).toFixed(2)) : 0;

  const txnCount = between(random, 42, 2400);
  /* A batch reconciles when every transaction in it has been matched to the
     payout. Anything short of that is what the finance team chases. */
  const matched = status === 'paid' ? txnCount - between(random, 0, 4) : txnCount;

  return {
    id: `stl_${id(random, 10)}`,
    reference: `CF-${String(2026000 + index).slice(-7)}`,
    acquirerId: acquirer.id,
    acquirerName: acquirer.name,
    merchantId: merchant.id,
    merchantName: merchant.name,
    currency,
    status,
    gross,
    fees,
    refunds,
    chargebacks,
    reserve,
    net: Number((gross - fees - refunds - chargebacks - reserve).toFixed(2)),
    transactions: txnCount,
    matched,
    unmatched: txnCount - matched,
    payoutDate: daysAgo(daysOut).toISOString().slice(0, 10),
    periodStart: daysAgo(daysOut + 2)
      .toISOString()
      .slice(0, 10),
    periodEnd: daysAgo(daysOut + 1)
      .toISOString()
      .slice(0, 10),
  };
}

export const settlements = Array.from({ length: 84 }, (_, index) => buildSettlement(index)).sort(
  (a, b) => new Date(b.payoutDate) - new Date(a.payoutDate),
);

export const settlementSummary = (() => {
  const paid = settlements.filter((s) => s.status === 'paid');
  const upcoming = settlements.filter((s) => s.status === 'scheduled' || s.status === 'in-transit');
  const held = settlements.filter((s) => s.status === 'held');

  return {
    paidNet: paid.reduce((sum, s) => sum + s.net, 0),
    upcomingNet: upcoming.reduce((sum, s) => sum + s.net, 0),
    heldNet: held.reduce((sum, s) => sum + s.net, 0),
    unmatched: settlements.reduce((sum, s) => sum + s.unmatched, 0),
    batches: settlements.length,
    nextPayoutDate:
      upcoming.map((s) => s.payoutDate).sort()[0] ?? settlements[0]?.payoutDate ?? null,
  };
})();

/** Net payout by acquirer, for the settlements bar chart. */
export const settlementByAcquirer = ACQUIRERS.map((acquirer) => {
  const rows = settlements.filter((s) => s.acquirerId === acquirer.id);
  return {
    name: acquirer.name,
    net: rows.reduce((sum, s) => sum + s.net, 0),
    fees: rows.reduce((sum, s) => sum + s.fees, 0),
    batches: rows.length,
  };
})
  .filter((row) => row.batches > 0)
  .sort((a, b) => b.net - a.net);

export const SETTLEMENT_STATE_MAP = Object.fromEntries(
  SETTLEMENT_STATES.map((state) => [state.value, state]),
);

export default settlements;

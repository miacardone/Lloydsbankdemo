/**
 * Reference data — the vocabulary the rest of the demo speaks in.
 * Card brands, reason codes and cycles are real; merchant names are fictional.
 */

export const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex', 'Discover'];

export const CARD_BRAND_COLORS = {
  Visa: 'var(--cf-chart-1)',
  Mastercard: 'var(--cf-chart-2)',
  Amex: 'var(--cf-chart-3)',
  Discover: 'var(--cf-chart-4)',
  Other: 'var(--cf-chart-6)',
};

export const REASON_CODES = [
  { code: '10.4', brand: 'Visa', label: 'Other fraud — card absent', category: 'Fraudulent' },
  { code: '13.1', brand: 'Visa', label: 'Merchandise not received', category: 'Not received' },
  {
    code: '13.3',
    brand: 'Visa',
    label: 'Not as described or defective',
    category: 'Not as described',
  },
  { code: '13.7', brand: 'Visa', label: 'Cancelled merchandise', category: 'Cancelled recurring' },
  { code: '4853', brand: 'Mastercard', label: 'Cardholder dispute', category: 'Not as described' },
  {
    code: '4837',
    brand: 'Mastercard',
    label: 'No cardholder authorisation',
    category: 'Fraudulent',
  },
  { code: '4808', brand: 'Mastercard', label: 'Authorisation related', category: 'Authorisation' },
  { code: 'A02', brand: 'Amex', label: 'No valid authorisation', category: 'Authorisation' },
  { code: 'C08', brand: 'Amex', label: 'Goods or services not received', category: 'Not received' },
  { code: 'UA02', brand: 'Discover', label: 'Fraud — card not present', category: 'Fraudulent' },
];

export const REASON_CATEGORIES = [
  'Fraudulent',
  'Not received',
  'Not as described',
  'Authorisation',
  'Cancelled recurring',
];

export const CYCLES = ['1st Cycle', 'Pre-arbitration', 'Arbitration'];

export const OUTCOMES = [
  { value: 'won', label: 'Won', tone: 'positive' },
  { value: 'lost', label: 'Lost', tone: 'negative' },
  { value: 'pending', label: 'In progress', tone: 'neutral' },
];

export const ALERT_SOURCES = [
  'Ethoca',
  'Verifi CDRN',
  'Consumer Clarity',
  'Order Insight',
  'RDR',
  'Direct',
];

export const ALERT_OUTCOMES = [
  'Refunded',
  'Already refunded',
  'Already a chargeback',
  'Resolved with customer',
  'No match',
];

export const PLATFORMS = ['Shopify', 'BigCommerce', 'Custom API', 'Recurly', 'Chargebee'];

export const PROCESSORS = ['Adyen', 'Stripe', 'Worldpay', 'Braintree', 'Nuvei'];

export const MERCHANTS = [
  { id: 'acme-intl', name: 'Acme International', group: 'Acme Group' },
  { id: 'acme-corp', name: 'Acme Corporation', group: 'Acme Group' },
  { id: 'acme-llc', name: 'Acme, LLC', group: 'Acme Group' },
  { id: 'harborlight', name: 'Harborlight Supply', group: 'Harborlight' },
  { id: 'kettle-row', name: 'Kettle Row Coffee', group: 'Kettle Row' },
  { id: 'northwind', name: 'Northwind Fitness', group: 'Northwind' },
];

export const MID_ALIASES = [
  'Store #201',
  'Store #204',
  'Subscriptions',
  'Marketplace',
  'Retail POS',
  'Wholesale',
];

export const RISK_RATINGS = [
  { value: 'low', label: 'Low', tone: 'positive' },
  { value: 'medium', label: 'Medium', tone: 'caution' },
  { value: 'high', label: 'High', tone: 'negative' },
];

export const ERT_TYPES = [
  { value: 'merchant-error', label: 'Merchant error' },
  { value: 'revenue-threat', label: 'Revenue threat' },
  { value: 'processor-risk', label: 'Processor risk' },
  { value: 'documentation', label: 'Documentation required' },
];

export const ERT_LEVELS = [
  { value: 'notice', label: 'Notice', tone: 'info' },
  { value: 'warning', label: 'Warning', tone: 'caution' },
  { value: 'urgent', label: 'Urgent', tone: 'negative' },
];

/* ------------------------------------------------------------------ *
 * Cardflo platform vocabulary
 *
 * The acquiring network, the methods it accepts and the language the
 * routing engine speaks. Acquirer names are real Tier 1 institutions;
 * the routing weights and performance figures attached to them in
 * src/data are demo values, not published rates.
 * ------------------------------------------------------------------ */

export const ACQUIRERS = [
  { id: 'aq-elavon', name: 'Elavon', region: 'EU', tier: 1 },
  { id: 'aq-worldpay', name: 'Worldpay', region: 'UK', tier: 1 },
  { id: 'aq-adyen', name: 'Adyen', region: 'EU', tier: 1 },
  { id: 'aq-checkout', name: 'Checkout.com', region: 'UK', tier: 1 },
  { id: 'aq-nuvei', name: 'Nuvei', region: 'NA', tier: 1 },
  { id: 'aq-payvision', name: 'Payvision', region: 'EU', tier: 2 },
  { id: 'aq-emerchant', name: 'eMerchantPay', region: 'EU', tier: 2 },
  { id: 'aq-truevo', name: 'Truevo', region: 'MENA', tier: 2 },
];

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', group: 'Cards' },
  { id: 'apple-pay', label: 'Apple Pay', group: 'Wallets' },
  { id: 'google-pay', label: 'Google Pay', group: 'Wallets' },
  { id: 'paypal', label: 'PayPal', group: 'Wallets' },
  { id: 'open-banking', label: 'Open Banking', group: 'A2A' },
  { id: 'sepa', label: 'SEPA Direct Debit', group: 'A2A' },
  { id: 'klarna', label: 'Klarna', group: 'BNPL' },
  { id: 'ideal', label: 'iDEAL', group: 'A2A' },
];

export const CURRENCIES = ['GBP', 'EUR', 'USD', 'AUD', 'CAD', 'SEK'];

export const REGIONS = ['UK', 'EU', 'NA', 'LATAM', 'APAC', 'MENA'];

/** Authorisation outcomes as the portal reports them. */
export const AUTH_RESULTS = [
  { value: 'approved', label: 'Approved', tone: 'positive' },
  { value: 'recovered', label: 'Recovered on retry', tone: 'positive' },
  { value: 'declined', label: 'Declined', tone: 'negative' },
  { value: 'pending', label: 'Pending', tone: 'neutral' },
];

/** Scheme decline codes, grouped by whether a cascade is worth attempting. */
export const DECLINE_CODES = [
  { code: '05', label: 'Do not honour', type: 'soft', retryable: true },
  { code: '51', label: 'Insufficient funds', type: 'soft', retryable: true },
  { code: '91', label: 'Issuer unavailable', type: 'soft', retryable: true },
  { code: '61', label: 'Exceeds withdrawal limit', type: 'soft', retryable: true },
  { code: '54', label: 'Expired card', type: 'hard', retryable: false },
  { code: '14', label: 'Invalid card number', type: 'hard', retryable: false },
  { code: '41', label: 'Lost card', type: 'hard', retryable: false },
  { code: '04', label: 'Pick up card', type: 'hard', retryable: false },
];

/** Why the router chose the acquirer it chose. Shown on every transaction. */
export const ROUTING_REASONS = [
  { value: 'least-cost', label: 'Least cost' },
  { value: 'success-rate', label: 'Highest live success rate' },
  { value: 'bin-affinity', label: 'BIN affinity' },
  { value: 'currency-match', label: 'Local currency match' },
  { value: 'cascade', label: 'Cascaded after decline' },
  { value: 'rule', label: 'Merchant rule' },
];

export const SETTLEMENT_STATES = [
  { value: 'paid', label: 'Paid', tone: 'positive' },
  { value: 'in-transit', label: 'In transit', tone: 'info' },
  { value: 'scheduled', label: 'Scheduled', tone: 'neutral' },
  { value: 'held', label: 'Held', tone: 'caution' },
];

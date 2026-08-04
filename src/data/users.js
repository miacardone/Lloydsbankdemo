import { createRandom, daysAgo, isoDate, between, pick, weighted } from './seed';

const random = createRandom(999123);

const ROLES = ['Merchant admin', 'Merchant full service', 'Analyst', 'Read only'];

const PEOPLE = [
  ['Abioye', 'Ade'],
  ['Amadeus', 'Rook'],
  ['Barclay', 'Nunez'],
  ['Cleverbridge', 'Ops'],
  ['Fiserv', 'Desk'],
  ['Joao', 'Brown'],
  ['Kaiden', 'Domo'],
  ['Kushki', 'Vela'],
  ['Mia', 'Cardone'],
  ['Nadia', 'Renn'],
  ['Omar', 'Feld'],
  ['Priya', 'Raman'],
  ['Rosa', 'Lindqvist'],
  ['Theo', 'Marchetti'],
];

export const users = PEOPLE.map(([firstName, lastName], index) => ({
  id: `user-${index + 1}`,
  firstName,
  lastName,
  role: pick(random, ROLES),
  username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
  status: weighted(random, [
    { value: 'active', weight: 84 },
    { value: 'locked', weight: 10 },
    { value: 'invited', weight: 6 },
  ]),
  midPermissions: between(random, 1, 12),
  lastActive: isoDate(daysAgo(between(random, 0, 40))),
}));

export const loginHistory = Array.from({ length: 9 }, (_, index) => ({
  id: `login-${index}`,
  ip: `${between(random, 46, 203)}.${between(random, 1, 254)}.${between(random, 1, 254)}.${between(random, 1, 254)}`,
  at: `${isoDate(daysAgo(index * 3))} ${String(between(random, 8, 19)).padStart(2, '0')}:${String(
    between(random, 10, 59),
  )}:${String(between(random, 10, 59))}`,
}));

export const currentUser = {
  name: 'Sales Full Service',
  username: 'sales.fullservice',
  email: 'demo@cardflo.io',
  role: 'Merchant admin',
  account: 'Acme Group',
};

export const notificationPreferences = [
  {
    id: 'ert-created',
    label: 'Email me when a risk notice is opened on my account',
    enabled: true,
  },
  {
    id: 'new-chargebacks',
    label: 'Email me when new chargebacks arrive (max one per day)',
    enabled: true,
  },
  {
    id: 'daily-digest',
    label: 'Send a daily summary of yesterday\u2019s chargebacks',
    enabled: false,
  },
  {
    id: 'weekly-digest',
    label: 'Send a Monday summary of last week\u2019s chargebacks',
    enabled: false,
  },
];

export const webhooks = [
  {
    id: 'wh-9',
    event: 'Case created',
    endpoint: 'https://hooks.acme.example/dispute',
    createdAt: '2026-05-30',
    updatedAt: '2026-05-30',
    createdBy: 'k.alvarez',
    active: true,
  },
  {
    id: 'wh-10',
    event: 'Case updated',
    endpoint: 'https://api.acme.example/webhooks/cb',
    createdAt: '2026-05-29',
    updatedAt: '2026-07-02',
    createdBy: 'm.osei',
    active: true,
  },
  {
    id: 'wh-11',
    event: 'Alert resolved',
    endpoint: 'https://sample.acmebank.example/alerts',
    createdAt: '2026-06-20',
    updatedAt: '2026-06-20',
    createdBy: 'd.whitfield',
    active: false,
  },
];

export const webhookEvents = [
  'Case created',
  'Case updated',
  'Case outcome posted',
  'Alert received',
  'Alert resolved',
  'Risk notice opened',
];

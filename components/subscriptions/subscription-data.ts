export type PlanType = 'Free Plan' | 'Premium Plan';

export type Subscription = {
  id: string;
  agency: string;
  email: string;
  orders: number;
  plan: PlanType;
  verified?: boolean;
};

export const subscriptions: Subscription[] = [
  {
    id: 'remnet',
    agency: 'Remnet',
    email: 'info@remnet.com',
    orders: 146,
    plan: 'Premium Plan',
    verified: true,
  },
  {
    id: 'voyage-hub',
    agency: 'Voyage Hub',
    email: 'hello@voyagehub.com',
    orders: 122,
    plan: 'Free Plan',
    verified: true,
  },
  {
    id: 'skyline-travels',
    agency: 'Skyline Travels',
    email: 'team@skyline.com',
    orders: 94,
    plan: 'Free Plan',
  },
  {
    id: 'atlas-visa',
    agency: 'Atlas Visa',
    email: 'support@atlasvisa.com',
    orders: 88,
    plan: 'Premium Plan',
    verified: true,
  },
  {
    id: 'global-gate',
    agency: 'Global Gate',
    email: 'admin@globalgate.com',
    orders: 76,
    plan: 'Premium Plan',
    verified: true,
  },
  {
    id: 'northstar',
    agency: 'Northstar',
    email: 'care@northstar.com',
    orders: 64,
    plan: 'Free Plan',
  },
  {
    id: 'flyright',
    agency: 'FlyRight',
    email: 'hello@flyright.com',
    orders: 58,
    plan: 'Premium Plan',
  },
  {
    id: 'newroute',
    agency: 'NewRoute',
    email: 'team@newroute.com',
    orders: 42,
    plan: 'Free Plan',
    verified: true,
  },
  {
    id: 'visa-lane',
    agency: 'Visa Lane',
    email: 'support@visalane.com',
    orders: 37,
    plan: 'Premium Plan',
  },
  {
    id: 'tripwise',
    agency: 'TripWise',
    email: 'hi@tripwise.com',
    orders: 29,
    plan: 'Free Plan',
  },
  {
    id: 'borderless',
    agency: 'Borderless',
    email: 'team@borderless.com',
    orders: 24,
    plan: 'Free Plan',
  },
  {
    id: 'waypoint',
    agency: 'Waypoint',
    email: 'hello@waypoint.com',
    orders: 18,
    plan: 'Premium Plan',
  },
];

export function getSubscription(id: string) {
  return (
    subscriptions.find((subscription) => subscription.id === id) ??
    subscriptions[0]
  );
}

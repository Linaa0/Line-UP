/** Shapes returned by the Line-Up API (see docs/API.md). Dates arrive as ISO strings. */

export type StopRef = { id: string; name: string };
export type StopWithBay = StopRef & { bay: string | null };

export type Stop = StopRef & { area: string; lat: number; lng: number; routeCount: number };

export type RouteKind = 'EXPRESS' | 'REGULAR' | 'DIRECT';

export type RouteSummary = {
  id: string;
  code: string;
  direction: 'OUTBOUND' | 'INBOUND';
  kind: RouteKind;
  operator: string;
  via: string;
  fare: number;
  frequencyMin: number;
  acceptsTapGo: boolean;
  acceptsMomo: boolean;
  origin: StopRef;
  terminus: StopRef;
};

export type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  phoneVerified: boolean;
  homeStop: StopRef | null;
  preferences: {
    language: 'en' | 'rw' | 'fr' | 'sw';
    notifyArrivals: boolean;
    notifyQueue: boolean;
    notifyReceipts: boolean;
    notifyOffers: boolean;
  };
};

export type Session = { token: string; user: User };

export type OtpIssued = { phone: string; expiresAt: string; resendAfterSeconds: number; demoCode?: string };

export type Departure = {
  route: RouteSummary;
  from: StopWithBay;
  to: StopRef;
  departureAt: string;
  minutesAway: number;
  stopsAway: number;
  fare: number;
  loadPercent: number;
};

export type SearchResult = {
  route: RouteSummary;
  from: StopWithBay;
  to: StopRef;
  stopsCount: number;
  durationMin: number;
  fare: number;
  departureAt: string;
  arrivalAt: string;
  minutesAway: number;
  loadPercent: number;
  best: boolean;
};

export type RouteDetails = {
  route: RouteSummary;
  from: StopWithBay;
  to: StopRef;
  durationMin: number;
  fare: number;
  saved: boolean;
  nextDepartures: { tripStartAt: string; departureAt: string; minutesAway: number }[];
  bus: { plate: string; capacity: number } | null;
  loadPercent: number;
  stops: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    bay: string | null;
    time: string;
    role: 'departure' | 'intermediate' | 'arrival';
  }[];
};

export type Ticket = {
  id: string;
  code: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'BOARDED' | 'CANCELLED';
  state: 'awaiting_payment' | 'active' | 'used' | 'expired';
  fare: number;
  passenger: string;
  route: RouteSummary;
  from: StopWithBay;
  to: StopRef;
  tripStartAt: string;
  departureAt: string;
  arrivalAt: string;
  durationMin: number;
  validUntil: string;
  bus: string | null;
  payment: {
    method: 'MTN_MOMO' | 'AIRTEL_MONEY';
    phone: string;
    reference: string;
    status: string;
    demo: boolean;
    paidAt: string;
  } | null;
  queueEntryId: string | null;
};

export type QueueStatus = 'WAITING' | 'BOARDING' | 'ON_BUS' | 'COMPLETED';

export type QueueEntry = {
  id: string;
  status: QueueStatus;
  position: number;
  peopleAhead: number;
  minutesToDeparture: number;
  departureAt: string;
  departureLabel: string;
  boardedAt: string | null;
  route: RouteSummary;
  from: StopWithBay;
  to: StopRef;
  bus: string | null;
  ticket: { id: string; code: string };
  journey: { id: string; name: string; time: string; passed: boolean }[];
  nextStop: { id: string; name: string; time: string } | null;
  remainingMin: number;
};

export type LiveBus = {
  routeId: string;
  code: string;
  direction: 'OUTBOUND' | 'INBOUND';
  plate: string | null;
  lat: number;
  lng: number;
  nextStop: StopRef;
  minutesToNextStop: number;
  terminus: string;
  loadPercent: number;
};

export type LiveData = {
  generatedAt: string;
  buses: LiveBus[];
  lines: { routeId: string; code: string; direction: string; path: (StopRef & { lat: number; lng: number })[] }[];
};

export type AppNotification = {
  id: string;
  type: 'TRIP' | 'PAYMENT' | 'QUEUE' | 'ALERT' | 'ACCOUNT';
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

import { kigaliDayStart, kigaliMinuteOfDay } from './kigali-time.js';
import { activeTripStarts, nextTripsAtStop, positionAlongPath } from './schedule.js';

const timetable = { frequencyMin: 10, firstDeparture: 6 * 60, lastDeparture: 22 * 60 };

describe('Kigali time', () => {
  it('converts UTC instants to Kigali minutes (UTC+2)', () => {
    expect(kigaliMinuteOfDay(new Date('2026-11-19T06:30:00Z'))).toBe(8 * 60 + 30);
    expect(kigaliMinuteOfDay(new Date('2026-11-19T23:00:00Z'))).toBe(60);
  });

  it('finds the Kigali midnight for late-UTC instants', () => {
    // 23:00 UTC on the 19th is 01:00 on the 20th in Kigali.
    expect(kigaliDayStart(new Date('2026-11-19T23:00:00Z')).toISOString()).toBe('2026-11-19T22:00:00.000Z');
  });
});

describe('nextTripsAtStop', () => {
  it('returns the next departures reaching the stop', () => {
    // 08:03 Kigali; stop is 5 min into the route → buses at 08:05, 08:15…
    const now = new Date('2026-11-19T06:03:00Z');
    const trips = nextTripsAtStop(timetable, 5, now, 2);
    expect(trips.map((t) => t.atStop.toISOString())).toEqual([
      '2026-11-19T06:05:00.000Z',
      '2026-11-19T06:15:00.000Z',
    ]);
    expect(trips[0].tripStartAt.toISOString()).toBe('2026-11-19T06:00:00.000Z');
  });

  it('rolls over to the next morning after the last bus', () => {
    const lateNight = new Date('2026-11-19T21:30:00Z'); // 23:30 Kigali
    const [first] = nextTripsAtStop(timetable, 0, lateNight, 1);
    expect(first.atStop.toISOString()).toBe('2026-11-20T04:00:00.000Z'); // 06:00 Kigali
  });
});

describe('activeTripStarts', () => {
  it('lists buses currently on the road', () => {
    const now = new Date('2026-11-19T06:25:00Z'); // 08:25 Kigali, 20-min route
    const starts = activeTripStarts(timetable, 20, now).map((d) => d.toISOString());
    expect(starts).toEqual(['2026-11-19T06:10:00.000Z', '2026-11-19T06:20:00.000Z']);
  });
});

describe('positionAlongPath', () => {
  const path = [{ minutesFromStart: 0 }, { minutesFromStart: 10 }, { minutesFromStart: 20 }];
  it('interpolates between stops', () => {
    expect(positionAlongPath(path, 15)).toEqual({ segment: 1, fraction: 0.5 });
  });
});

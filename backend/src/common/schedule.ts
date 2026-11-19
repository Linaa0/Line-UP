import { addMinutes, kigaliDayStart, minutesBetween } from './kigali-time.js';

/**
 * Timetable maths. Buses leave the first stop of a route every
 * `frequencyMin` minutes between `firstDeparture` and `lastDeparture`
 * (minutes after midnight, Kigali time), and reach each later stop
 * `minutesFromStart` minutes after leaving.
 *
 * No GPS feed is integrated, so arrival times and bus positions are
 * ESTIMATES from this timetable, and the API labels them that way.
 */
export type Timetable = {
  frequencyMin: number;
  firstDeparture: number;
  lastDeparture: number;
};

export type PathStop = { minutesFromStart: number };

/** Departures from the first stop on the Kigali day starting at `dayStart`. */
export function tripStartsOnDay(t: Timetable, dayStart: Date): Date[] {
  const starts: Date[] = [];
  for (let m = t.firstDeparture; m <= t.lastDeparture; m += t.frequencyMin) {
    starts.push(addMinutes(dayStart, m));
  }
  return starts;
}

/**
 * Next trips that reach a stop `offsetMin` minutes into the route at or after `from`.
 * Looks at today and tomorrow so late-evening searches still return results.
 */
export function nextTripsAtStop(t: Timetable, offsetMin: number, from: Date, count: number) {
  const today = kigaliDayStart(from);
  const results: { tripStartAt: Date; atStop: Date }[] = [];
  for (const day of [today, addMinutes(today, 1440)]) {
    for (const tripStartAt of tripStartsOnDay(t, day)) {
      const atStop = addMinutes(tripStartAt, offsetMin);
      if (atStop.getTime() >= from.getTime()) results.push({ tripStartAt, atStop });
      if (results.length >= count) return results;
    }
  }
  return results;
}

/** Trips currently on the road: started, and not yet at the last stop. */
export function activeTripStarts(t: Timetable, totalMin: number, now: Date): Date[] {
  const today = kigaliDayStart(now);
  const yesterday = addMinutes(today, -1440);
  return [...tripStartsOnDay(t, yesterday), ...tripStartsOnDay(t, today)].filter((start) => {
    const elapsed = minutesBetween(start, now);
    return elapsed >= 0 && elapsed < totalMin;
  });
}

/**
 * Where a bus is `elapsedMin` minutes into its trip: the index of the last stop
 * it passed and the fraction of the way to the next one.
 */
export function positionAlongPath(path: PathStop[], elapsedMin: number) {
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i].minutesFromStart;
    const b = path[i + 1].minutesFromStart;
    if (elapsedMin >= a && elapsedMin < b) {
      return { segment: i, fraction: (elapsedMin - a) / (b - a) };
    }
  }
  return { segment: path.length - 1, fraction: 0 };
}

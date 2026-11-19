/**
 * Development seed — run with `npm run prisma:seed`.
 *
 * Stops are real Kigali places with approximate coordinates. Route codes,
 * fares, timetables and buses are SAMPLE DATA for development and demos,
 * modelled on the Figma designs; they are not official RURA/operator data.
 * The script is idempotent: it upserts stops and replaces routes.
 */
import { existsSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Direction, PrismaClient, RouteKind } from '../src/generated/prisma/client.js';

if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const stops = [
  { name: 'Nyabugogo Bus Park', area: 'Nyarugenge', lat: -1.9393, lng: 30.0447 },
  { name: 'Downtown (Nyarugenge)', area: 'Nyarugenge', lat: -1.9465, lng: 30.0598 },
  { name: 'Muhima', area: 'Nyarugenge', lat: -1.9419, lng: 30.0556 },
  { name: 'Kinamba', area: 'Gasabo', lat: -1.9378, lng: 30.0705 },
  { name: 'Kacyiru', area: 'Gasabo', lat: -1.9409, lng: 30.0904 },
  { name: 'Kimihurura', area: 'Gasabo', lat: -1.9505, lng: 30.0878 },
  { name: 'Gishushu', area: 'Gasabo', lat: -1.9546, lng: 30.1037 },
  { name: 'Kisimenti', area: 'Gasabo', lat: -1.9571, lng: 30.1096 },
  { name: 'Remera Bus Park', area: 'Gasabo', lat: -1.9546, lng: 30.1135 },
  { name: 'Kibagabaga', area: 'Gasabo', lat: -1.9311, lng: 30.1152 },
  { name: 'Kimironko Bus Park', area: 'Gasabo', lat: -1.9488, lng: 30.1257 },
  { name: 'Rwandex', area: 'Kicukiro', lat: -1.9564, lng: 30.0934 },
  { name: 'Sonatubes', area: 'Kicukiro', lat: -1.9622, lng: 30.1032 },
  { name: 'Kicukiro Centre', area: 'Kicukiro', lat: -1.9787, lng: 30.1056 },
  { name: 'Nyamirambo', area: 'Nyarugenge', lat: -1.9776, lng: 30.0452 },
  { name: 'Gisozi', area: 'Gasabo', lat: -1.9183, lng: 30.0679 },
  { name: 'Kanombe (Airport)', area: 'Kicukiro', lat: -1.9637, lng: 30.1349 },
  { name: 'Kabeza', area: 'Kicukiro', lat: -1.9692, lng: 30.1348 },
];

type RouteSeed = {
  code: string;
  kind: RouteKind;
  operator: string;
  via: string;
  fare: number;
  frequencyMin: number;
  firstDeparture: string;
  lastDeparture: string;
  acceptsMomo?: boolean;
  /** [stop name, minutes from first stop, bay at this stop] */
  path: [string, number, string?][];
};

const routes: RouteSeed[] = [
  {
    code: 'A024', kind: RouteKind.EXPRESS, operator: 'Kigali Bus Services', via: 'Downtown & Sonatubes',
    fare: 800, frequencyMin: 12, firstDeparture: '05:30', lastDeparture: '22:00',
    path: [['Nyabugogo Bus Park', 0, 'Bay 3'], ['Downtown (Nyarugenge)', 7, 'Bay 1'], ['Rwandex', 15], ['Sonatubes', 19], ['Kicukiro Centre', 25, 'Bay 2']],
  },
  {
    code: 'A031', kind: RouteKind.REGULAR, operator: 'Royal Express', via: 'Muhima, Gishushu & Kisimenti',
    fare: 750, frequencyMin: 10, firstDeparture: '05:00', lastDeparture: '22:30', acceptsMomo: false,
    path: [['Nyabugogo Bus Park', 0, 'Bay 1'], ['Muhima', 5], ['Kimihurura', 14], ['Gishushu', 20], ['Kisimenti', 24], ['Remera Bus Park', 28, 'Bay 4']],
  },
  {
    code: 'A036', kind: RouteKind.DIRECT, operator: 'Kigali Bus Services', via: 'Kinamba & Kacyiru',
    fare: 600, frequencyMin: 15, firstDeparture: '05:15', lastDeparture: '21:45',
    path: [['Nyabugogo Bus Park', 0, 'Bay 5'], ['Kinamba', 6], ['Kacyiru', 13], ['Kibagabaga', 22], ['Kimironko Bus Park', 30, 'Bay 2']],
  },
  {
    code: 'A041', kind: RouteKind.REGULAR, operator: 'RFTC', via: 'Muhima & Kinamba',
    fare: 500, frequencyMin: 20, firstDeparture: '06:00', lastDeparture: '21:00',
    path: [['Nyabugogo Bus Park', 0, 'Bay 2'], ['Muhima', 5], ['Kinamba', 10], ['Kacyiru', 18, 'Bay 1']],
  },
  {
    code: 'B102', kind: RouteKind.REGULAR, operator: 'RFTC', via: 'Biryogo',
    fare: 400, frequencyMin: 10, firstDeparture: '05:00', lastDeparture: '22:00',
    path: [['Downtown (Nyarugenge)', 0, 'Bay 4'], ['Nyamirambo', 12, 'Bay 1']],
  },
  {
    code: 'B210', kind: RouteKind.EXPRESS, operator: 'Royal Express', via: 'Airport Road',
    fare: 500, frequencyMin: 15, firstDeparture: '05:30', lastDeparture: '22:00',
    path: [['Remera Bus Park', 0, 'Bay 2'], ['Kanombe (Airport)', 10], ['Kabeza', 16, 'Bay 1']],
  },
  {
    code: 'C305', kind: RouteKind.REGULAR, operator: 'Kigali Bus Services', via: 'Remera & Sonatubes',
    fare: 600, frequencyMin: 15, firstDeparture: '05:30', lastDeparture: '21:30',
    path: [['Kimironko Bus Park', 0, 'Bay 1'], ['Remera Bus Park', 8], ['Kisimenti', 11], ['Sonatubes', 17], ['Kicukiro Centre', 24, 'Bay 1']],
  },
  {
    code: 'C410', kind: RouteKind.REGULAR, operator: 'RFTC', via: 'Kinamba',
    fare: 450, frequencyMin: 20, firstDeparture: '06:00', lastDeparture: '21:00',
    path: [['Nyabugogo Bus Park', 0, 'Bay 6'], ['Kinamba', 7], ['Gisozi', 15, 'Bay 1']],
  },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

async function main() {
  for (const stop of stops) {
    await prisma.stop.upsert({ where: { name: stop.name }, update: stop, create: stop });
  }
  const stopIds = new Map(
    (await prisma.stop.findMany({ select: { id: true, name: true } })).map((s) => [s.name, s.id]),
  );

  let busNumber = 100;
  for (const r of routes) {
    const total = r.path[r.path.length - 1][1];
    const directions: [Direction, [string, number, string?][]][] = [
      [Direction.OUTBOUND, r.path],
      [Direction.INBOUND, [...r.path].reverse().map(([name, min, bay]) => [name, total - min, bay])],
    ];

    for (const [direction, path] of directions) {
      // Update routes in place (never delete them): tickets reference routes,
      // so the seed must be safe to rerun on a database that has real data.
      const details = {
        kind: r.kind,
        operator: r.operator,
        via: r.via,
        fare: r.fare,
        frequencyMin: r.frequencyMin,
        firstDeparture: toMinutes(r.firstDeparture),
        lastDeparture: toMinutes(r.lastDeparture),
        acceptsMomo: r.acceptsMomo ?? true,
      };
      const route = await prisma.route.upsert({
        where: { code_direction: { code: r.code, direction } },
        update: details,
        create: { code: r.code, direction, ...details },
      });

      // Route stops are only referenced by their route, so they can be replaced.
      await prisma.routeStop.deleteMany({ where: { routeId: route.id } });
      await prisma.routeStop.createMany({
        data: path.map(([name, minutesFromStart, bay], order) => {
          const stopId = stopIds.get(name);
          if (!stopId) throw new Error(`Unknown stop ${name}`);
          return { routeId: route.id, stopId, order, minutesFromStart, bay: bay ?? null };
        }),
      });

      for (let i = 0; i < 2; i++) {
        busNumber += 1;
        const plate = `RAE ${busNumber} ${direction === Direction.OUTBOUND ? 'A' : 'B'}`;
        await prisma.bus.upsert({
          where: { plate },
          update: { routeId: route.id, capacity: 70 },
          create: { plate, routeId: route.id, capacity: 70 },
        });
      }
    }
  }

  const counts = await Promise.all([prisma.stop.count(), prisma.route.count(), prisma.bus.count()]);
  console.log(`Seeded ${counts[0]} stops, ${counts[1]} routes (both directions), ${counts[2]} buses.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

/**
 * Development seed script — run with `npm run prisma:seed`.
 *
 * Intentionally empty until the data model exists. When models are added,
 * insert clearly-labelled development data here (never real customer data).
 */
async function main(): Promise<void> {
  console.log('Seed: no models defined yet — nothing to seed.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

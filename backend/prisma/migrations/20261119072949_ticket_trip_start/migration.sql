/*
  Warnings:

  - Added the required column `trip_start_at` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tickets_route_id_departure_at_idx";

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "trip_start_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "tickets_route_id_trip_start_at_idx" ON "tickets"("route_id", "trip_start_at");

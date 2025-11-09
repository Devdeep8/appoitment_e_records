/*
  Warnings:

  - You are about to drop the column `specialization` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `DoctorAvailability` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cityName` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."DoctorAvailability" DROP CONSTRAINT "DoctorAvailability_doctorId_fkey";

-- DropIndex
DROP INDEX "public"."Doctor_specialization_idx";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "specialization",
ADD COLUMN     "cityName" TEXT NOT NULL,
ADD COLUMN     "clinicName" TEXT,
ADD COLUMN     "locationId" TEXT NOT NULL,
ALTER COLUMN "licenseNumber" DROP NOT NULL,
ALTER COLUMN "experienceYears" DROP NOT NULL,
ALTER COLUMN "consultationFee" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "avatar" TEXT;

-- DropTable
DROP TABLE "public"."DoctorAvailability";

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "doctorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "doctorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_specialties" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableToday" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_specialty_cache" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "doctorCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minFee" DECIMAL(10,2),
    "maxFee" DECIMAL(10,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_specialty_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_specialty_timeslot_cache" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "doctorCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_specialty_timeslot_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locations_city_idx" ON "locations"("city");

-- CreateIndex
CREATE UNIQUE INDEX "locations_city_state_country_key" ON "locations"("city", "state", "country");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- CreateIndex
CREATE INDEX "specialties_name_idx" ON "specialties"("name");

-- CreateIndex
CREATE INDEX "doctor_specialties_doctorId_idx" ON "doctor_specialties"("doctorId");

-- CreateIndex
CREATE INDEX "doctor_specialties_specialtyId_idx" ON "doctor_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialties_doctorId_specialtyId_key" ON "doctor_specialties"("doctorId", "specialtyId");

-- CreateIndex
CREATE INDEX "TimeSlot_doctorId_idx" ON "TimeSlot"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_doctorId_dayOfWeek_startTime_key" ON "TimeSlot"("doctorId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "reviews_doctorId_idx" ON "reviews"("doctorId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_patientId_doctorId_key" ON "reviews"("patientId", "doctorId");

-- CreateIndex
CREATE INDEX "location_specialty_cache_locationId_idx" ON "location_specialty_cache"("locationId");

-- CreateIndex
CREATE INDEX "location_specialty_cache_specialtyId_idx" ON "location_specialty_cache"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "location_specialty_cache_locationId_specialtyId_key" ON "location_specialty_cache"("locationId", "specialtyId");

-- CreateIndex
CREATE INDEX "location_specialty_timeslot_cache_locationId_idx" ON "location_specialty_timeslot_cache"("locationId");

-- CreateIndex
CREATE INDEX "location_specialty_timeslot_cache_specialtyId_idx" ON "location_specialty_timeslot_cache"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "location_specialty_timeslot_cache_locationId_specialtyId_da_key" ON "location_specialty_timeslot_cache"("locationId", "specialtyId", "dayOfWeek", "timeSlot");

-- CreateIndex
CREATE INDEX "Doctor_locationId_idx" ON "Doctor"("locationId");

-- CreateIndex
CREATE INDEX "Doctor_cityName_idx" ON "Doctor"("cityName");

-- CreateIndex
CREATE INDEX "Doctor_isAvailable_idx" ON "Doctor"("isAvailable");

-- RenameForeignKey
ALTER TABLE "accounts" RENAME CONSTRAINT "Account_userId_fkey" TO "accounts_userId_fkey";

-- RenameForeignKey
ALTER TABLE "sessions" RENAME CONSTRAINT "Session_userId_fkey" TO "sessions_userId_fkey";

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_specialty_cache" ADD CONSTRAINT "location_specialty_cache_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_specialty_cache" ADD CONSTRAINT "location_specialty_cache_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_specialty_timeslot_cache" ADD CONSTRAINT "location_specialty_timeslot_cache_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_specialty_timeslot_cache" ADD CONSTRAINT "location_specialty_timeslot_cache_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

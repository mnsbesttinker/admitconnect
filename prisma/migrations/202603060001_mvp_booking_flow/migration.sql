-- MVP booking flow baseline schema
CREATE TYPE "UserRole" AS ENUM ('student', 'tutor');
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "timezone" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "TutorProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "school" TEXT NOT NULL,
  "major" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "specialties" TEXT NOT NULL,
  "hourlyRate" INTEGER NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudentProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "country" TEXT,
  "intendedMajor" TEXT,
  "curriculum" TEXT,
  "satScore" INTEGER,
  CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AvailabilitySlot" (
  "id" TEXT PRIMARY KEY,
  "tutorUserId" TEXT NOT NULL,
  "startTimeUtc" TIMESTAMP(3) NOT NULL,
  "endTimeUtc" TIMESTAMP(3) NOT NULL,
  "isBooked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AvailabilitySlot_tutorUserId_fkey" FOREIGN KEY ("tutorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "AvailabilitySlot_tutorUserId_startTimeUtc_idx" ON "AvailabilitySlot"("tutorUserId", "startTimeUtc");

CREATE TABLE "Booking" (
  "id" TEXT PRIMARY KEY,
  "studentUserId" TEXT NOT NULL,
  "tutorUserId" TEXT NOT NULL,
  "slotId" TEXT NOT NULL UNIQUE,
  "status" "BookingStatus" NOT NULL DEFAULT 'confirmed',
  "googleMeetLink" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Booking_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Booking_tutorUserId_fkey" FOREIGN KEY ("tutorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Booking_studentUserId_createdAt_idx" ON "Booking"("studentUserId", "createdAt");
CREATE INDEX "Booking_tutorUserId_createdAt_idx" ON "Booking"("tutorUserId", "createdAt");

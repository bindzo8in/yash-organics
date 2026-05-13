-- This migration documents columns that already exist in production DB.

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "otp" TEXT,
ADD COLUMN IF NOT EXISTS "otpExpires" TIMESTAMP(3);
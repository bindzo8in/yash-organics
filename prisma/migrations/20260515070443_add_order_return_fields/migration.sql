-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'RETURN_REQUESTED';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURN_APPROVED';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURN_REJECTED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "returnApprovedAt" TIMESTAMP(3),
ADD COLUMN     "returnReason" TEXT,
ADD COLUMN     "returnRejectedAt" TIMESTAMP(3),
ADD COLUMN     "returnRequestedAt" TIMESTAMP(3),
ADD COLUMN     "returnedAt" TIMESTAMP(3);

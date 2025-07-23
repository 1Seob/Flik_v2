-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('NONE', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "user-book" ADD COLUMN     "challengeStartDate" TIMESTAMP(3),
ADD COLUMN     "challengeSuccess" BOOLEAN DEFAULT false,
ADD COLUMN     "challengeType" "ChallengeType" DEFAULT 'NONE',
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;


-- AlterEnum
BEGIN;
CREATE TYPE "public"."ChallengeStatus_new" AS ENUM ('PREPARING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."challenge" ALTER COLUMN "status" TYPE "public"."ChallengeStatus_new" USING ("status"::text::"public"."ChallengeStatus_new");
ALTER TYPE "public"."ChallengeStatus" RENAME TO "ChallengeStatus_old";
ALTER TYPE "public"."ChallengeStatus_new" RENAME TO "ChallengeStatus";
DROP TYPE "public"."ChallengeStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ChallengeType_new" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR');
ALTER TABLE "public"."challenge" ALTER COLUMN "challengeType" TYPE "public"."ChallengeType_new" USING ("challengeType"::text::"public"."ChallengeType_new");
ALTER TYPE "public"."ChallengeType" RENAME TO "ChallengeType_old";
ALTER TYPE "public"."ChallengeType_new" RENAME TO "ChallengeType";
DROP TYPE "public"."ChallengeType_old";
COMMIT;
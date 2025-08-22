-- DropIndex
DROP INDEX "public"."challenge_visibility_status_start_at_idx";

-- AlterTable
ALTER TABLE "public"."challenge" DROP COLUMN "capacity",
DROP COLUMN "image_path",
DROP COLUMN "status",
ADD COLUMN     "cancelled_at" TIMESTAMP(3);

-- DropEnum
DROP TYPE "public"."ChallengeStatus";

-- CreateIndex
CREATE INDEX "challenge_visibility_start_at_idx" ON "public"."challenge"("visibility", "start_at");
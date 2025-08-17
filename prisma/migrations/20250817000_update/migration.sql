-- CreateEnum
CREATE TYPE "public"."ParticipantStatus" AS ENUM ('JOINED', 'LEFT');

-- CreateEnum
CREATE TYPE "public"."NotificationTarget" AS ENUM ('CHALLENGE');

-- DropForeignKey
ALTER TABLE "public"."book-like" DROP CONSTRAINT "book-like_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."book-save" DROP CONSTRAINT "book-save_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge" DROP CONSTRAINT "challenge_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge-join" DROP CONSTRAINT "challenge-join_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge-join" DROP CONSTRAINT "challenge-join_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."paragraph-like" DROP CONSTRAINT "paragraph-like_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_challenge_join_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."review-like" DROP CONSTRAINT "review-like_userId_fkey";

-- DropIndex
DROP INDEX "public"."reading-log_book_id_page_id_idx";

-- DropIndex
DROP INDEX "public"."reading-log_challenge_join_id_idx";

-- DropIndex
DROP INDEX "public"."reading-log_reading_type_idx";

-- DropIndex
DROP INDEX "public"."reading-log_turn_direction_occurred_at_idx";

-- DropIndex
DROP INDEX "public"."reading-log_user_id_book_id_occurred_at_idx";

-- DropIndex
DROP INDEX "public"."reading-log_user_id_occurred_at_idx";

-- DropIndex
DROP INDEX "public"."user_supabase_id_key";

-- AlterTable
ALTER TABLE "public"."book-like" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."book-save" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."challenge" DROP COLUMN "challengeType",
DROP COLUMN "kind",
DROP COLUMN "last_notified_at",
DROP COLUMN "notify_enabled",
DROP COLUMN "notify_minute_of_day",
ALTER COLUMN "owner_user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."page" DROP COLUMN "order",
ADD COLUMN     "number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."paragraph-like" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."reading-log" DROP COLUMN "challenge_join_id",
DROP COLUMN "occurred_at",
DROP COLUMN "page_order",
DROP COLUMN "reading_type",
DROP COLUMN "turn_direction",
ADD COLUMN     "duration_sec" INTEGER,
ADD COLUMN     "ended_at" TIMESTAMP(3),
ADD COLUMN     "page_number" INTEGER NOT NULL,
ADD COLUMN     "participant_id" INTEGER,
ADD COLUMN     "started_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."review" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."review-like" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."user" DROP CONSTRAINT "user_pkey",
DROP COLUMN "supabase_id",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- DropTable
DROP TABLE "public"."challenge-join";

-- DropEnum
DROP TYPE "public"."ChallengeJoinStatus";

-- DropEnum
DROP TYPE "public"."ChallengeKind";

-- DropEnum
DROP TYPE "public"."ChallengeType";

-- DropEnum
DROP TYPE "public"."ReadingType";

-- DropEnum
DROP TYPE "public"."TurnDirection";

-- CreateTable
CREATE TABLE "public"."participant" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "status" "public"."ParticipantStatus" NOT NULL,

    CONSTRAINT "participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "public"."NotificationTarget" NOT NULL,
    "target_id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "minute_of_day" INTEGER,
    "last_notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "participant_user_id_idx" ON "public"."participant"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "participant_challenge_id_user_id_key" ON "public"."participant"("challenge_id", "user_id");

-- CreateIndex
CREATE INDEX "notification_enabled_idx" ON "public"."notification"("enabled");

-- CreateIndex
CREATE INDEX "notification_user_id_target_type_target_id_idx" ON "public"."notification"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_user_id_target_type_target_id_key" ON "public"."notification"("user_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "reading-log_user_id_started_at_idx" ON "public"."reading-log"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "reading-log_user_id_ended_at_idx" ON "public"."reading-log"("user_id", "ended_at");

-- CreateIndex
CREATE INDEX "reading-log_user_id_book_id_started_at_idx" ON "public"."reading-log"("user_id", "book_id", "started_at");

-- CreateIndex
CREATE INDEX "reading-log_book_id_page_id_started_at_idx" ON "public"."reading-log"("book_id", "page_id", "started_at");

-- CreateIndex
CREATE INDEX "reading-log_participant_id_started_at_idx" ON "public"."reading-log"("participant_id", "started_at");

-- AddForeignKey
ALTER TABLE "public"."paragraph-like" ADD CONSTRAINT "paragraph-like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book-like" ADD CONSTRAINT "book-like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book-save" ADD CONSTRAINT "book-save_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review-like" ADD CONSTRAINT "review-like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge" ADD CONSTRAINT "challenge_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participant" ADD CONSTRAINT "participant_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participant" ADD CONSTRAINT "participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
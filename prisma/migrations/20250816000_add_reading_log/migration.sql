-- CreateEnum
CREATE TYPE "public"."TurnDirection" AS ENUM ('OPEN', 'NEXT', 'PREV');

-- CreateEnum
CREATE TYPE "public"."ReadingType" AS ENUM ('GENERAL', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "public"."ChallengeKind" AS ENUM ('SOLO', 'GROUP');

-- CreateEnum
CREATE TYPE "public"."ChallengeVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."ChallengeStatus" AS ENUM ('PREPARING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SCHEDULED', 'RUNNING');

-- CreateEnum
CREATE TYPE "public"."ChallengeJoinStatus" AS ENUM ('JOINED', 'LEFT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ChallengeType" ADD VALUE 'ONE';
ALTER TYPE "public"."ChallengeType" ADD VALUE 'TWO';
ALTER TYPE "public"."ChallengeType" ADD VALUE 'THREE';
ALTER TYPE "public"."ChallengeType" ADD VALUE 'FOUR';

-- DropForeignKey
ALTER TABLE "public"."user-book" DROP CONSTRAINT "user-book_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user-book" DROP CONSTRAINT "user-book_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user-reading-activity" DROP CONSTRAINT "user-reading-activity_book_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user-reading-activity" DROP CONSTRAINT "user-reading-activity_paragraph_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user-reading-activity" DROP CONSTRAINT "user-reading-activity_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."book" DROP COLUMN "totalParagraphsCount",
ADD COLUMN     "totalPagesCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."user-book";

-- DropTable
DROP TABLE "public"."user-reading-activity";

-- CreateTable
CREATE TABLE "public"."page" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reading_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_order" INTEGER NOT NULL,
    "reading_type" "public"."ReadingType" NOT NULL DEFAULT 'GENERAL',
    "challenge_join_id" INTEGER,
    "turn_direction" "public"."TurnDirection" NOT NULL DEFAULT 'OPEN',
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "owner_user_id" INTEGER NOT NULL,
    "image_path" TEXT,
    "book_id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "challengeType" "public"."ChallengeType",
    "kind" "public"."ChallengeKind" NOT NULL,
    "visibility" "public"."ChallengeVisibility" NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."ChallengeStatus" NOT NULL,
    "notify_enabled" BOOLEAN NOT NULL DEFAULT false,
    "notify_minute_of_day" INTEGER,
    "last_notified_at" TIMESTAMP(3),

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge_join" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_page_order" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "left_at" TIMESTAMP(3),
    "status" "public"."ChallengeJoinStatus" NOT NULL,
    "notify_muted" BOOLEAN NOT NULL DEFAULT false,
    "notify_minute_of_day_override" INTEGER,

    CONSTRAINT "challenge_join_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_log_user_id_occurred_at_idx" ON "public"."reading_log"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "reading_log_user_id_book_id_occurred_at_idx" ON "public"."reading_log"("user_id", "book_id", "occurred_at");

-- CreateIndex
CREATE INDEX "reading_log_book_id_page_id_idx" ON "public"."reading_log"("book_id", "page_id");

-- CreateIndex
CREATE INDEX "reading_log_challenge_join_id_idx" ON "public"."reading_log"("challenge_join_id");

-- CreateIndex
CREATE INDEX "reading_log_reading_type_idx" ON "public"."reading_log"("reading_type");

-- CreateIndex
CREATE INDEX "reading_log_turn_direction_occurred_at_idx" ON "public"."reading_log"("turn_direction", "occurred_at");

-- CreateIndex
CREATE INDEX "challenge_visibility_status_start_at_idx" ON "public"."challenge"("visibility", "status", "start_at");

-- CreateIndex
CREATE INDEX "challenge_book_id_idx" ON "public"."challenge"("book_id");

-- CreateIndex
CREATE INDEX "challenge_owner_user_id_idx" ON "public"."challenge"("owner_user_id");

-- CreateIndex
CREATE INDEX "challenge_join_user_id_idx" ON "public"."challenge_join"("user_id");

-- CreateIndex
CREATE INDEX "challenge_join_challenge_id_completed_at_idx" ON "public"."challenge_join"("challenge_id", "completed_at");

-- CreateIndex
CREATE INDEX "challenge_join_challenge_id_last_page_order_idx" ON "public"."challenge_join"("challenge_id", "last_page_order");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_join_challenge_id_user_id_key" ON "public"."challenge_join"("challenge_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."page" ADD CONSTRAINT "page_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_challenge_join_id_fkey" FOREIGN KEY ("challenge_join_id") REFERENCES "public"."challenge_join"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge" ADD CONSTRAINT "challenge_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge" ADD CONSTRAINT "challenge_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_join" ADD CONSTRAINT "challenge_join_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_join" ADD CONSTRAINT "challenge_join_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
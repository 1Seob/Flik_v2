-- DropForeignKey
ALTER TABLE "public"."challenge_join" DROP CONSTRAINT "challenge_join_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_join" DROP CONSTRAINT "challenge_join_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading_log" DROP CONSTRAINT "reading_log_book_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading_log" DROP CONSTRAINT "reading_log_challenge_join_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading_log" DROP CONSTRAINT "reading_log_page_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading_log" DROP CONSTRAINT "reading_log_user_id_fkey";

-- DropTable
DROP TABLE "public"."challenge_join";

-- DropTable
DROP TABLE "public"."reading_log";

-- CreateTable
CREATE TABLE "public"."reading-log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_order" INTEGER NOT NULL,
    "reading_type" "public"."ReadingType" NOT NULL DEFAULT 'GENERAL',
    "challenge_join_id" INTEGER,
    "turn_direction" "public"."TurnDirection" NOT NULL DEFAULT 'OPEN',
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading-log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge-join" (
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

    CONSTRAINT "challenge-join_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading-log_user_id_occurred_at_idx" ON "public"."reading-log"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "reading-log_user_id_book_id_occurred_at_idx" ON "public"."reading-log"("user_id", "book_id", "occurred_at");

-- CreateIndex
CREATE INDEX "reading-log_book_id_page_id_idx" ON "public"."reading-log"("book_id", "page_id");

-- CreateIndex
CREATE INDEX "reading-log_challenge_join_id_idx" ON "public"."reading-log"("challenge_join_id");

-- CreateIndex
CREATE INDEX "reading-log_reading_type_idx" ON "public"."reading-log"("reading_type");

-- CreateIndex
CREATE INDEX "reading-log_turn_direction_occurred_at_idx" ON "public"."reading-log"("turn_direction", "occurred_at");

-- CreateIndex
CREATE INDEX "challenge-join_user_id_idx" ON "public"."challenge-join"("user_id");

-- CreateIndex
CREATE INDEX "challenge-join_challenge_id_completed_at_idx" ON "public"."challenge-join"("challenge_id", "completed_at");

-- CreateIndex
CREATE INDEX "challenge-join_challenge_id_last_page_order_idx" ON "public"."challenge-join"("challenge_id", "last_page_order");

-- CreateIndex
CREATE UNIQUE INDEX "challenge-join_challenge_id_user_id_key" ON "public"."challenge-join"("challenge_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_challenge_join_id_fkey" FOREIGN KEY ("challenge_join_id") REFERENCES "public"."challenge-join"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge-join" ADD CONSTRAINT "challenge-join_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge-join" ADD CONSTRAINT "challenge-join_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
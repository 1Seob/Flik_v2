-- DropForeignKey
ALTER TABLE "public"."participant" DROP CONSTRAINT "participant_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."participant" DROP CONSTRAINT "participant_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_participant_id_fkey";

-- DropTable
DROP TABLE "public"."participant";

-- CreateTable
CREATE TABLE "public"."challenge_join" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "status" "public"."ParticipantStatus" NOT NULL,

    CONSTRAINT "challenge_join_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_join_user_id_idx" ON "public"."challenge_join"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_join_challenge_id_user_id_key" ON "public"."challenge_join"("challenge_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."reading-log" ADD CONSTRAINT "reading-log_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."challenge_join"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_join" ADD CONSTRAINT "challenge_join_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_join" ADD CONSTRAINT "challenge_join_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
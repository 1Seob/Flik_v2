-- DropForeignKey
ALTER TABLE "public"."challenge" DROP CONSTRAINT "challenge_book_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge" DROP CONSTRAINT "challenge_host_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_join" DROP CONSTRAINT "challenge_join_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_join" DROP CONSTRAINT "challenge_join_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_note" DROP CONSTRAINT "challenge_note_author_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_note" DROP CONSTRAINT "challenge_note_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_note_comment" DROP CONSTRAINT "challenge_note_comment_note_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_note_comment" DROP CONSTRAINT "challenge_note_comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_note_like" DROP CONSTRAINT "challenge_note_like_note_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."challenge_note_like" DROP CONSTRAINT "challenge_note_like_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_participant_id_fkey";

-- DropIndex
DROP INDEX "public"."reading-log_participant_id_started_at_idx";

-- AlterTable
ALTER TABLE "public"."reading-log" DROP COLUMN "participant_id";

-- DropTable
DROP TABLE "public"."challenge";

-- DropTable
DROP TABLE "public"."challenge_join";

-- DropTable
DROP TABLE "public"."challenge_note";

-- DropTable
DROP TABLE "public"."challenge_note_comment";

-- DropTable
DROP TABLE "public"."challenge_note_like";

-- DropEnum
DROP TYPE "public"."ChallengeVisibility";

-- DropEnum
DROP TYPE "public"."ParticipantStatus";
-- DropIndex
DROP INDEX "user-reading-activity_user_id_book_id_paragraph_id_read_at_key";

-- AlterTable
ALTER TABLE "user-reading-activity" DROP COLUMN "daily_goal",
DROP COLUMN "read_at",
ADD COLUMN     "ended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_read_paragraph_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "completed_at" DROP DEFAULT;
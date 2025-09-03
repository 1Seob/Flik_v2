-- DropForeignKey
ALTER TABLE "public"."challenge_note" DROP CONSTRAINT "challenge_note_quote_like_id_fkey";

-- AlterTable
ALTER TABLE "public"."challenge_note" DROP COLUMN "quote_like_id",
ADD COLUMN     "quote_book_id" INTEGER,
ADD COLUMN     "quote_page_id" INTEGER,
ADD COLUMN     "quote_text" TEXT;
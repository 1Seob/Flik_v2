-- DropForeignKey
ALTER TABLE "public"."challenge_note" DROP CONSTRAINT "challenge_note_quote_page_id_fkey";

-- AlterTable
ALTER TABLE "public"."challenge_note" DROP COLUMN "quote_page_id",
DROP COLUMN "quote_text",
ADD COLUMN     "image_path" TEXT,
ADD COLUMN     "quote_like_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."sentence_like" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentence_like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentence_like_user_id_created_at_idx" ON "public"."sentence_like"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sentence_like_book_id_page_id_idx" ON "public"."sentence_like"("book_id", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "sentence_like_id_user_id_key" ON "public"."sentence_like"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sentence_like_user_id_page_id_text_key" ON "public"."sentence_like"("user_id", "page_id", "text");

-- AddForeignKey
ALTER TABLE "public"."challenge_note" ADD CONSTRAINT "challenge_note_quote_like_id_fkey" FOREIGN KEY ("quote_like_id") REFERENCES "public"."sentence_like"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sentence_like" ADD CONSTRAINT "sentence_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sentence_like" ADD CONSTRAINT "sentence_like_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sentence_like" ADD CONSTRAINT "sentence_like_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
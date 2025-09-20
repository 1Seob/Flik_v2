-- DropForeignKey
ALTER TABLE "public"."book-save" DROP CONSTRAINT "book-save_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."book-save" DROP CONSTRAINT "book-save_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_book_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_page_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reading-log" DROP CONSTRAINT "reading-log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."review-like" DROP CONSTRAINT "review-like_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."review-like" DROP CONSTRAINT "review-like_userId_fkey";

-- DropTable
DROP TABLE "public"."book-save";

-- DropTable
DROP TABLE "public"."reading-log";

-- DropTable
DROP TABLE "public"."review-like";

-- CreateTable
CREATE TABLE "public"."book_save" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_save_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_like" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "review_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reading_log" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" INTEGER NOT NULL,
    "page_id" INTEGER NOT NULL,
    "page_number" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration_sec" INTEGER,

    CONSTRAINT "reading_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_save_userId_bookId_key" ON "public"."book_save"("userId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "review_like_userId_reviewId_key" ON "public"."review_like"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "reading_log_user_id_started_at_idx" ON "public"."reading_log"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "reading_log_user_id_ended_at_idx" ON "public"."reading_log"("user_id", "ended_at");

-- CreateIndex
CREATE INDEX "reading_log_user_id_book_id_started_at_idx" ON "public"."reading_log"("user_id", "book_id", "started_at");

-- CreateIndex
CREATE INDEX "reading_log_book_id_page_id_started_at_idx" ON "public"."reading_log"("book_id", "page_id", "started_at");

-- AddForeignKey
ALTER TABLE "public"."book_save" ADD CONSTRAINT "book_save_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_save" ADD CONSTRAINT "book_save_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_like" ADD CONSTRAINT "review_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_like" ADD CONSTRAINT "review_like_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reading_log" ADD CONSTRAINT "reading_log_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
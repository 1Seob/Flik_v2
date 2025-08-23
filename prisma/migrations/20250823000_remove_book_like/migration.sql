-- DropForeignKey
ALTER TABLE "public"."book-like" DROP CONSTRAINT "book-like_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."book-like" DROP CONSTRAINT "book-like_userId_fkey";

-- DropTable
DROP TABLE "public"."book-like";
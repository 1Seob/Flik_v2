-- DropForeignKey
ALTER TABLE "public"."paragraph" DROP CONSTRAINT "paragraph_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."paragraph-like" DROP CONSTRAINT "paragraph-like_paragraphId_fkey";

-- DropForeignKey
ALTER TABLE "public"."paragraph-like" DROP CONSTRAINT "paragraph-like_userId_fkey";

-- DropTable
DROP TABLE "public"."paragraph";

-- DropTable
DROP TABLE "public"."paragraph-like";
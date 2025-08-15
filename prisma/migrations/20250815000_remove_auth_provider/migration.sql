-- DropForeignKey
ALTER TABLE "public"."user-category" DROP CONSTRAINT "user-category_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user-category" DROP CONSTRAINT "user-category_userId_fkey";

-- DropIndex
DROP INDEX "public"."user_provider_providerId_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "provider",
DROP COLUMN "providerId",
DROP COLUMN "refresh_token",
ADD COLUMN     "supabaseId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."category";

-- DropTable
DROP TABLE "public"."provider_config";

-- DropTable
DROP TABLE "public"."user-category";

-- DropEnum
DROP TYPE "public"."AuthProvider";

-- CreateIndex
CREATE UNIQUE INDEX "user_supabaseId_key" ON "public"."user"("supabaseId");
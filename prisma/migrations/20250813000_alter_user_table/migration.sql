-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('GOOGLE', 'KAKAO', 'NAVER', 'APPLE');

-- DropIndex
DROP INDEX "public"."user_email_key";

-- DropIndex
DROP INDEX "public"."user_login_id_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "email",
DROP COLUMN "login_id",
DROP COLUMN "password",
ADD COLUMN     "provider" "public"."AuthProvider" NOT NULL,
ADD COLUMN     "providerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_provider_providerId_key" ON "public"."user"("provider", "providerId");
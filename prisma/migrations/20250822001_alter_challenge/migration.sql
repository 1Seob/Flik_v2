-- DropForeignKey
ALTER TABLE "public"."challenge" DROP CONSTRAINT "challenge_owner_user_id_fkey";

-- DropIndex
DROP INDEX "public"."challenge_owner_user_id_idx";

-- AlterTable
ALTER TABLE "public"."challenge" DROP COLUMN "owner_user_id",
ADD COLUMN     "host_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "challenge_host_id_idx" ON "public"."challenge"("host_id");

-- AddForeignKey
ALTER TABLE "public"."challenge" ADD CONSTRAINT "challenge_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
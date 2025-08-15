-- DropIndex
DROP INDEX "public"."user_supabaseId_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "supabaseId",
ADD COLUMN     "supabase_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_supabase_id_key" ON "public"."user"("supabase_id");
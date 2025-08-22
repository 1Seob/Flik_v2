-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "last_login_at" SET NOT NULL,
ALTER COLUMN "last_login_at" SET DEFAULT CURRENT_TIMESTAMP;
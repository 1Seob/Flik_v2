-- AlterTable
ALTER TABLE "user" DROP COLUMN "profile_image_url",
ADD COLUMN     "profile_image_path" TEXT;
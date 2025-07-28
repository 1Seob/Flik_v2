-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('FIND_ID', 'RESET_PASSWORD');

-- CreateTable
CREATE TABLE "AuthAttempt" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthAttempt_email_key" ON "AuthAttempt"("email");
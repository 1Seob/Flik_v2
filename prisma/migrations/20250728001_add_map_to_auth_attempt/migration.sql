-- DropTable
DROP TABLE "AuthAttempt";

-- CreateTable
CREATE TABLE "auth-attempt" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth-attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth-attempt_email_key" ON "auth-attempt"("email");
-- CreateTable
CREATE TABLE "auth-code" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "try_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "auth-code_pkey" PRIMARY KEY ("id")
);


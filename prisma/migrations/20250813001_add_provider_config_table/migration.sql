-- CreateTable
CREATE TABLE "public"."provider_config" (
    "provider" "public"."AuthProvider" NOT NULL,
    "prefix" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_config_pkey" PRIMARY KEY ("provider")
);
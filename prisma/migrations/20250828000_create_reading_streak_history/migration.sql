-- CreateTable
CREATE TABLE "public"."reading_streak_history" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_streak_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_streak_history_user_id_updated_at_idx" ON "public"."reading_streak_history"("user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "public"."reading_streak_history" ADD CONSTRAINT "reading_streak_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
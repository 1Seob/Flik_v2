-- CreateTable
CREATE TABLE "public"."book_completion" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_completion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_completion_user_id_idx" ON "public"."book_completion"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_completion_user_id_book_id_key" ON "public"."book_completion"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "public"."book_completion" ADD CONSTRAINT "book_completion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_completion" ADD CONSTRAINT "book_completion_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
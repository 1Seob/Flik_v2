-- CreateTable
CREATE TABLE "public"."book_ranking" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_ranking_calculated_at_rank_idx" ON "public"."book_ranking"("calculated_at", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "book_ranking_calculated_at_book_id_key" ON "public"."book_ranking"("calculated_at", "book_id");

-- AddForeignKey
ALTER TABLE "public"."book_ranking" ADD CONSTRAINT "book_ranking_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
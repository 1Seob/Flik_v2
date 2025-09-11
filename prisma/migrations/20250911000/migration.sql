-- CreateTable
CREATE TABLE "public"."recommend" (
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "recommend_pkey" PRIMARY KEY ("book_id")
);

-- AddForeignKey
ALTER TABLE "public"."recommend" ADD CONSTRAINT "recommend_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
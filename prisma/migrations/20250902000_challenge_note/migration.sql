-- CreateTable
CREATE TABLE "public"."challenge_note" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "quote_text" TEXT,
    "quote_page_id" INTEGER,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge_note_like" (
    "id" SERIAL NOT NULL,
    "note_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_note_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge_note_comment" (
    "id" SERIAL NOT NULL,
    "note_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_note_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_note_challenge_id_created_at_idx" ON "public"."challenge_note"("challenge_id", "created_at");

-- CreateIndex
CREATE INDEX "challenge_note_author_id_created_at_idx" ON "public"."challenge_note"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "challenge_note_like_user_id_note_id_idx" ON "public"."challenge_note_like"("user_id", "note_id");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_note_like_note_id_user_id_key" ON "public"."challenge_note_like"("note_id", "user_id");

-- CreateIndex
CREATE INDEX "challenge_note_comment_note_id_created_at_idx" ON "public"."challenge_note_comment"("note_id", "created_at");

-- CreateIndex
CREATE INDEX "challenge_note_comment_user_id_created_at_idx" ON "public"."challenge_note_comment"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "public"."challenge_note" ADD CONSTRAINT "challenge_note_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_note" ADD CONSTRAINT "challenge_note_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_note" ADD CONSTRAINT "challenge_note_quote_page_id_fkey" FOREIGN KEY ("quote_page_id") REFERENCES "public"."page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_note_like" ADD CONSTRAINT "challenge_note_like_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."challenge_note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_note_like" ADD CONSTRAINT "challenge_note_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_note_comment" ADD CONSTRAINT "challenge_note_comment_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."challenge_note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."challenge_note_comment" ADD CONSTRAINT "challenge_note_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
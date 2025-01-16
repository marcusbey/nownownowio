-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_posts_created_at" ON "Post"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_posts_user_id" ON "Post"("userId");
CREATE INDEX IF NOT EXISTS "idx_likes_user_post" ON "Like"("userId", "postId");
CREATE INDEX IF NOT EXISTS "idx_bookmarks_user_post" ON "Bookmark"("userId", "postId");
CREATE INDEX IF NOT EXISTS "idx_comments_post_id" ON "Comment"("postId");

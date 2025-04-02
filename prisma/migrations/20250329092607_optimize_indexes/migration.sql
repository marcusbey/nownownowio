-- Add indexes to Post model
CREATE INDEX IF NOT EXISTS "Post_isPinned_createdAt_idx" ON "posts" ("isPinned", "createdAt");

-- Add indexes to Comment model
CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx" ON "comments" ("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "comments" ("userId");

-- Add indexes to Like model
CREATE INDEX IF NOT EXISTS "Like_postId_idx" ON "likes" ("postId");
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "likes" ("userId");

-- Add indexes to PostView model
CREATE INDEX IF NOT EXISTS "PostView_postId_viewedAt_idx" ON "PostView" ("postId", "viewedAt");

-- Add indexes to User model
CREATE INDEX IF NOT EXISTS "User_displayName_idx" ON "User" ("displayName");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User" ("email");

-- Add indexes to Bookmark model
CREATE INDEX IF NOT EXISTS "Bookmark_userId_createdAt_idx" ON "bookmarks" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Bookmark_postId_idx" ON "bookmarks" ("postId");

-- Add indexes to Notification model
CREATE INDEX IF NOT EXISTS "Notification_recipientId_createdAt_idx" ON "notifications" ("recipientId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_recipientId_read_idx" ON "notifications" ("recipientId", "read");

-- Add indexes to WidgetFeedback model
CREATE INDEX IF NOT EXISTS "WidgetFeedback_organizationId_status_idx" ON "WidgetFeedback" ("organizationId", "status");
CREATE INDEX IF NOT EXISTS "WidgetFeedback_organizationId_votes_idx" ON "WidgetFeedback" ("organizationId", "votes");
CREATE INDEX IF NOT EXISTS "WidgetFeedback_organizationId_createdAt_idx" ON "WidgetFeedback" ("organizationId", "createdAt");

Implement file upload functionality
Add image preview functionality
Implement emoji picker
Add drag and drop support for files

////

INPUT:

- Line height
- Grip size
- new line default - paragraph
-

data for post-Endpoit :
Data needed for org-posts endpoint:
Post ID
Post content/body
Creation date
Author info (name, image)
Post title (if applicable)
Media/attachments
Comment count
Like count
View count
Hashtags (if your system supports them)

Endpoints :
/api/v1/widget/org-info - Get organization information
/api/v1/widget/org-posts - Get posts for an organization
/api/v1/widget/post-comments - Get comments for a post
/api/v1/widget/add-comment - Add a comment to a post
/api/v1/widget/toggle-like - Toggle like status for a post
/api/v1/widget/toggle-bookmark - Toggle bookmark status for a post
/api/v1/widget/track-view - Track a view for a post
/api/v1/widget/feedback - Submit and retrieve feedback (supports GET, POST, PUT

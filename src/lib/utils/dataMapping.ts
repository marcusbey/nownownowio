import { Post } from "@/lib/types";

export function mapPostCounts(posts: Post[]): Post[] {
    return posts.map((post) => ({
        ...post,
        _count: {
            comments: post.comments.length,
            bookmarks: post.bookmarks.length,
        },
    }));
}
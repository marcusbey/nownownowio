"use client";

import { Card } from "@/components/ui/card";
import { usePostViews } from "@/hooks/use-post-views";
import type { Post } from "@prisma/client";
import { formatDistance } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PostWithAuthor = Post & {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count?: {
    comments: number;
    likes: number;
    views: number;
  };
};

type PostCardProps = {
  post: PostWithAuthor;
  hideAuthor?: boolean;
};

export function PostCard({ post, hideAuthor = false }: PostCardProps) {
  const router = useRouter();
  const hasTracked = useRef(false);
  const { trackView } = usePostViews(post.id);

  // Track post view when the component mounts
  useEffect(() => {
    if (hasTracked.current) return;

    // Only track view if the post is actually visible on screen for a bit
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
          trackView();
          hasTracked.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    const postElement = document.getElementById(`post-${post.id}`);
    if (postElement) {
      observer.observe(postElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [post.id, trackView]);

  // Format the date for display
  const formattedDate = formatDistance(new Date(post.createdAt), new Date(), {
    addSuffix: true,
  });

  // Truncate the content if it's too long
  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return `${content.slice(0, maxLength)}...`;
  };

  const contentPreview = post.content ? truncateContent(post.content) : "";

  return (
    <Card
      id={`post-${post.id}`}
      className="cursor-pointer p-5 transition-shadow duration-200 hover:shadow-md"
      onClick={() => router.push(`/posts/${post.id}`)}
    >
      {/* Author info */}
      {!hideAuthor && post.author && (
        <div className="mb-4 flex items-center gap-3">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name || "Author"}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              {post.author.name?.charAt(0) || "A"}
            </div>
          )}
          <div>
            <p className="font-medium">{post.author.name || "Anonymous"}</p>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
      )}

      {/* Post title */}
      <h3 className="mb-2 text-xl font-bold">{post.title}</h3>

      {/* Post content preview */}
      {contentPreview && (
        <p className="mb-4 text-muted-foreground">{contentPreview}</p>
      )}

      {/* Featured image if available */}
      {post.imageUrl && (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-md">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Post stats */}
      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
        <span>{post._count?.views || 0} views</span>
        <span>{post._count?.likes || 0} likes</span>
        <span>{post._count?.comments || 0} comments</span>
      </div>
    </Card>
  );
}

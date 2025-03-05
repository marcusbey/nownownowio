"use client";

import { Button } from "@/components/core/button";
import { ScrollArea } from "@/components/layout/scroll-area";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import kyInstance from "@/lib/ky";
import type { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Comment from "./Comment";
import CommentInput from "./CommentInput";

type CommentsProps = {
  post: PostData;
  showInput?: boolean;
};

export default function Comments({ post, showInput = true }: CommentsProps) {
  const { data: session, status } = useSession();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status: queryStatus,
    error,
  } = useInfiniteQuery({
    queryKey: ["comments", post.id],
    queryFn: async ({ pageParam }) => {
      try {
        return await kyInstance
          .get(
            ENDPOINTS.POST_COMMENTS(post.id),
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>();
      } catch (err) {
        console.error(`Error fetching comments for post ${post.id}:`, err);
        throw err;
      }
    },
    // Set initial parameters for comment loading
    initialPageParam: null as string | null,
    getNextPageParam: (firstPage) => firstPage.previousCursor,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
    // Add these options to prevent unnecessary refetching
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Get comments and reverse them to show most recent at the top
  const comments = (
    data?.pages.flatMap((page) => page.comments) ?? []
  ).reverse();

  // Get the post owner ID to pass to each Comment component
  const postOwnerId = post.user.id || post.userId;

  // Only fetch next page when Show Previous Comments button is clicked
  // This ensures we don't load comments unnecessarily when comments are closed by default

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2 border-t border-border/30 pt-4"
    >
      {showInput && <CommentInput post={post} />}

      <div className="mt-3 border-t border-border/20 pt-3">
        <ScrollArea className="max-h-[600px] overflow-y-auto pr-3">
          <AnimatePresence mode="popLayout">
            {hasNextPage && (
              <motion.div
                key="load-more-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 flex justify-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 rounded-full border-dashed border-primary/30 bg-background/80 text-sm font-medium text-muted-foreground/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-md"
                  onClick={async () => fetchNextPage()}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                  {isFetching
                    ? "Loading previous comments..."
                    : "Show previous comments"}
                </Button>
              </motion.div>
            )}

            {isFetching && comments.length === 0 && (
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-6"
              >
                <Loader2 className="size-6 animate-spin text-primary/60" />
              </motion.div>
            )}

            {comments.length > 0 ? (
              <div key="comments-list" className="space-y-1.5">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postOwnerId={postOwnerId}
                  />
                ))}
              </div>
            ) : queryStatus === "success" && !isFetching ? (
              <motion.div
                key="empty-comments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-1 py-2 text-center"
              >
                <div className="rounded-full bg-muted/30 p-2 shadow-sm backdrop-blur-sm">
                  <svg
                    className="size-4 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </motion.div>
            ) : null}

            {queryStatus === "error" && (
              <motion.div
                key="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-2 py-6 text-center"
              >
                <div className="rounded-full bg-destructive/10 p-3">
                  <svg
                    className="size-6 text-destructive"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-destructive">
                  Failed to load comments. Please try again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </motion.div>
  );
}

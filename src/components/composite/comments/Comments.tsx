import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/core/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/layout/scroll-area";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/v1/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2 border-t pt-4"
    >
      <CommentInput post={post} />
      
      <ScrollArea className="max-h-[400px] pr-4">
        <AnimatePresence mode="popLayout">
          {hasNextPage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <Button
                variant="ghost"
                size="sm"
                className="mx-auto flex w-full items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                disabled={isFetching}
                onClick={() => fetchNextPage()}
              >
                <ChevronDown className="h-4 w-4" />
                <span>Show previous comments</span>
              </Button>
            </motion.div>
          )}

          {status === "pending" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </motion.div>
          )}

          {status === "success" && !comments.length && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-sm text-muted-foreground"
            >
              Be the first to comment
            </motion.p>
          )}

          {status === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-sm text-destructive"
            >
              Failed to load comments
            </motion.p>
          )}

          <div className="mt-4 space-y-4">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Comment comment={comment} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </motion.div>
  );
}

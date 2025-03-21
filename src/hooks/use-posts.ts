import { fetchPost, fetchPosts, revalidatePostsData } from '@/lib/api/posts';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type PostsQueryParams = {
    page?: number;
    pageSize?: number;
    orgId?: string;
    userId?: string;
    filter?: 'recent' | 'popular' | 'following';
};

/**
 * Hook for fetching posts with React Query caching
 */
export function usePosts(params: PostsQueryParams = {}) {
    return useQuery({
        queryKey: ['posts', params],
        queryFn: async () => fetchPosts(params),
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    });
}

/**
 * Hook for infinite scrolling posts with React Query
 */
export function useInfinitePosts(params: PostsQueryParams = {}) {
    return useInfiniteQuery({
        queryKey: ['infinitePosts', params],
        queryFn: async ({ pageParam = 1 }) =>
            fetchPosts({ ...params, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) => {
            // Check if there are more pages
            if (lastPage.posts.length < (params.pageSize || 10)) {
                return undefined; // No more pages
            }
            return (lastPageParam as number) + 1;
        },
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    });
}

/**
 * Hook for fetching a single post with React Query caching
 */
export function usePost(postId: string) {
    return useQuery({
        queryKey: ['post', postId],
        queryFn: async () => fetchPost(postId),
        staleTime: 60 * 1000, // Consider data fresh for 1 minute
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
        enabled: !!postId, // Only run if postId is provided
    });
}

/**
 * Hook for creating a new post with cache invalidation
 */
export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postData: any) => {
            const response = await fetch('/api/v1/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create post');
            }

            return response.json();
        },
        onSuccess: async (data) => {
            // Invalidate posts queries to refetch with new data
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['infinitePosts'] });

            // Try to revalidate server cache
            await revalidatePostsData(['posts']);

            // Show success toast
            toast.success('Post created successfully');

            return data;
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to create post');
        },
    });
} 
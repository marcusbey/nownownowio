import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// In-memory queue for batching view operations
const viewQueue: {
    postId: string;
    viewerId: string;
    clientIp: string;
}[] = [];

// Processing state
let isProcessing = false;
let queueTimeout: NodeJS.Timeout | null = null;

// Constants
const BATCH_SIZE = 50; // Process 50 views at a time
const BATCH_INTERVAL = 10000; // Process every 10 seconds

/**
 * Queue a post view to be processed in batch
 */
export function queuePostView(postId: string, viewerId: string, clientIp: string) {
    // Skip if missing required data
    if (!postId || !viewerId || !clientIp) {
        logger.warn("Skipping view tracking due to missing data", { postId, viewerId });
        return;
    }

    // Add to queue - avoid duplicates within the same batch
    if (!viewQueue.some(item =>
        item.postId === postId &&
        item.viewerId === viewerId &&
        item.clientIp === clientIp
    )) {
        viewQueue.push({ postId, viewerId, clientIp });
    }

    // Start processing if not already started
    scheduleProcessing();
}

/**
 * Schedule the processing of the view queue
 */
function scheduleProcessing() {
    if (queueTimeout) {
        // Clear existing timeout to avoid duplicate processing
        clearTimeout(queueTimeout);
    }

    // Set a new timeout to process the queue
    queueTimeout = setTimeout(processViewQueue, BATCH_INTERVAL);
}

/**
 * Process the view queue in batches
 */
async function processViewQueue() {
    // Skip if already processing or queue is empty
    if (isProcessing || viewQueue.length === 0) {
        return;
    }

    try {
        isProcessing = true;

        // Get a batch from the queue
        const batch = viewQueue.splice(0, BATCH_SIZE);

        if (batch.length === 0) {
            return;
        }

        // Group by postId for more efficient processing
        const groupedByPost = batch.reduce<Record<string, typeof batch>>((acc, view) => {
            const { postId } = view;
            // Initialize array if it doesn't exist yet (TypeScript-friendly approach)
            acc[postId] = acc[postId] ?? [];
            acc[postId].push(view);
            return acc;
        }, {});

        logger.info(`Processing batch of ${batch.length} post views across ${Object.keys(groupedByPost).length} posts`);

        // Process each post's views in parallel
        await Promise.all(
            Object.entries(groupedByPost).map(async ([postId, views]) => {
                try {
                    // Verify post exists (only once per batch)
                    const post = await prisma.post.findUnique({
                        where: { id: postId },
                        select: { id: true }
                    });

                    if (!post) {
                        logger.warn(`Skipping views for non-existent post: ${postId}`);
                        return;
                    }

                    // Process all views for this post
                    await Promise.all(views.map(async ({ viewerId, clientIp }) => {
                        await prisma.postView.upsert({
                            where: {
                                postId_viewerId_clientIp: {
                                    postId,
                                    viewerId,
                                    clientIp,
                                },
                            },
                            update: {
                                viewedAt: new Date(),
                                // Uncomment when migration is applied
                                source: "app",
                            },
                            create: {
                                post: { connect: { id: postId } },
                                viewerId,
                                clientIp,
                                // Uncomment when migration is applied
                                source: "app",
                            },
                        });
                    }));

                } catch (error) {
                    logger.error(`Error processing views for post ${postId}:`, {
                        error: error instanceof Error ? error.message : String(error),
                        postCount: views.length,
                    });
                }
            })
        );

        logger.info(`Successfully processed ${batch.length} views`);

        // If there are more items in the queue, process them
        if (viewQueue.length > 0) {
            scheduleProcessing();
        }
    } catch (error) {
        logger.error("Error processing view queue:", {
            error: error instanceof Error ? error.message : String(error),
            queueSize: viewQueue.length,
        });
    } finally {
        isProcessing = false;
    }
}

/**
 * For server-side use: track a post view immediately 
 * Use this for critical tracking that shouldn't be batched
 */
export async function trackPostViewImmediately(postId: string, viewerId: string, clientIp: string) {
    try {
        // First check if the post exists
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true }
        });

        if (!post) {
            throw new Error(`Post ${postId} not found`);
        }

        // Then try to upsert the view
        await prisma.postView.upsert({
            where: {
                postId_viewerId_clientIp: {
                    postId,
                    viewerId,
                    clientIp,
                },
            },
            update: {
                viewedAt: new Date(),
                // Uncomment when migration is applied
                source: "app",
            },
            create: {
                post: { connect: { id: postId } },
                viewerId,
                clientIp,
                // Uncomment when migration is applied
                source: "app",
            },
        });

        return true;
    } catch (error) {
        logger.error("Error tracking view immediately:", {
            error: error instanceof Error ? error.message : String(error),
            postId,
            viewerId
        });
        return false;
    }
}

/**
 * Get the total view count for a post
 */
export async function getPostViewCount(postId: string): Promise<number> {
    try {
        return await prisma.postView.count({
            where: { postId },
        });
    } catch (error) {
        logger.error("Error getting view count:", {
            error: error instanceof Error ? error.message : String(error),
            postId
        });
        return 0;
    }
} 
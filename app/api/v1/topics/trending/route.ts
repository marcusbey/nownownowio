import { prisma } from "@/lib/prisma/prisma";
import { baseAuth } from "@/lib/auth/auth";
import { detectTopicFromContent, getAvailableTopics } from "@/lib/topic-detection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view trending topics" },
        { status: 401 }
      );
    }

    // Get recent posts to analyze for trending topics
    const recentPosts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Analyze the 100 most recent posts
      select: {
        id: true,
        content: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true,
          },
        },
      },
    });

    // Calculate topic frequency and engagement
    const topicStats: Record<string, { count: number; engagement: number }> = {};
    const availableTopics = getAvailableTopics().filter(t => t !== 'all');

    // Initialize stats for all available topics
    availableTopics.forEach(topic => {
      topicStats[topic] = { count: 0, engagement: 0 };
    });

    // Process each post
    recentPosts.forEach(post => {
      const detectedTopic = detectTopicFromContent(post.content);
      if (detectedTopic && availableTopics.includes(detectedTopic)) {
        // Increment post count for this topic
        topicStats[detectedTopic].count += 1;
        
        // Add engagement score (likes + comments + views)
        const engagementScore = 
          (post._count.likes || 0) + 
          (post._count.comments || 0) + 
          (post._count.views || 0);
        
        topicStats[detectedTopic].engagement += engagementScore;
      }
    });

    // Calculate trending score and sort topics
    const trendingTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        id: topic,
        label: topic.charAt(0).toUpperCase() + topic.slice(1),
        count: stats.count,
        engagement: stats.engagement,
        trendingScore: stats.count * (1 + stats.engagement / 10), // Weight by both frequency and engagement
      }))
      .filter(topic => topic.count > 0) // Only include topics with at least one post
      .sort((a, b) => b.trendingScore - a.trendingScore);

    return NextResponse.json({
      topics: trendingTopics,
    });
  } catch (error) {
    console.error("[TRENDING_TOPICS_GET_ERROR]", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

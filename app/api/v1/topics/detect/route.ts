import { baseAuth } from "@/lib/auth/auth";
import { getTopicScoreDetails } from "@/lib/topic-detection";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const detectTopicSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to use topic detection" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = detectTopicSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Get detailed topic analysis
    const { content } = validatedData.data;
    const topicAnalysis = getTopicScoreDetails(content);

    return NextResponse.json({
      ...topicAnalysis,
      content: content.length > 100 ? `${content.substring(0, 100)}...` : content,
      contentLength: content.length,
      wordCount: content.split(/\s+/).length,
    });
  } catch (error) {
    console.error("[TOPIC_DETECT_ERROR]", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

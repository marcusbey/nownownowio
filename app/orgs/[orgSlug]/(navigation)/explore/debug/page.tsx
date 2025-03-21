"use client";

import { Button } from "@/components/core/button";
import { Label } from "@/components/core/label";
import { Textarea } from "@/components/core/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Skeleton } from "@/components/feedback/skeleton";
import kyInstance from "@/lib/ky";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function TopicDebugPage() {
  const { data: session, status: sessionStatus } = useSession({
    required: true,
  });
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeContent = async () => {
    if (!content.trim()) {
      setError("Please enter some content to analyze");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await kyInstance
        .post("/api/v1/topics/detect", {
          json: { content },
        })
        .json();

      setResult(response);
    } catch (err) {
      console.error("Error analyzing content:", err);
      setError("Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-xl gap-5 p-4">
      <div className="w-full min-w-0 space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Topic Detection Debug</CardTitle>
            <CardDescription>
              Test the topic detection algorithm with your own content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content to analyze</Label>
              <Textarea
                id="content"
                placeholder="Enter some content to analyze for topic detection..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={analyzeContent}
              disabled={isAnalyzing || !content.trim()}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Content"}
            </Button>
          </CardFooter>
        </Card>

        {isAnalyzing && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        )}

        {result && !isAnalyzing && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Detected Topic</h3>
                <p className="text-lg font-bold">
                  {result.detectedTopic
                    ? result.detectedTopic.charAt(0).toUpperCase() +
                      result.detectedTopic.slice(1)
                    : "No specific topic detected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Topic Scores</h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(result.scores || {}).map(
                    ([topic, score]: [string, any]) => (
                      <div
                        key={topic}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {topic.charAt(0).toUpperCase() + topic.slice(1)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.min(100, Math.round((score / Math.max(...Object.values(result.scores))) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {result.keywordMatches && (
                <div>
                  <h3 className="text-sm font-medium">Keyword Matches</h3>
                  <div className="mt-2 space-y-2">
                    {Object.entries(result.keywordMatches).map(
                      ([topic, keywords]: [string, any]) =>
                        keywords.length > 0 ? (
                          <div key={topic} className="rounded-md border p-2">
                            <h4 className="text-xs font-medium">
                              {topic.charAt(0).toUpperCase() + topic.slice(1)}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {keywords.map((keyword: string, i: number) => (
                                <span
                                  key={`${topic}-${keyword}-${i}`}
                                  className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null,
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium">Content Summary</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.content}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Length: {result.contentLength} characters, {result.wordCount}{" "}
                  words
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

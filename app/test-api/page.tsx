"use client";

import { useState } from "react";

export default function TestApiPage() {
  const [postId, setPostId] = useState("test-post-id");
  const [viewerId, setViewerId] = useState(`test-viewer-${Date.now()}`);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()} - ${message}`]);
  };

  const trackView = async () => {
    try {
      setLoading(true);
      setError(null);
      addLog(`Tracking view for post ${postId} with viewer ${viewerId}`);

      const response = await fetch("/api/v1/posts/track-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, viewerId }),
      });

      const data = await response.json();
      setResponse(data);

      if (!response.ok) {
        addLog(`Error: ${response.status} - ${JSON.stringify(data)}`);
        setError(`Error ${response.status}: ${JSON.stringify(data)}`);
      } else {
        addLog(`Success: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Exception: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testFetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      addLog("Fetching posts to find valid postIds...");

      const response = await fetch("/api/v1/posts?limit=5");
      const data = await response.json();

      if (!response.ok) {
        addLog(
          `Error fetching posts: ${response.status} - ${JSON.stringify(data)}`,
        );
        setError(`Error ${response.status}: ${JSON.stringify(data)}`);
      } else {
        addLog(`Found ${data.posts?.length || 0} posts`);

        if (data.posts && data.posts.length > 0) {
          const firstPostId = data.posts[0].id;
          setPostId(firstPostId);
          addLog(`Set postId to ${firstPostId}`);
        } else {
          addLog("No posts found");
        }

        setResponse(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Exception: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">API Testing Page</h1>

      <div className="mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-semibold">Track Post View</h2>

        <div className="mb-4 grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Post ID</label>
            <input
              type="text"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Viewer ID</label>
            <input
              type="text"
              value={viewerId}
              onChange={(e) => setViewerId(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={trackView}
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Track View"}
          </button>

          <button
            onClick={testFetchPosts}
            disabled={loading}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          >
            Find Valid Post IDs
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">Response:</h3>
          <pre className="max-h-80 overflow-auto rounded-lg border bg-gray-50 p-4">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-lg font-semibold">Logs:</h3>
        <div className="max-h-96 overflow-auto rounded-lg border bg-gray-50 p-4">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            <ul className="space-y-1">
              {logs.map((log, index) => (
                <li key={index} className="font-mono text-sm">
                  {log}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

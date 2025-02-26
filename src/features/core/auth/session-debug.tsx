"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/core/button";
import { Typography } from "@/components/data-display/typography";

export const SessionDebug = () => {
  const session = useSession();
  const [expanded, setExpanded] = useState(false);

  if (!session) {
    return <div>No session available</div>;
  }

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-white dark:bg-gray-900 border rounded-md shadow-lg z-50 max-w-md overflow-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-2">
        <Typography variant="h4">Session Debug</Typography>
        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      <Typography variant="muted">Status: {session.status}</Typography>
      
      {expanded && (
        <div className="mt-4">
          <Typography variant="h5" className="mb-2">Session Data</Typography>
          <pre className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
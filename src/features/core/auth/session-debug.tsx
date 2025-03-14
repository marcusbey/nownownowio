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
    <div className="fixed bottom-0 right-0 z-50 m-4 max-h-[80vh] max-w-md overflow-auto rounded-md border bg-white p-4 shadow-lg dark:bg-gray-900">
      <div className="mb-2 flex items-center justify-between">
        <Typography variant="h4">Session Debug</Typography>
        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      <Typography variant="muted">Status: {session.status}</Typography>
      
      {expanded && (
        <div className="mt-4">
          <Typography variant="h5" className="mb-2">Session Data</Typography>
          <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
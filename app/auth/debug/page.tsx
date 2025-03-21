"use client";

import { Button } from "@/components/core/button";
import { Typography } from "@/components/data-display/typography";
import { SessionDebug } from "@/features/core/auth/session-debug";
import Link from "next/link";

export default function SessionDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <Typography variant="h1" className="mb-6">
        Session Debug Page
      </Typography>

      <div className="mb-8">
        <Typography variant="h3" className="mb-4">
          Navigation
        </Typography>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/orgs">Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white p-4 shadow-md dark:bg-gray-900">
        <Typography variant="h3" className="mb-4">
          Instructions
        </Typography>
        <Typography>
          This page includes the SessionDebug component which helps troubleshoot
          session-related issues. The component is fixed at the bottom-right
          corner of the screen. Click "Expand" to view the full session
          structure.
        </Typography>
      </div>

      <SessionDebug />
    </div>
  );
}

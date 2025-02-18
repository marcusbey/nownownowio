"use client";

import { Button } from "@/components/core/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/core/page/layout";
import { logger } from "@/lib/logger";
import type { ErrorParams } from "@/types/next";
import { useEffect } from "react";

export default function RouteError({ error, reset }: ErrorParams) {
  useEffect(() => {
    logger.error(error);
  }, [error]);

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>Error</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Card variant="error">
          <CardHeader>
            <CardTitle>
              Sorry, something went wrong. Please try again later.
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button onClick={reset}>Try again</Button>
          </CardFooter>
        </Card>
      </LayoutContent>
    </Layout>
  );
}

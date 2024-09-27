"use client";

import { WidgetScriptGenerator } from "./GenerateScript";

export default function WidgetPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  return <WidgetScriptGenerator orgSlug={params.orgSlug} />;
}

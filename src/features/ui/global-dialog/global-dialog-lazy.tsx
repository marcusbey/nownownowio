import dynamic from "next/dynamic";

export const GlobalDialogLazy = dynamic(
  () => import("./global-dialog").then((mod) => mod.GlobalDialog),
  { ssr: false },
);

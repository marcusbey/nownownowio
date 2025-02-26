import { HeaderBase } from "@/features/layout/header-base";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderBase />
      <main className="flex flex-1 flex-col items-center justify-center gap-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </main>
    </div>
  );
}

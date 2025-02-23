"use client";

import { Input } from "@/components/core/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchField() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="group relative">
        <Input
          name="q"
          placeholder="Search posts, people, or topics"
          className="w-full border-muted bg-background/95 pl-10
            pr-4 backdrop-blur transition-all duration-200 ease-in-out
            focus-visible:ring-1 focus-visible:ring-primary/30 group-hover:border-primary/30
            supports-[backdrop-filter]:bg-background/60"
        />
        <SearchIcon
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground/50 
          transition-colors duration-200 group-hover:text-primary/70"
        />
      </div>
    </form>
  );
}

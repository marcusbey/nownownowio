"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

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
      <div className="relative group">
        <Input 
          name="q" 
          placeholder="Search posts, people, or topics" 
          className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
            border-muted pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-primary/30
            transition-all duration-200 ease-in-out
            group-hover:border-primary/30" 
        />
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform 
          text-muted-foreground/50 transition-colors duration-200
          group-hover:text-primary/70" />
      </div>
    </form>
  );
}

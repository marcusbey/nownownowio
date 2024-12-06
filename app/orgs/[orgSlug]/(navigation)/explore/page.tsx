"use client";

import SearchField from "@/components/SearchField";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useRouter, useSearchParams } from "next/navigation";
import SearchResults from "./SearchResults";

const topics = [
  { id: "all", label: "All" },
  { id: "hot", label: "Hot " },
  { id: "startup", label: "Startups" },
  { id: "fundraising", label: "Fundraising" },
  { id: "tech", label: "Tech" },
  { id: "ai", label: "AI" },
  { id: "product", label: "Product" },
  { id: "design", label: "Design" },
];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const topic = searchParams.get("topic") || "all";

  const handleTopicChange = (newTopic: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("topic", newTopic);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <SearchField />
        
        {q ? (
          <>
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
                Search results for &quot;{q}&quot;
              </h1>
            </div>
            <SearchResults query={q} />
          </>
        ) : (
          <>
            <Tabs value={topic} onValueChange={handleTopicChange} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                {topics.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="min-w-max"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {topics.map((t) => (
                <TabsContent key={t.id} value={t.id}>
                  <SearchResults topic={t.id} />
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </main>
  );
}

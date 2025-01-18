import { auth } from "@/lib/auth/helper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BookmarksList from "./BookmarksList";

export default async function BookmarksPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Bookmarks</h1>
      <Suspense fallback={<div>Loading bookmarks...</div>}>
        <BookmarksList />
      </Suspense>
    </main>
  );
}

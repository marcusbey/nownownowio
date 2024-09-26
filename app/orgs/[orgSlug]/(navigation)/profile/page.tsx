import MyPostsFeed from "@/app/orgs/[orgSlug]/(navigation)/profile/MyPostsFeed";
import ProfileHeader from "@/app/orgs/[orgSlug]/(navigation)/profile/ProfileHeader";
import { requiredAuth } from "@/lib/auth/helper";

export default async function ProfilePage() {
  const user = await requiredAuth();

  if (!user) {
    return <p className="text-destructive">Unauthorized access.</p>;
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0">
        {/* Profile Header displaying user info, bio, and photo */}
        <div className="sticky top-0 z-10 border-b border-border bg-background pb-8">
          <ProfileHeader user={user} />
        </div>

        <div className="mt-16">
          {/* User's own posts feed */}
          <MyPostsFeed userId={user.id} />
        </div>
      </div>
    </main>
  );
}

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
      <div className="w-full min-w-0 space-y-5">
        {/* Profile Header displaying user info, bio, and photo */}
        <ProfileHeader user={user} />

        {/* User's own posts feed */}
        <MyPostsFeed userId={user.id} />
      </div>
    </main>
  );
}

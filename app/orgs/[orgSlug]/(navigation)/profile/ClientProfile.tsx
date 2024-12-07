"use client";

import { UserData } from "@/lib/types";
import ProfileHeader from "./ProfileHeader";
import UserPosts from "./UserPosts";

interface ClientProfileProps {
  user: UserData;
  orgSlug: string;
}

export default function ClientProfile({ user, orgSlug }: ClientProfileProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <ProfileHeader user={user} orgSlug={orgSlug} />
      <div className="px-4">
        <UserPosts userId={user.id} />
      </div>
    </main>
  );
}

"use client";

import { UserData } from "@/lib/types";
import ProfileHeader from "./ProfileHeader";
import UserPosts from "./UserPosts";
import { Tabs, TabsList, TabsTrigger } from "@/components/data-display/tabs";

interface ClientProfileProps {
  user: UserData;
  orgSlug: string;
}

export default function ClientProfile({ user, orgSlug }: ClientProfileProps) {
  return (
    <div className="w-full min-w-0">
      <ProfileHeader user={user} orgSlug={orgSlug} />
      
      <div className="max-w-xl mx-auto px-2">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <UserPosts userId={user.id} />
        </div>
      </div>
    </div>
  );
}

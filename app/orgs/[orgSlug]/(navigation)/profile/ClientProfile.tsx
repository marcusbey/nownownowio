"use client";

import type { UserData } from "@/lib/types";
import ProfileHeader from "./ProfileHeader";
import UserPosts from "./UserPosts";
import UserLikes from "./UserLikes";
import UserMedia from "./UserMedia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/data-display/tabs";
import { useState } from "react";

type ClientProfileProps = {
  user: UserData;
  orgSlug: string;
}

export default function ClientProfile({ user, orgSlug }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<string>("posts");

  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <div className="w-full">
        <ProfileHeader user={user} orgSlug={orgSlug} />
      </div>
      
      <div className="mt-6 w-full max-w-2xl px-4">
        <Tabs 
          defaultValue="posts" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="w-full">
            <UserPosts userId={user.id} />
          </TabsContent>
          
          <TabsContent value="likes" className="w-full">
            <UserLikes userId={user.id} />
          </TabsContent>
          
          <TabsContent value="media" className="w-full">
            <UserMedia userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

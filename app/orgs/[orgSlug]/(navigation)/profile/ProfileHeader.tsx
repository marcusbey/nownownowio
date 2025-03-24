"use client";

import BannerImage from "@/components/composite/BannerImage";
import UserAvatar from "@/components/composite/UserAvatar";
import { Button } from "@/components/core/button";
import Linkify from "@/components/data-display/Linkify";
import type { UserData } from "@/lib/types";
import { format } from "date-fns";
import { CalendarDays, Link2 } from "lucide-react";
import Link from "next/link";

type ProfileHeaderProps = {
  user: UserData & { bannerImage?: string | null };
  orgSlug: string;
};

export default function ProfileHeader({ user, orgSlug }: ProfileHeaderProps) {
  return (
    <div className="relative w-full">
      {/* Banner Image */}
      <div className="relative">
        <BannerImage
          imageUrl={user.bannerImage}
          alt={`${user.name || user.displayName}'s profile banner`}
        />

        {/* Edit Banner Button */}
        <div className="absolute right-4 top-4">
          <Link href={`/orgs/${orgSlug}/settings/account`}>
            <Button
              variant="default"
              size="sm"
              className="bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Edit Banner
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Content */}
      <div className="relative flex w-full justify-center">
        <div className="relative -mt-16 flex w-full max-w-2xl flex-col gap-4 px-4 pb-4">
          {/* Avatar and Actions */}
          <div className="flex items-end justify-between">
            <UserAvatar
              avatarUrl={user.image}
              size={128}
              className="ring-4 ring-background"
            />
            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm">
                Share Profile
              </Button>
              <Link href={`/orgs/${orgSlug}/settings/account`}>
                <Button size="sm">Edit Profile</Button>
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.displayName}</p>
            </div>

            {user.bio && (
              <Linkify>
                <p className="text-pretty text-muted-foreground">{user.bio}</p>
              </Linkify>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="size-4" />
                <span>
                  Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                </span>
              </div>
              {user.websiteUrl && (
                <Link
                  href={user.websiteUrl}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Link2 className="size-4" />
                  <span>{new URL(user.websiteUrl).hostname}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

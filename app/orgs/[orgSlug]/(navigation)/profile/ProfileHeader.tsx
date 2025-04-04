"use client";

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
      <div className="relative h-64 w-full overflow-hidden">
        {user.bannerImage ? (
          <div className="absolute inset-0">
            <img
              src={user.bannerImage}
              alt="Profile banner"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50">
            <svg
              className="size-full"
              viewBox="0 0 1000 200"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,100 C150,150 350,0 500,100 C650,200 850,50 1000,100 L1000,200 L0,200 Z"
                fill="currentColor"
                className="text-orange-200/30"
              />
              <path
                d="M0,100 C200,150 300,50 500,100 C700,150 800,50 1000,100 L1000,200 L0,200 Z"
                fill="currentColor"
                className="text-orange-300/20"
              />
            </svg>
          </div>
        )}

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

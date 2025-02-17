"use client";

import { Button } from "@/components/core/button";
import UserAvatar from "@/components/UserAvatar";
import { UserData } from "@/lib/types";
import { CalendarDays, Link2, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ProfileHeaderProps {
  user: UserData;
  orgSlug: string;
}

export default function ProfileHeader({ user, orgSlug }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-orange-100 to-orange-50">
        <div className="absolute inset-0">
          <svg
            className="h-full w-full"
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
      </div>

      {/* Profile Content */}
      <div className="relative mx-auto max-w-4xl px-4">
        <div className="relative -mt-16 flex flex-col gap-4 pb-4">
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
              <Link href={`/orgs/${orgSlug}/settings`}>
                <Button size="sm">Edit Profile</Button>
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">
                {user.displayName || user.name}
              </h1>
              <p className="text-muted-foreground">@{user.name}</p>
            </div>

            {user.bio && (
              <p className="text-pretty text-muted-foreground">{user.bio}</p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                </span>
              </div>
              {user.websiteUrl && (
                <Link
                  href={user.websiteUrl}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Link2 className="h-4 w-4" />
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

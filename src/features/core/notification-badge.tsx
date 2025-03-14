"use client";

import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";

type UnreadNotificationCountResponse = {
  unreadCount: number;
}

export default function NotificationBadge() {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () =>
      kyInstance
        .get("/api/v1/notifications/unread-count")
        .json<UnreadNotificationCountResponse>(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!data?.unreadCount) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
      {data.unreadCount > 9 ? "9+" : data.unreadCount}
    </span>
  );
}

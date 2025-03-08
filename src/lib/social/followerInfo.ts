import kyInstance from "@/lib/ky";

export type FollowerInfo = {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export async function getFollowerInfo(userId: string): Promise<FollowerInfo> {
  return kyInstance.get(`/api/v1/users/${userId}/follower-info`).json();
}

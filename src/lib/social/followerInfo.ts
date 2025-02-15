import kyInstance from "@/lib/ky";

export interface FollowerInfo {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export async function getFollowerInfo(userId: string): Promise<FollowerInfo> {
  return kyInstance.get(`/api/users/${userId}/follower-info`).json();
}

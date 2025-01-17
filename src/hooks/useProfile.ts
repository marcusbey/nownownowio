import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { UserData, PostData } from "@/lib/types";

interface ProfileData {
  user: UserData;
  posts: PostData[];
  stats: {
    followers: number;
    following: number;
    posts: number;
  };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => kyInstance.get("/api/profile").json(),
    staleTime: 60 * 1000, // Consider data stale after 1 minute
  });
}

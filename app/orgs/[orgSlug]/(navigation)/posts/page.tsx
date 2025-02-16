import { redirect } from "next/navigation";

// Redirect to the main feed page since we've consolidated the feed logic
export default function OrganizationPostsPage() {
  redirect("..");
}

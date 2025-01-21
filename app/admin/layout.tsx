import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Only allow admin access
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  // Check if user is admin (you might want to adjust this based on your user roles)
  const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

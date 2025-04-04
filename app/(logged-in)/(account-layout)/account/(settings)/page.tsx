import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/data-display/card";
import { requiredAuth } from "@/lib/auth/helper";
import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { EditPasswordForm } from "./edit-password-form";
import { EditProfileCardForm } from "./edit-profile-form";
import { SetInitialPasswordForm } from "./set-initial-password-form";

export const generateMetadata = combineWithParentMetadata({
  title: "Settings",
  description: "Update your profile.",
});

export default async function EditProfilePage() {
  const user = await requiredAuth();

  const hasPassword = await prisma.user.count({
    where: {
      id: user.id,
      passwordHash: {
        not: null,
      },
    },
  });

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <EditProfileCardForm defaultValues={user} />
      {hasPassword ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <EditPasswordForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Password</CardTitle>
            <CardDescription>
              Set a password to also log in with email and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetInitialPasswordForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Separator } from "@/components/ui/separator";
import { requiredAuth } from "@/lib/auth/helper";
import { BannerImageForm } from "./BannerImageForm";
import { PersonalAccountForm } from "./PersonalAccountForm";

export default async function AccountSettingsPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  const user = await requiredAuth();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 py-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Account Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account details, profile picture, and banner image.
        </p>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-2">
        <BannerImageForm user={user} />
        <PersonalAccountForm
          user={user}
          isEmailVerified={!!user.emailVerified}
        />
      </div>
    </div>
  );
}

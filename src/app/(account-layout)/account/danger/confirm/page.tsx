import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitButton } from "@/features/form/SubmitButton";
import { auth } from "@/lib/auth/helper";
import { combineWithParentMetadata } from "@/lib/metadata";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  orgConfirmDeletionAction,
  verifyDeleteAccountToken,
} from "../delete-account.action";

export const generateMetadata = combineWithParentMetadata({
  title: "Confirm deletion",
  description: "One last step to delete your account.",
});

export default async function RoutePage({ searchParams }: PageParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return redirect("/sign-in");
  }

  const token = searchParams?.token;
  const noTokenCard = (
    <Card>
      <CardHeader>
        <CardTitle>No token</CardTitle>
      </CardHeader>
      <CardFooter>
        <Link
          href="/account/danger"
          className={buttonVariants({ variant: "outline" })}
        >
          Retry
        </Link>
      </CardFooter>
    </Card>
  );

  if (!token) {
    return noTokenCard;
  }

  try {
    await verifyDeleteAccountToken(String(token), session.user.email);
  } catch {
    return noTokenCard;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Are you sure you want to delete your account ?</CardTitle>
        <CardDescription>
          By clicking on the button below, you confirm that you want to delete
          your account.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2">
        <Link
          href="/organizations"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
        <form>
          <SubmitButton
            formAction={async () => {
              "use server";

              await orgConfirmDeletionAction({
                token: String(token),
              });
            }}
          >
            Delete account
          </SubmitButton>
        </form>
      </CardFooter>
    </Card>
  );
}

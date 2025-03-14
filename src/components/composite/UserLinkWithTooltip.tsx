import Link from "next/link";

type UserLinkWithTooltipProps = {
  username: string;
  children: React.ReactNode;
}

export default function UserLinkWithTooltip({
  username,
  children,
}: UserLinkWithTooltipProps) {
  return (
    <Link href={`/users/${username}`} className="text-primary hover:underline">
      {children}
    </Link>
  );
}

import Link from "next/link";
import UserTooltip from "./UserTooltip";

interface UserLinkWithTooltipProps {
  name: string;
  children: React.ReactNode;
}

export default function UserLinkWithTooltip({
  name,
  children,
}: UserLinkWithTooltipProps) {
  return (
    <UserTooltip username={name}>
      <Link href={`/u/${name}`} className="text-primary hover:underline">
        {children}
      </Link>
    </UserTooltip>
  );
}

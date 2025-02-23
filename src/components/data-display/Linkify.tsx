import UserLinkWithTooltip from "@/components/composite/UserLinkWithTooltip";
import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";

type LinkifyProps = {
  children: React.ReactNode;
};

export default function Linkify({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip key={`@${key}`} name={match.slice(1)}>
          {match}
        </UserLinkWithTooltip>
      )}
    >
      <LinkIt
        regex={/(#[a-zA-Z0-9]+)/}
        component={(match, key) => (
          <Link
            key={`#${key}`}
            href={`/hashtag/${match.slice(1)}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        )}
      >
        <LinkItUrl className="text-primary hover:underline">
          {children}
        </LinkItUrl>
      </LinkIt>
    </LinkIt>
  );
}

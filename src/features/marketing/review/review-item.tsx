import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Card, CardContent, CardHeader } from "@/components/data-display/card";
import { Typography } from "@/components/data-display/typography";
import { ClientMarkdown } from "@/features/ui/markdown/client-markdown";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export type ReviewItemProps = {
  /**
   * The review of the user. Use **bold** text to highlight.
   */
  review: string;
  /**
   * The name of the user.
   */
  name: string;
  /**
   * The role of the user. (his job)
   */
  role: string;
  /**
   * The image of the user.
   */
  image: string;
} & ComponentPropsWithoutRef<"div">;

export const ReviewItem = ({ className, ...props }: ReviewItemProps) => {
  return (
    <Card className={cn("h-fit", className)} {...props}>
      <CardHeader>
        <ClientMarkdown className="citation">{props.review}</ClientMarkdown>
      </CardHeader>
      <CardContent className="flex items-center gap-2 rounded-lg bg-background pt-6">
        <div>
          <Avatar>
            <AvatarFallback>{props.name[0]}</AvatarFallback>
            <AvatarImage src={props.image} alt="user image" />
          </Avatar>
        </div>
        <div>
          <Typography variant="small">{props.name}</Typography>
          <Typography variant="muted">{props.role}</Typography>
        </div>
      </CardContent>
    </Card>
  );
};

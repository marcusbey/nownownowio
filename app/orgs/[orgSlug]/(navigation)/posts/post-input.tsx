"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface PostInputProps {
  userImage?: string | null;
  userName?: string | null;
}

export function PostInput({ userImage, userName }: PostInputProps) {
  const [content, setContent] = useState("");

  return (
    <div className="flex gap-4 py-4 px-4 border-b">
      <Avatar className="h-10 w-10">
        <AvatarImage src={userImage ?? undefined} />
        <AvatarFallback>{userName?.[0] ?? "U"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0"
        />
        <div className="flex justify-between items-center">
          <Button variant="outline" size="icon" className="rounded-full">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            disabled={!content.trim()}
            onClick={() => {
              // TODO: Implement post creation
              setContent("");
            }}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

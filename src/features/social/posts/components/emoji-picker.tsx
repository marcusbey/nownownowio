import { Button } from "@/components/core/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/core/popover";
import { Smile } from "lucide-react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="min-h-[350px] w-full animate-pulse bg-muted rounded-md"></div>
  ),
});

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
          aria-label="Add emoji"
        >
          <Smile className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[352px] border-none bg-transparent p-0 shadow-none"
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
          width="100%"
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
}

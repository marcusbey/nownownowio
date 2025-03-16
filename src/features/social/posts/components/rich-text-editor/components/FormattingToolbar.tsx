import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
  Video,
} from "lucide-react";
import { useFormattingToolbar } from "../hooks/useFormattingToolbar";

type FormattingToolbarProps = {
  editor: Editor | null;
  onLinkClick: () => void;
  onImageClick: () => void;
  onVideoClick: () => void;
};

export function FormattingToolbar({
  editor,
  onLinkClick,
  onImageClick,
  onVideoClick,
}: FormattingToolbarProps) {
  const { toolbarItems } = useFormattingToolbar({ editor });

  // Editor check is handled in useFormattingToolbar

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "bold":
        return <Bold className="size-4" />;
      case "italic":
        return <Italic className="size-4" />;
      case "underline":
        return <Underline className="size-4" />;
      case "strike":
        return <Strikethrough className="size-4" />;
      case "code":
        return <Code className="size-4" />;
      case "h1":
        return <Heading1 className="size-4" />;
      case "h2":
        return <Heading2 className="size-4" />;
      case "h3":
        return <Heading3 className="size-4" />;
      case "bullet":
        return <List className="size-4" />;
      case "number":
        return <ListOrdered className="size-4" />;
      case "blockquote":
        return <Quote className="size-4" />;
      case "link":
        return <Link className="size-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border bg-background p-1">
      {toolbarItems.map((item) => (
        <button
          key={item.id}
          onClick={item.id === "link" ? onLinkClick : item.onClick}
          className={cn(
            "rounded p-2 hover:bg-muted",
            item.isActive && "bg-muted"
          )}
          title={item.label}
          type="button"
        >
          {renderIcon(item.icon)}
        </button>
      ))}

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Media buttons */}
      <button
        onClick={onImageClick}
        className="rounded p-2 hover:bg-muted"
        title="Insert image"
        type="button"
      >
        <Image className="size-4" />
      </button>
      <button
        onClick={onVideoClick}
        className="rounded p-2 hover:bg-muted"
        title="Insert video"
        type="button"
      >
        <Video className="size-4" />
      </button>
    </div>
  );
}

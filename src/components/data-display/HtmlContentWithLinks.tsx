import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HtmlContentWithLinksProps {
  htmlContent: string;
  className?: string;
}

/**
 * Component that processes HTML content to make links, hashtags, and mentions clickable
 * while preserving the original HTML formatting.
 */
export function HtmlContentWithLinks({ htmlContent, className }: HtmlContentWithLinksProps) {
  // Process the HTML content to add linkification
  const processedContent = useMemo(() => {
    if (!htmlContent) return '';

    // Process URLs - Convert plain URLs to anchor tags
    let processed = htmlContent.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Process hashtags - Add data-hashtag attribute and styling
    processed = processed.replace(
      /#([a-zA-Z0-9]+)/g,
      '<a href="/hashtag/$1" data-hashtag class="text-primary hover:underline">#$1</a>'
    );

    // Process mentions - Add data-mention attribute and styling
    processed = processed.replace(
      /@([a-zA-Z0-9_-]+)/g,
      '<a href="/u/$1" data-mention class="text-primary hover:underline">@$1</a>'
    );

    return processed;
  }, [htmlContent]);

  return (
    <div
      className={cn(
        "prose prose-stone dark:prose-invert prose-sm",
        "max-w-none whitespace-pre-line break-words",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

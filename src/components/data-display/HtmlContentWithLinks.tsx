import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

type HtmlContentWithLinksProps = {
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

    // First sanitize the HTML to prevent XSS attacks
    const sanitized = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'img', 'video', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'data-hashtag', 'data-mention', 'controls', 'width', 'height']
    });

    // Process URLs - Convert plain URLs to anchor tags (but not those already in anchor tags)
    let processed = sanitized.replace(
      /(?<!href=")(https?:\/\/[^\s<"']+)/g,
      '<a href="$1" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Process hashtags - Link to search page with hashtag search
    processed = processed.replace(
      /#([a-zA-Z0-9]+)(?![^<]*>)/g, // Don't match inside tags
      '<a href="/search?q=%23$1" data-hashtag class="text-primary hover:underline">#$1</a>'
    );

    // Process mentions - Link to organization profile page
    processed = processed.replace(
      /@([a-zA-Z0-9_-]+)(?![^<]*>)/g, // Don't match inside tags
      '<a href="/orgs/$1/profile" data-mention class="text-primary hover:underline">@$1</a>'
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

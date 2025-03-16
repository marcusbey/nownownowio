import { Button } from "@/components/core/button";
import { useState } from "react";

type LinkPromptProps = {
  initialUrl: string;
  confirmLink: (url: string, text: string, openInNewTab: boolean) => void;
  cancelLink: () => void;
};

export function LinkPrompt({
  initialUrl,
  confirmLink,
  cancelLink,
}: LinkPromptProps) {
  const [url, setUrl] = useState(initialUrl || "");
  const [text, setText] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      confirmLink(url.trim(), text.trim(), openInNewTab);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          cancelLink();
        }
      }}
    >
      <div className="w-[500px] max-w-[90vw] rounded-lg border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-3 text-lg font-medium">Insert Link</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="link-url"
              className="mb-2 block text-sm font-medium"
            >
              URL
            </label>
            <input
              type="text"
              id="link-url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="link-text"
              className="mb-2 block text-sm font-medium"
            >
              Text (optional)
            </label>
            <input
              type="text"
              id="link-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Display text"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="open-new-tab"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="mr-2 size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="open-new-tab" className="text-sm">
              Open in new tab
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelLink}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url.trim()}
            >
              Insert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
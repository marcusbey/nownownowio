import { Editor } from '@tiptap/react';
import { useState } from 'react';

interface UseLinkInsertionProps {
  editor: Editor;
}

interface UseLinkInsertionReturn {
  showLinkPrompt: boolean;
  initialUrl: string;
  setLinkUrl: (url: string) => void;
  openLinkPrompt: () => void;
  closeLinkPrompt: () => void;
  confirmLink: (url: string, text: string, openInNewTab: boolean) => void;
}

export function useLinkInsertion({ editor }: UseLinkInsertionProps): UseLinkInsertionReturn {
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [initialUrl, setInitialUrl] = useState('');

  const openLinkPrompt = () => {
    // Get the current selection text and URL if a link is selected
    let url = '';
    
    if (editor.isActive('link')) {
      url = editor.getAttributes('link').href || '';
    }
    
    setInitialUrl(url);
    setShowLinkPrompt(true);
  };

  const closeLinkPrompt = () => {
    setShowLinkPrompt(false);
    setInitialUrl('');
  };

  const confirmLink = (url: string, text: string, openInNewTab: boolean) => {
    // If there's no selection and text is provided, insert the text and select it
    if (editor.state.selection.empty && text) {
      editor
        .chain()
        .focus()
        .insertContent(text)
        .setTextSelection({
          from: editor.state.selection.from - text.length,
          to: editor.state.selection.from,
        })
        .run();
    }

    // Now add the link to the selection
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url,
        target: openInNewTab ? '_blank' : null,
      })
      .run();

    closeLinkPrompt();
  };

  return {
    showLinkPrompt,
    initialUrl,
    setLinkUrl: setInitialUrl,
    openLinkPrompt,
    closeLinkPrompt,
    confirmLink,
  };
}

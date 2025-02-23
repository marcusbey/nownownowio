import { Extension } from '@tiptap/core';

export const Hashtag = Extension.create({
  name: 'hashtag',

  addRegularExpressions() {
    return [
      {
        find: /#[\w\u0590-\u05ff]+/g,
        replace: (match: string) => `<span class="hashtag">${match}</span>`,
      },
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ['hashtag'],
        attributes: {
          class: {
            default: 'hashtag',
            renderHTML: () => ({
              class: 'text-blue-500 hover:underline cursor-pointer',
            }),
          },
        },
      },
    ];
  },
});

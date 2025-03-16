declare module '@tiptap/extension-character-count' {
  import { Extension } from '@tiptap/core';

  export interface CharacterCountOptions {
    limit: number;
    mode: 'textSize' | 'nodeSize';
    // Add other options as needed
  }

  export default class CharacterCount extends Extension {
    constructor(options?: Partial<CharacterCountOptions>);
    static configure(options?: Partial<CharacterCountOptions>): CharacterCount;
  }
}

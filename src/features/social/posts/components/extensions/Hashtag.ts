import { Mark, markInputRule, mergeAttributes } from "@tiptap/core";

export const Hashtag = Mark.create({
    name: "hashtag",

    parseHTML() {
        return [{ tag: 'span[data-hashtag]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, {
                "data-hashtag": "",
                class: "text-blue-500",
            }),
            0,
        ];
    },

    addInputRules() {
        return [
            markInputRule({
                find: /(#\w+)/g, // capture #hashtags
                type: this.type,
            }),
        ];
    },
}); 
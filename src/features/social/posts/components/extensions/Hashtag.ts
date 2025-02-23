import { Mark, markInputRule, mergeAttributes } from "@tiptap/core";
import { cn } from "@/lib/utils";

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
                class: cn(
                    "text-foreground",
                    "[&>#]:text-primary [&>#]:hover:underline"
                ),
            }),
            0,
        ];
    },

    addInputRules() {
        return [
            markInputRule({
                find: /(#\w+)(?!>)/g, // capture #hashtags but not HTML tags
                type: this.type,
            }),
        ];
    },
}); 
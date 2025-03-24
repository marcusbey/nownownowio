import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MediaComponent from '../components/MediaComponent';

// Define proper types for the commands
type MediaAttributes = {
    src: string;
    alt?: string;
    title?: string;
    type: 'image' | 'video' | 'audio';
    width?: string;
    height?: string;
};

// Define the MediaNode extension
const MediaNode = Node.create({
    name: 'mediaNode',

    group: 'block',

    content: '',

    selectable: true,

    draggable: true,

    atom: true, // This node is treated as a single unit

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            type: {
                default: 'image', // Can be 'image', 'video', or 'audio'
            },
            width: {
                default: '100%',
            },
            height: {
                default: 'auto',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="media-node"]',
            },
            // Also parse regular img tags
            {
                tag: 'img',
                getAttrs: (node) => {
                    const element = node as HTMLElement;
                    return {
                        src: element.getAttribute('src'),
                        alt: element.getAttribute('alt'),
                        title: element.getAttribute('title'),
                        type: 'image',
                    };
                },
            },
            // Parse video tags
            {
                tag: 'video',
                getAttrs: (node) => {
                    const element = node as HTMLElement;
                    return {
                        src: element.getAttribute('src'),
                        type: 'video',
                    };
                },
            },
            // Parse audio tags
            {
                tag: 'audio',
                getAttrs: (node) => {
                    const element = node as HTMLElement;
                    return {
                        src: element.getAttribute('src'),
                        type: 'audio',
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { type } = HTMLAttributes;

        // Create different HTML structure based on media type
        if (type === 'video') {
            return [
                'div',
                { class: 'media-wrapper video-wrapper', 'data-type': 'media-node' },
                ['video', mergeAttributes({ controls: 'true', preload: 'metadata' }, HTMLAttributes)]
            ];
        } else if (type === 'audio') {
            return [
                'div',
                { class: 'media-wrapper audio-wrapper', 'data-type': 'media-node' },
                ['audio', mergeAttributes({ controls: 'true' }, HTMLAttributes)]
            ];
        } else {
            // Default to image
            return [
                'div',
                { class: 'media-wrapper image-wrapper', 'data-type': 'media-node' },
                ['img', mergeAttributes(HTMLAttributes)]
            ];
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(MediaComponent as React.ComponentType<NodeViewProps>);
    },

    addCommands() {
        return {
            insertMedia: (attributes: MediaAttributes) => ({ chain }: { chain: any }) => {
                return chain()
                    .insertContent({
                        type: this.name,
                        attrs: attributes,
                    })
                    .insertContent({
                        type: 'paragraph', // Insert an empty paragraph after the media
                    })
                    .run();
            },
        };
    },
});

export default MediaNode; 
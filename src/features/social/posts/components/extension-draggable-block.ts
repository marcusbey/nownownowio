import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from "@tiptap/react"
import { Node } from "@tiptap/core"
import { GripVertical } from "lucide-react"

// This extension wraps a block node with a container that has a grip on the left.
// You can enable it for paragraphs, headings, or any block node you prefer.
export const DraggableBlock = Node.create({
    name: "draggableBlock",

    // We want this extension to act like a container for block content
    group: "block",
    content: "block+",

    // We can override parseDOM/sendDOM if we want the content to be recognized as normal block
    // but for simplicity, let's just let Tiptap handle merges. 
    // We'll rely on the fact that we wrap another node type inside it.

    // The main magic: Add React node view
    addNodeView() {
        return ReactNodeViewRenderer(DraggableBlockView)
    },
})

// Our React node view
function DraggableBlockView(props: { [key: string]: any }) {
    // We have access to props.node, etc.
    return (
        <NodeViewWrapper className= "line-wrapper relative group" >
        <div className="line-grip absolute left-0 top-2 z-10 
        flex h - 4 w - 4 items - center justify - center
    opacity - 0 transition - opacity duration - 150 group - hover: opacity - 100
    text - gray - 400 dark: text - gray - 500 hover: text - gray - 600 dark: hover: text - gray - 400
    ">
        < GripVertical className = "h-3 w-3 cursor-move" />
            </div>
            < div className = "ml-6" >
                <NodeViewContent className="node-view-content" />
                    </div>
                    </NodeViewWrapper>
  )
} 
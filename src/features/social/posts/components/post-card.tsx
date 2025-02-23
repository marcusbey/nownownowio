import Linkify from "@/components/data-display/Linkify";

export function PostCard(props: { post: any }) {
  return (
    <div className="some-post-container">
      <Linkify>{props.post.content}</Linkify>
    </div>
  );
}

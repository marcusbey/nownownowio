import PostEditor from "@/features/social/components/post-editor";

type PostFormWrapperProps = {
  organization: {
    id: string;
    name: string;
  };
  userId: string;
};

export function PostFormWrapper({
  organization,
  userId,
}: PostFormWrapperProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 p-4 backdrop-blur-sm">
      <PostEditor />
    </div>
  );
}

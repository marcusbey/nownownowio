import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/composite/dialog";
import LoadingButton from "@/components/composite/loading-button";
import { Button } from "@/components/core/button";
import type { PostData } from "@/lib/types";
import { useDeletePostMutation } from "./mutations";

type DeletePostDialogProps = {
  post: PostData;
  open: boolean;
  onClose: () => void;
};

export default function DeletePostDialog({
  post,
  open,
  onClose,
}: DeletePostDialogProps) {
  const mutation = useDeletePostMutation();

  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete post?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            loading={mutation.isPending}
            onClick={() => {
              mutation.mutate(post.id, {
                onSuccess: () => {
                  onClose();
                },
              });
            }}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

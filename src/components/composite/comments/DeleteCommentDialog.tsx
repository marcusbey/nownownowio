import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/composite/dialog";
import { Button } from "@/components/core/button";
import type { CommentData } from "@/lib/types";
import LoadingButton from "../loading-button";
import { useDeleteCommentMutation } from "./mutations";

type DeleteCommentDialogProps = {
  comment: CommentData;
  open: boolean;
  onClose: () => void;
};

export default function DeleteCommentDialog({
  comment,
  open,
  onClose,
}: DeleteCommentDialogProps) {
  const mutation = useDeleteCommentMutation();

  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete comment?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be
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
              mutation.mutate(comment.id, {
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

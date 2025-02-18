import { useAlertDialogStore } from "./alert-dialog-store";
import { AlertDialogRenderedDialog } from "./alert-dialog-rendered-dialog";

export const AlertDialogRenderer = () => {
  const dialog = useAlertDialogStore((state) => state.dialogs[0]);

  if (dialog) {
    return <AlertDialogRenderedDialog {...dialog} />;
  }

  return null;
};

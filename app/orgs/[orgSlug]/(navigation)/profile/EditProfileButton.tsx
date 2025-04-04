"use client";

import { Button } from "@/components/core/button";
import type { UserData } from "@/lib/types";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

type EditProfileButtonProps = {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Edit profile
      </Button>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}

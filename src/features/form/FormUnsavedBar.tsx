"use client";

import type { FormProps } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import {
  CmdOrOption,
  KeyboardShortcut,
} from "@/components/ui/keyboard-shortcut";
import { Typography } from "@/components/ui/typography";
import { useWarnIfUnsavedChanges } from "@/hooks/useWarnIfUnsavedChanges";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useMemo, useCallback, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import type { FieldValues } from "react-hook-form";
import { useKey } from "react-use";
import { LoadingButton } from "./SubmitButton";

const PortalContent = memo(({ isDirty, onSubmit, disabled }: {
  isDirty: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center overflow-hidden py-4">
    <AnimatePresence>
      {isDirty ? (
        <motion.div
          key="save-bar"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: [1, 1, 0],
            y: [0, -10, 20],
            transition: {
              duration: 0.5,
            },
          }}
          className="pointer-events-auto flex items-center gap-4 rounded-md border bg-card p-1 lg:p-2"
        >
          <Typography variant="small">
            Changes have been made. Save now !
          </Typography>
          <LoadingButton
            size="sm"
            loading={disabled}
            variant="success"
            onClick={onSubmit}
          >
            Save{" "}
            <KeyboardShortcut eventKey="cmd">
              <CmdOrOption />
            </KeyboardShortcut>
            <KeyboardShortcut eventKey="s">S</KeyboardShortcut>
          </LoadingButton>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </div>
));

export const FormUnsavedBar = <T extends FieldValues>(props: FormProps<T>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDirty = useMemo(() => props.form.formState.isDirty, [props.form.formState.isDirty]);

  const submit = useCallback(() => buttonRef.current?.click(), []);

  useKey(
    (event) => (event.ctrlKey || event.metaKey) && event.key === "s" && isDirty,
    submit,
    { event: "keydown" },
    [isDirty, submit],
  );

  useWarnIfUnsavedChanges(
    isDirty,
    "You have unsaved changes. Are you sure you want to leave?",
  );

  useEffect(() => {
    return () => {
      // Cleanup any event listeners
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", submit);
      }
    };
  }, [submit]);

  if (typeof window === "undefined") return null;

  return (
    <>
      <Form {...props} className={cn(props.className)}>
        {props.children}
        <button type="submit" className="hidden" ref={buttonRef} />
      </Form>
      {createPortal(
        <PortalContent
          isDirty={isDirty}
          onSubmit={submit}
          disabled={props.disabled ?? props.form.formState.isSubmitting}
        />,
        document.body,
      )}
    </>
  );
};

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

interface PortalContentProps {
  isDirty: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}

const PortalContent = memo(function PortalContent({ isDirty, onSubmit, disabled }: PortalContentProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isDirty && (
          <motion.div
            key="save-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto flex items-center gap-3 rounded-lg border bg-card px-4 py-2 shadow-lg"
          >
            <Typography variant="small" className="text-muted-foreground">
              Save your changes
            </Typography>
            <div className="flex items-center gap-2">
              <LoadingButton
                size="sm"
                variant="default"
                loading={disabled}
                onClick={onSubmit}
                className="h-8 px-3"
              >
                Save
                <KeyboardShortcut className="ml-2">
                  <CmdOrOption />S
                </KeyboardShortcut>
              </LoadingButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PortalContent.displayName = 'PortalContent';

export function FormUnsavedBar<T extends FieldValues>(props: FormProps<T>) {
  const formRef = useRef<HTMLFormElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const isDirty = props.form.formState.isDirty;
  const disabled = props.disabled;

  useWarnIfUnsavedChanges(isDirty);

  const handleSubmit = useCallback(() => {
    if (formRef.current && !disabled) {
      formRef.current.requestSubmit();
    }
  }, [disabled]);

  useKey(
    (event) => (event.metaKey || event.ctrlKey) && event.key === "s",
    (event) => {
      event.preventDefault();
      handleSubmit();
    },
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    
    portalRef.current = document.createElement("div");
    document.body.appendChild(portalRef.current);
    
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, []);

  const portal = useMemo(() => {
    if (!portalRef.current) return null;
    
    return createPortal(
      <PortalContent
        isDirty={isDirty}
        onSubmit={handleSubmit}
        disabled={disabled}
      />,
      portalRef.current,
    );
  }, [isDirty, handleSubmit, disabled]);

  return (
    <Form {...props} ref={formRef}>
      {props.children}
      {portal}
    </Form>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const CONTACT_EMAIL = "info@endpoints.ir";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      toast.success("Email copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy email");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact us</DialogTitle>
          <DialogDescription>
            Questions, feedback, or partnership — email us. A contact form will
            come later.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Email
          </p>
          <div className="flex items-center gap-1.5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-mono-ui text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={copied ? "Copied" : "Copy email"}
              onClick={() => void copyEmail()}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

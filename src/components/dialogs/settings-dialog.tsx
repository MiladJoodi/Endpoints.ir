"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  ConfirmDialog,
  PromptDialog,
} from "@/components/dialogs/app-dialogs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CONTACT_EMAIL = "info@endpoints.ir";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { preferences, setPreferences, resetWorkspace } = useWorkspace();
  const [customTimeoutOpen, setCustomTimeoutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
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

  const handleResetWorkspace = async () => {
    setResetting(true);
    try {
      await resetWorkspace();
      toast.success("Workspace reset");
      onOpenChange(false);
    } catch {
      toast.error("Could not reset workspace");
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Preferences stay on this device. Nothing is synced to a server.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Request timeout</Label>
              <Select
                value={String(preferences.timeoutMs)}
                items={{
                  "10000": "10 seconds",
                  "30000": "30 seconds",
                  "60000": "60 seconds",
                  custom: "Custom…",
                  ...(![10_000, 30_000, 60_000].includes(preferences.timeoutMs)
                    ? {
                        [String(preferences.timeoutMs)]:
                          `${preferences.timeoutMs / 1000} seconds`,
                      }
                    : {}),
                }}
                onValueChange={(value) => {
                  if (!value) return;
                  if (value === "custom") {
                    setCustomTimeoutOpen(true);
                    return;
                  }
                  setPreferences({ timeoutMs: Number(value) });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">10 seconds</SelectItem>
                  <SelectItem value="30000">30 seconds</SelectItem>
                  <SelectItem value="60000">60 seconds</SelectItem>
                  <SelectItem value="custom">Custom…</SelectItem>
                  {![10_000, 30_000, 60_000].includes(preferences.timeoutMs) ? (
                    <SelectItem value={String(preferences.timeoutMs)}>
                      {preferences.timeoutMs / 1000} seconds
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
              <Label>Contact us</Label>
              <p className="text-xs text-muted-foreground">
                Questions, feedback, or partnership — email us.
              </p>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
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
            </div>

            <div className="space-y-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-3">
              <Label>Reset workspace</Label>
              <p className="text-xs text-muted-foreground">
                Permanently deletes collections, requests, history, environments,
                and settings on this device. Theme is kept.
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={resetting}
                onClick={() => setResetOpen(true)}
              >
                Reset everything…
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Endpoints is local-first. Collections, history, and environments are stored in
              IndexedDB on this device.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PromptDialog
        open={customTimeoutOpen}
        onOpenChange={setCustomTimeoutOpen}
        title="Custom timeout"
        description="Enter timeout in seconds."
        label="Seconds"
        defaultValue="45"
        confirmLabel="Apply"
        onConfirm={(raw) => {
          const seconds = Number(raw);
          if (!Number.isFinite(seconds) || seconds <= 0) return;
          setPreferences({ timeoutMs: Math.round(seconds * 1000) });
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset workspace?"
        description="This permanently deletes collections, requests, history, environments, and settings on this device. Your theme is kept. This cannot be undone."
        confirmLabel="Reset everything"
        destructive
        onConfirm={() => void handleResetWorkspace()}
      />
    </>
  );
}

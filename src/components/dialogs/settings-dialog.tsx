"use client";

import { useState } from "react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { PromptDialog } from "@/components/dialogs/app-dialogs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { preferences, setPreferences } = useWorkspace();
  const [customTimeoutOpen, setCustomTimeoutOpen] = useState(false);

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

            <div className="space-y-1.5">
              <Label htmlFor="timeout-display">Current timeout (ms)</Label>
              <Input
                id="timeout-display"
                readOnly
                value={preferences.timeoutMs}
                className="font-mono-ui"
              />
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
    </>
  );
}

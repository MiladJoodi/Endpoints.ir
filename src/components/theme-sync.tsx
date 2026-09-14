"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useWorkspace } from "@/components/workspace/workspace-provider";

/** Keeps next-themes aligned with persisted app preferences. */
export function ThemeSync() {
  const { ready, preferences } = useWorkspace();
  const { setTheme } = useTheme();
  const lastApplied = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (lastApplied.current === preferences.theme) return;
    lastApplied.current = preferences.theme;
    setTheme(preferences.theme);
  }, [ready, preferences.theme, setTheme]);

  return null;
}

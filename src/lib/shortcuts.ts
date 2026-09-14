/** Shared keyboard shortcut labels for Settings / Command palette. */

export type ShortcutDef = {
  id: string;
  action: string;
  keys: string;
};

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

/** Mod key glyph: ⌘ on Apple, Ctrl elsewhere. */
export function modKeyLabel(apple = isApplePlatform()): string {
  return apple ? "⌘" : "Ctrl";
}

export function shortcutKeys(
  parts: Array<"mod" | "shift" | "enter" | string>,
  apple = isApplePlatform(),
): string {
  const mod = modKeyLabel(apple);
  return parts
    .map((p) => {
      if (p === "mod") return mod;
      if (p === "shift") return apple ? "⇧" : "Shift";
      if (p === "enter") return apple ? "↵" : "Enter";
      return p.toUpperCase();
    })
    .join(apple ? "" : "+");
}

export function getAppShortcuts(apple = isApplePlatform()): ShortcutDef[] {
  return [
    {
      id: "palette",
      action: "Command palette",
      keys: shortcutKeys(["mod", "K"], apple),
    },
    {
      id: "send",
      action: "Send request",
      keys: shortcutKeys(["mod", "enter"], apple),
    },
    {
      id: "save",
      action: "Save request",
      keys: shortcutKeys(["mod", "S"], apple),
    },
    {
      id: "save-as",
      action: "Save as new",
      keys: shortcutKeys(["mod", "shift", "S"], apple),
    },
    {
      id: "format",
      action: "Format JSON body",
      keys: shortcutKeys(["mod", "shift", "F"], apple),
    },
  ];
}

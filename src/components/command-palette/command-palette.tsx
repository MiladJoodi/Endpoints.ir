"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { PromptDialog } from "@/components/dialogs/app-dialogs";
import { methodColorClass } from "@/lib/http/request";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  onImportCurl: () => void;
  onEnvironments: () => void;
  onSave: () => void;
}

export function CommandPalette({
  onImportCurl,
  onEnvironments,
  onSave,
}: CommandPaletteProps) {
  const {
    commandOpen,
    setCommandOpen,
    newRequest,
    sendRequest,
    setSidebarTab,
    setMobileSidebarOpen,
    createCollection,
    createEnvironment,
    collections,
    savedRequests,
    history,
    environments,
    loadRequest,
    loadHistoryItem,
    setPreferences,
    preferences,
  } = useWorkspace();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [newEnvironmentOpen, setNewEnvironmentOpen] = useState(false);

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { requests: [], history: [], environments: [], collections: [] };
    return {
      collections: collections.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5),
      requests: savedRequests
        .filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.url.toLowerCase().includes(q) ||
            r.method.toLowerCase().includes(q),
        )
        .slice(0, 8),
      history: history
        .filter((h) => h.url.toLowerCase().includes(q) || h.method.toLowerCase().includes(q))
        .slice(0, 8),
      environments: environments
        .filter((e) => e.name.toLowerCase().includes(q))
        .slice(0, 5),
    };
  }, [query, collections, savedRequests, history, environments]);

  const close = () => setCommandOpen(false);

  return (
    <>
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title="Command palette"
      description="Search requests or run a command"
    >
      <CommandInput
        placeholder="Search or jump to a command…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Commands">
          <CommandItem
            onSelect={() => {
              newRequest();
              close();
            }}
          >
            New Request
          </CommandItem>
          <CommandItem
            onSelect={() => {
              void sendRequest();
              close();
            }}
          >
            Send Request
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onSave();
              close();
            }}
          >
            Save Request
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setSidebarTab("history");
              setMobileSidebarOpen(true);
              close();
            }}
          >
            Open History
          </CommandItem>
          <CommandItem
            onSelect={() => {
              close();
              setNewCollectionOpen(true);
            }}
          >
            Create Collection
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onEnvironments();
              close();
            }}
          >
            Create / Edit Environment
          </CommandItem>
          <CommandItem
            onSelect={() => {
              close();
              setNewEnvironmentOpen(true);
            }}
          >
            Create Environment
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onImportCurl();
              close();
            }}
          >
            Import cURL
          </CommandItem>
          <CommandItem
            onSelect={() => {
              const next = preferences.theme === "dark" ? "light" : "dark";
              setPreferences({ theme: next });
              setTheme(next);
              close();
            }}
          >
            Toggle Theme
          </CommandItem>
        </CommandGroup>

        {searchHits.requests.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Requests">
              {searchHits.requests.map((r) => (
                <CommandItem
                  key={r.id}
                  onSelect={() => {
                    loadRequest(r);
                    close();
                  }}
                >
                  <span className={cn("font-mono-ui w-12", methodColorClass(r.method))}>
                    {r.method}
                  </span>
                  {r.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {searchHits.history.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="History">
                  {searchHits.history.map((h) => (
                <CommandItem
                  key={h.id}
                  onSelect={() => {
                    loadHistoryItem(h);
                    close();
                  }}
                >
                  <span className={cn("font-mono-ui w-12", methodColorClass(h.method))}>
                    {h.method}
                  </span>
                  <span className="truncate">{h.url}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {searchHits.collections.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Collections">
              {searchHits.collections.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() => {
                    setSidebarTab("collections");
                    close();
                  }}
                >
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {searchHits.environments.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Environments">
              {searchHits.environments.map((e) => (
                <CommandItem
                  key={e.id}
                  onSelect={() => {
                    onEnvironments();
                    close();
                  }}
                >
                  {e.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>

    <PromptDialog
      open={newCollectionOpen}
      onOpenChange={setNewCollectionOpen}
      title="New collection"
      defaultValue="New collection"
      confirmLabel="Create"
      onConfirm={(name) => void createCollection(name)}
    />
    <PromptDialog
      open={newEnvironmentOpen}
      onOpenChange={setNewEnvironmentOpen}
      title="New environment"
      defaultValue="Development"
      confirmLabel="Create"
      onConfirm={(name) => void createEnvironment(name)}
    />
    </>
  );
}

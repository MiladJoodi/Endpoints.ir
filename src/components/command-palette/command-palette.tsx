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
import { getAppShortcuts } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  onImportCurl: () => void;
  onEnvironments: () => void;
  onSave: () => void;
}

function ActionLabel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 text-left">
      <span className="font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
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

  const close = () => {
    setCommandOpen(false);
    setQuery("");
  };

  return (
    <>
      <CommandDialog
        open={commandOpen}
        onOpenChange={(open) => {
          setCommandOpen(open);
          if (!open) setQuery("");
        }}
        title="Quick search"
        description="Search saved requests or run a common action"
      >
        <CommandInput
          placeholder="Search requests, history, or actions…"
          value={query}
          onValueChange={setQuery}
        />
        <p className="px-3 pt-2 text-xs text-muted-foreground">
          Click a row to run it. Type above to find a saved request by name or URL.
        </p>
        <CommandList>
          <CommandEmpty>Nothing matched. Try another name or URL.</CommandEmpty>

          <CommandGroup heading="What do you want to do?">
            <CommandItem
              value="new request blank"
              className="items-start"
              onSelect={() => {
                newRequest();
                close();
              }}
            >
              <ActionLabel
                title="New request"
                hint="Open a blank request in a new tab"
              />
            </CommandItem>
            <CommandItem
              value="send request"
              className="items-start"
              onSelect={() => {
                void sendRequest();
                close();
              }}
            >
              <ActionLabel
                title="Send request"
                hint="Send the request that is open now"
              />
            </CommandItem>
            <CommandItem
              value="save request"
              className="items-start"
              onSelect={() => {
                onSave();
                close();
              }}
            >
              <ActionLabel
                title="Save request"
                hint="Save the current request to a collection"
              />
            </CommandItem>
            <CommandItem
              value="open history"
              className="items-start"
              onSelect={() => {
                setSidebarTab("history");
                setMobileSidebarOpen(true);
                close();
              }}
            >
              <ActionLabel
                title="Open history"
                hint="Show recently sent requests in the sidebar"
              />
            </CommandItem>
            <CommandItem
              value="create collection new folder group"
              className="items-start"
              onSelect={() => {
                close();
                setNewCollectionOpen(true);
              }}
            >
              <ActionLabel
                title="New collection"
                hint="Create a folder group for saved requests"
              />
            </CommandItem>
            <CommandItem
              value="edit environments variables"
              className="items-start"
              onSelect={() => {
                onEnvironments();
                close();
              }}
            >
              <ActionLabel
                title="Environments"
                hint="Edit variables like {{baseUrl}} for different stages"
              />
            </CommandItem>
            <CommandItem
              value="create environment new staging"
              className="items-start"
              onSelect={() => {
                close();
                setNewEnvironmentOpen(true);
              }}
            >
              <ActionLabel
                title="New environment"
                hint="Add a new set of variables (e.g. Staging)"
              />
            </CommandItem>
            <CommandItem
              value="import curl paste command"
              className="items-start"
              onSelect={() => {
                onImportCurl();
                close();
              }}
            >
              <ActionLabel
                title="Import from cURL"
                hint="Paste a cURL command and turn it into a request"
              />
            </CommandItem>
            <CommandItem
              value="toggle theme light dark"
              className="items-start"
              onSelect={() => {
                const next = preferences.theme === "dark" ? "light" : "dark";
                setPreferences({ theme: next });
                setTheme(next);
                close();
              }}
            >
              <ActionLabel
                title="Switch light / dark"
                hint="Toggle the app theme"
              />
            </CommandItem>
          </CommandGroup>

          {searchHits.requests.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Saved requests">
                {searchHits.requests.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={`request ${r.name} ${r.url} ${r.method}`}
                    onSelect={() => {
                      loadRequest(r);
                      close();
                    }}
                  >
                    <span
                      className={cn(
                        "font-mono-ui w-12 shrink-0 text-xs font-semibold",
                        methodColorClass(r.method),
                      )}
                    >
                      {r.method}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{r.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.url}</div>
                    </div>
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
                    value={`history ${h.url} ${h.method}`}
                    onSelect={() => {
                      loadHistoryItem(h);
                      close();
                    }}
                  >
                    <span
                      className={cn(
                        "font-mono-ui w-12 shrink-0 text-xs font-semibold",
                        methodColorClass(h.method),
                      )}
                    >
                      {h.method}
                    </span>
                    <span className="truncate text-sm">{h.url}</span>
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
                    value={`collection ${c.name}`}
                    className="items-start"
                    onSelect={() => {
                      setSidebarTab("collections");
                      setMobileSidebarOpen(true);
                      close();
                    }}
                  >
                    <ActionLabel
                      title={c.name}
                      hint="Open this collection in the sidebar"
                    />
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
                    value={`environment ${e.name}`}
                    className="items-start"
                    onSelect={() => {
                      onEnvironments();
                      close();
                    }}
                  >
                    <ActionLabel title={e.name} hint="Open environment editor" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>

        <div className="border-t border-border/80 px-3 py-2.5">
          <p className="mb-1.5 text-xs font-medium text-foreground">
            Keyboard shortcuts
          </p>
          <p className="mb-2 text-[11px] text-muted-foreground">
            These work anywhere in the app — you do not need this window open.
          </p>
          <ul className="grid gap-1.5">
            {getAppShortcuts().map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-muted-foreground">{s.action}</span>
                <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono-ui text-[10px] text-foreground">
                  {s.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </div>
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

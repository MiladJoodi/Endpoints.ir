"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Download,
  Mail,
  Menu,
  MoreHorizontal,
  Moon,
  Save,
  Settings2,
  Sun,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { requestToCurl } from "@/lib/export/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onImportCurl: () => void;
  onImportCollection: () => void;
  onGenerateCode: () => void;
  onEnvironments: () => void;
  onSettings: () => void;
  onContact: () => void;
  onSave: () => void;
}

function slug(name: string, fallback: string) {
  return name.replace(/\s+/g, "-").toLowerCase() || fallback;
}

export function TopBar({
  onImportCurl,
  onImportCollection,
  onGenerateCode,
  onEnvironments,
  onSettings,
  onContact,
  onSave,
}: TopBarProps) {
  const {
    setMobileSidebarOpen,
    environments,
    preferences,
    setActiveEnvironmentId,
    request,
    collections,
    savedRequests,
    setPreferences,
  } = useWorkspace();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const downloadText = (filename: string, content: string, mime = "application/json") => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    const current = resolvedTheme === "light" ? "light" : "dark";
    const next = current === "dark" ? "light" : "dark";
    setPreferences({ theme: next });
    setTheme(next);
  };

  const activeCollection =
    collections.find((c) => c.id === request.collectionId) ?? collections[0] ?? null;

  const themeLabel =
    mounted && resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  const importExportItems = (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Import</DropdownMenuLabel>
        <DropdownMenuItem onClick={onImportCurl}>
          <Upload className="size-3.5" />
          Import cURL…
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImportCollection}>
          <Upload className="size-3.5" />
          Import collection…
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Export</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={async () => {
            const curl = requestToCurl(request);
            try {
              await navigator.clipboard.writeText(curl);
              toast.success("cURL copied");
            } catch {
              downloadText(
                `${slug(request.name, "request")}.sh`,
                curl,
                "text/plain",
              );
            }
          }}
        >
          <Download className="size-3.5" />
          Copy request as cURL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onGenerateCode}>
          <Download className="size-3.5" />
          Generate code…
        </DropdownMenuItem>
        {activeCollection ? (
          <DropdownMenuItem
            onClick={async () => {
              const { collectionToPostman, stringifyPretty } =
                await import("@/lib/export/postman");
              downloadText(
                `${slug(activeCollection.name, "collection")}.postman_collection.json`,
                stringifyPretty(
                  collectionToPostman(activeCollection, savedRequests),
                ),
              );
              toast.success("Postman collection exported");
            }}
          >
            <Download className="size-3.5" />
            Export collection (Postman)
          </DropdownMenuItem>
        ) : null}
        {collections.length > 0 ? (
          <DropdownMenuItem
            onClick={async () => {
              const { collectionsToPostman, stringifyPretty } =
                await import("@/lib/export/postman");
              downloadText(
                "endpoints.postman_collection.json",
                stringifyPretty(
                  collectionsToPostman(collections, savedRequests),
                ),
              );
              toast.success("All collections exported for Postman");
            }}
          >
            <Download className="size-3.5" />
            Export all (Postman)
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={async () => {
            const { createEndpointsBackup, stringifyPretty } =
              await import("@/lib/export/postman");
            downloadText(
              "endpoints-backup.json",
              stringifyPretty(
                createEndpointsBackup(collections, savedRequests, environments),
              ),
            );
            toast.success("Backup downloaded");
          }}
        >
          <Download className="size-3.5" />
          Download backup
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );

  return (
    <header className="flex h-12 min-w-0 shrink-0 items-center gap-1.5 overflow-hidden border-b border-border/80 bg-background/90 px-2 backdrop-blur-md sm:gap-2 sm:px-3 md:px-4">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="shrink-0 lg:hidden"
        aria-label="Open sidebar"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="size-4" />
      </Button>

      <h1 className="min-w-0 truncate text-[15px] font-bold tracking-tight text-foreground">
        Endpoints.ir
      </h1>

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1">
        {/* Desktop / tablet actions */}
        <div className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 max-w-[11rem] cursor-pointer items-center gap-1.5 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground hover:bg-muted"
              aria-label="Environment"
            >
              <span className="truncate">
                {environments.find((e) => e.id === preferences.activeEnvironmentId)
                  ?.name ?? "No environment"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Active</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setActiveEnvironmentId(null)}>
                  {preferences.activeEnvironmentId
                    ? "No environment"
                    : "No environment ✓"}
                </DropdownMenuItem>
                {environments.map((env) => (
                  <DropdownMenuItem
                    key={env.id}
                    onClick={() => setActiveEnvironmentId(env.id)}
                  >
                    {preferences.activeEnvironmentId === env.id
                      ? `${env.name} ✓`
                      : env.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEnvironments}>
                Manage environments…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Save request"
            onClick={onSave}
          >
            <Save className="size-3.5" aria-hidden />
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm text-foreground hover:bg-muted"
              aria-label="Import or export"
            >
              <Upload className="size-3.5" />
              <span className="hidden lg:inline">Import / Export</span>
              <span className="lg:hidden">I/O</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              {importExportItems}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={themeLabel}
            onClick={toggleTheme}
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="size-3.5" />
              ) : (
                <Moon className="size-3.5" />
              )
            ) : (
              <Moon className="size-3.5 opacity-0" />
            )}
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Contact us"
            onClick={onContact}
          >
            <Mail className="size-3.5" />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Settings"
            onClick={onSettings}
          >
            <Settings2 className="size-3.5" />
          </Button>
        </div>

        {/* Mobile: Save + overflow */}
        <div className="flex items-center gap-0.5 md:hidden">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Save request"
            onClick={onSave}
          >
            <Save className="size-3.5" aria-hidden />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground hover:bg-muted"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                <DropdownMenuItem onClick={onEnvironments}>
                  Environments…
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {importExportItems}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={toggleTheme}>{themeLabel}</DropdownMenuItem>
                <DropdownMenuItem onClick={onSettings}>Settings…</DropdownMenuItem>
                <DropdownMenuItem onClick={onContact}>Contact us…</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

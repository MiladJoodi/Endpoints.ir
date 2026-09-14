"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Download,
  Menu,
  Moon,
  Save,
  Settings2,
  Sun,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { requestToCurl } from "@/lib/export/format";
import {
  collectionToPostman,
  collectionsToPostman,
  createEndpointsBackup,
  stringifyPretty,
} from "@/lib/export/postman";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopBarProps {
  onImportCurl: () => void;
  onImportCollection: () => void;
  onGenerateCode: () => void;
  onEnvironments: () => void;
  onSettings: () => void;
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

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md md:px-4">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="lg:hidden"
        aria-label="Open sidebar"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="size-4" />
      </Button>

      <h1 className="shrink-0 text-[15px] font-semibold tracking-tight text-foreground">
        Endpoints.ir
      </h1>

      <div className="ml-auto flex items-center gap-1">
        <Select
          value={preferences.activeEnvironmentId ?? "none"}
          items={{
            none: "No environment",
            ...Object.fromEntries(environments.map((env) => [env.id, env.name])),
          }}
          onValueChange={(value) => {
            if (!value || value === "none") setActiveEnvironmentId(null);
            else setActiveEnvironmentId(value);
          }}
        >
          <SelectTrigger className="h-8 w-[8.5rem] text-xs" aria-label="Environment">
            <SelectValue placeholder="No environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No environment</SelectItem>
            {environments.map((env) => (
              <SelectItem key={env.id} value={env.id}>
                {env.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" size="sm" variant="ghost" onClick={onEnvironments}>
          Env
        </Button>

        <Button type="button" size="sm" variant="ghost" onClick={onSave}>
          <Save className="size-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm text-foreground hover:bg-muted"
            aria-label="Import or export"
          >
            <Upload className="size-3.5" />
            <span className="hidden md:inline">Import / Export</span>
            <span className="hidden sm:inline md:hidden">I/O</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-60">
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
                  onClick={() => {
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
                  onClick={() => {
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
                onClick={() => {
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
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={
            mounted && resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
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
          aria-label="Settings"
          onClick={onSettings}
        >
          <Settings2 className="size-3.5" />
        </Button>
      </div>
    </header>
  );
}

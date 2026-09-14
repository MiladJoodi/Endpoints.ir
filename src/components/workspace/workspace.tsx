"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/app-shell/top-bar";
import { Sidebar } from "@/components/app-shell/sidebar";
import { RequestBar } from "@/components/request/request-bar";
import { RequestConfig } from "@/components/request/request-config";
import { ResponseViewer } from "@/components/response/response-viewer";
import { RequestTabs } from "@/components/workspace/request-tabs";
import { ThemeSync } from "@/components/theme-sync";
import {
  useWorkspace,
  WorkspaceProvider,
} from "@/components/workspace/workspace-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ImportCurlDialog = dynamic(
  () =>
    import("@/components/dialogs/import-curl-dialog").then(
      (m) => m.ImportCurlDialog,
    ),
  { ssr: false },
);
const ImportCollectionDialog = dynamic(
  () =>
    import("@/components/dialogs/import-collection-dialog").then(
      (m) => m.ImportCollectionDialog,
    ),
  { ssr: false },
);
const CodegenDialog = dynamic(
  () =>
    import("@/components/dialogs/codegen-dialog").then((m) => m.CodegenDialog),
  { ssr: false },
);
const EnvironmentsDialog = dynamic(
  () =>
    import("@/components/dialogs/environments-dialog").then(
      (m) => m.EnvironmentsDialog,
    ),
  { ssr: false },
);
const SettingsDialog = dynamic(
  () =>
    import("@/components/dialogs/settings-dialog").then((m) => m.SettingsDialog),
  { ssr: false },
);
const PromptDialog = dynamic(
  () =>
    import("@/components/dialogs/app-dialogs").then((m) => m.PromptDialog),
  { ssr: false },
);

function WorkspaceInner() {
  const {
    ready,
    request,
    setRequest,
    saveRequest,
    quickSaveRequest,
    collections,
    createCollection,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useWorkspace();

  const [importOpen, setImportOpen] = useState(false);
  const [importCollectionOpen, setImportCollectionOpen] = useState(false);
  const [codegenOpen, setCodegenOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveCollectionId, setSaveCollectionId] = useState<string>("");
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [newCollectionForSaveOpen, setNewCollectionForSaveOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const collectionItems = useMemo(
    () => Object.fromEntries(collections.map((c) => [c.id, c.name])),
    [collections],
  );

  const handleQuickSave = async () => {
    await quickSaveRequest();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);
  };

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar
        onImportCurl={() => setImportOpen(true)}
        onImportCollection={() => setImportCollectionOpen(true)}
        onGenerateCode={() => setCodegenOpen(true)}
        onEnvironments={() => setEnvOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onSave={() => void handleQuickSave()}
      />

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[260px] shrink-0 overflow-hidden lg:block">
          <Sidebar />
        </div>

        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-[min(300px,88vw)] max-w-full p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <main className="flex min-w-0 flex-1 flex-col">
          <RequestTabs />
          <div className="border-b border-border/80 px-3 py-3 md:px-4">
            <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
              <Input
                value={request.name}
                onChange={(e) =>
                  setRequest((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-8 min-w-0 max-w-full flex-1 border-border bg-card px-2.5 text-sm font-medium shadow-none sm:max-w-xs sm:flex-none"
                aria-label="Request name"
              />

              {request.collectionId && collections.length > 0 ? (
                <>
                  <Select
                    value={request.collectionId}
                    items={collectionItems}
                    onValueChange={(value) => {
                      if (!value || value === request.collectionId) return;
                      setRequest((prev) => ({
                        ...prev,
                        collectionId: value,
                        folderId: undefined,
                      }));
                    }}
                  >
                    <SelectTrigger
                      className="h-8 w-full max-w-[11rem] text-xs sm:w-[9.5rem]"
                      aria-label="Collection"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">
                    {justSaved ? "Saved" : "Auto-saves"}
                  </span>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={() => void handleQuickSave()}
                >
                  Save
                </Button>
              )}
            </div>
            <RequestBar />
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(200px,42%)_minmax(220px,1fr)] lg:grid-rows-1 lg:grid-cols-[minmax(280px,38%)_minmax(0,1fr)]">
            <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto border-b border-border/60 bg-card/40 p-2.5 sm:p-3 lg:border-r lg:border-b-0 dark:bg-card/25 md:p-4">
              <RequestConfig />
            </div>
            <div className="min-h-0 min-w-0 overflow-hidden p-2.5 sm:p-3 md:p-4">
              <ResponseViewer />
            </div>
          </div>
        </main>
      </div>

      <ImportCurlDialog open={importOpen} onOpenChange={setImportOpen} />
      <ImportCollectionDialog
        open={importCollectionOpen}
        onOpenChange={setImportCollectionOpen}
      />
      <CodegenDialog open={codegenOpen} onOpenChange={setCodegenOpen} />
      <EnvironmentsDialog open={envOpen} onOpenChange={setEnvOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{saveAsNew ? "Save as new request" : "Save to collection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Request name"
              aria-label="Request name"
            />
            <Select
              value={saveCollectionId || (collections[0]?.id ?? "new")}
              items={{
                ...Object.fromEntries(collections.map((c) => [c.id, c.name])),
                new: "Create new collection…",
              }}
              onValueChange={(value) => {
                if (!value) return;
                if (value === "new") {
                  setSaveOpen(false);
                  setNewCollectionForSaveOpen(true);
                  return;
                }
                setSaveCollectionId(value);
              }}
            >
              <SelectTrigger aria-label="Collection" className="w-full">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value="new">Create new collection…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                let collectionId = saveCollectionId;
                if (!collectionId || collectionId === "new") {
                  if (collections[0]) {
                    collectionId = collections[0].id;
                  } else {
                    setSaveOpen(false);
                    setNewCollectionForSaveOpen(true);
                    return;
                  }
                }
                await saveRequest(collectionId, saveName, { asNew: saveAsNew });
                setSaveOpen(false);
                setJustSaved(true);
                window.setTimeout(() => setJustSaved(false), 1200);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PromptDialog
        open={newCollectionForSaveOpen}
        onOpenChange={setNewCollectionForSaveOpen}
        title="New collection"
        defaultValue="My Collection"
        confirmLabel="Create"
        onConfirm={async (name) => {
          const col = await createCollection(name);
          setSaveCollectionId(col.id);
          await saveRequest(col.id, saveName || request.name || "Untitled request", {
            asNew: saveAsNew,
          });
          setJustSaved(true);
          window.setTimeout(() => setJustSaved(false), 1200);
        }}
      />
    </div>
  );
}

export function Workspace() {
  return (
    <WorkspaceProvider>
      <ThemeSync />
      <WorkspaceInner />
    </WorkspaceProvider>
  );
}

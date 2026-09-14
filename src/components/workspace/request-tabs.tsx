"use client";

import { X } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { methodColorClass } from "@/lib/http/request";
import { cn } from "@/lib/utils";

export function RequestTabs() {
  const { tabs, activeTabId, setActiveTabId, closeTab, newRequest } = useWorkspace();

  if (tabs.length === 0) return null;

  return (
    <div
      className="flex items-end gap-0.5 overflow-x-auto border-b border-border/80 bg-muted/30 px-1 pt-1"
      role="tablist"
      aria-label="Open requests"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={active}
            className={cn(
              "group flex max-w-[11rem] shrink-0 items-center gap-1 rounded-t-md border border-b-0 px-2 py-1.5 text-xs",
              active
                ? "border-border/80 bg-background text-foreground"
                : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
              onClick={() => setActiveTabId(tab.id)}
            >
              <span
                className={cn(
                  "font-mono-ui shrink-0 text-[10px] font-semibold",
                  methodColorClass(tab.request.method),
                )}
              >
                {tab.request.method}
              </span>
              <span className="truncate">{tab.request.name || "Untitled"}</span>
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center rounded-sm hover:bg-muted",
                active ? "opacity-70" : "opacity-0 group-hover:opacity-70",
              )}
              aria-label={`Close ${tab.request.name || "tab"}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="mb-0.5 ml-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="New request tab"
        onClick={newRequest}
      >
        <span className="text-base leading-none">+</span>
      </button>
    </div>
  );
}

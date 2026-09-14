"use client";

import { Loader2, Send, Square, Zap } from "lucide-react";
import { HTTP_METHODS, type HttpMethod } from "@/types";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { methodColorClass, syncParamsFromUrl } from "@/lib/http/request";
import { SAMPLE_USERS_URL } from "@/lib/samples";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function RequestBar() {
  const {
    request,
    setRequest,
    sendRequest,
    sendSampleUrl,
    cancelRequest,
    sending,
    unresolvedVars,
  } = useWorkspace();

  const showSample = !request.url.trim() && !sending;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-stretch gap-2">
        <Select
          value={request.method}
          items={Object.fromEntries(HTTP_METHODS.map((m) => [m, m]))}
          onValueChange={(value) => {
            if (!value) return;
            setRequest((prev) => ({ ...prev, method: value as HttpMethod }));
          }}
        >
          <SelectTrigger
            className={cn(
              "font-mono-ui w-[7.25rem] shrink-0 border-border bg-card font-semibold",
              methodColorClass(request.method),
            )}
            aria-label="HTTP method"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[9rem]">
            {HTTP_METHODS.map((m) => (
              <SelectItem
                key={m}
                value={m}
                className={cn("font-mono-ui font-semibold", methodColorClass(m))}
              >
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative min-w-0 flex-1">
          <Input
            value={request.url}
            onChange={(e) => {
              const url = e.target.value;
              setRequest((prev) => ({
                ...prev,
                url,
                params: syncParamsFromUrl(url, prev.params),
              }));
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                void sendRequest();
              }
            }}
            placeholder="Enter URL"
            className={cn(
              "font-mono-ui h-9 w-full border-border/80 bg-card text-sm shadow-none placeholder:text-muted-foreground/40",
              (sending || showSample) && "pr-9",
            )}
            aria-label="Request URL"
            spellCheck={false}
            autoComplete="off"
            disabled={sending}
          />
          {sending ? (
            <Loader2
              className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-primary"
              aria-hidden
            />
          ) : showSample ? (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="absolute top-1/2 right-1.5 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Try sample request"
              title="Try sample request"
              onClick={() => void sendSampleUrl(SAMPLE_USERS_URL)}
            >
              <Zap className="size-3.5" />
            </Button>
          ) : null}
        </div>

        {sending ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-[5.5rem] border-primary/40 text-foreground"
            onClick={cancelRequest}
          >
            <Square className="size-3 fill-current" />
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            className="h-9 min-w-[5.5rem]"
            onClick={() => void sendRequest()}
          >
            <Send className="size-3.5" />
            Send
          </Button>
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 overflow-hidden rounded-full",
            sending ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={!sending}
        >
          <div className="h-full w-full bg-primary/15">
            {sending ? (
              <div className="request-progress h-full w-1/3 rounded-full bg-primary" />
            ) : null}
          </div>
        </div>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {sending ? "Sending request…" : ""}
      </span>

      {unresolvedVars.length > 0 ? (
        <p className="text-xs text-amber-800 dark:text-amber-400" role="status">
          Unresolved variables:{" "}
          {unresolvedVars.map((v) => (
            <code key={v} className="font-mono-ui mx-0.5 rounded bg-muted px-1">
              {`{{${v}}}`}
            </code>
          ))}
        </p>
      ) : null}
    </div>
  );
}

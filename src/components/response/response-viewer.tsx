"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Search, Zap } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { formatBytes, formatDuration } from "@/lib/id";
import { SAMPLE_USERS_URL } from "@/lib/samples";
import { jsonTextToTypeScript } from "@/lib/export/json-to-ts";
import { LARGE_RESPONSE_RENDER_BYTES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const JsonTree = dynamic(
  () => import("@/components/response/json-tree").then((m) => m.JsonTree),
  {
    ssr: false,
    loading: () => (
      <p className="text-xs text-muted-foreground">Loading viewer…</p>
    ),
  },
);

function statusTone(status: number): string {
  if (status >= 200 && status < 300) return "text-emerald-700 dark:text-emerald-400";
  if (status >= 300 && status < 400) return "text-amber-700 dark:text-amber-400";
  if (status >= 400) return "text-rose-700 dark:text-rose-400";
  return "text-muted-foreground";
}

function decodeBody(body: string, encoding: "text" | "base64"): string {
  if (encoding === "text") return body;
  try {
    if (typeof atob === "function") return atob(body);
    return Buffer.from(body, "base64").toString("utf8");
  } catch {
    return body;
  }
}

export function ResponseViewer() {
  const {
    response,
    sendError,
    history,
    sendSampleUrl,
    loadHistoryItem,
    sending,
    assertionResults,
  } = useWorkspace();
  const [viewMode, setViewMode] = useState<"pretty" | "raw" | "type">("pretty");
  const [forceRender, setForceRender] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const responseKey = response
    ? `${response.status}:${response.durationMs}:${response.sizeBytes}:${response.body.slice(0, 64)}`
    : "";

  useEffect(() => {
    setViewMode("pretty");
    setForceRender(false);
    setSearch("");
    setShowSearch(false);
  }, [responseKey]);

  const textBody = useMemo(() => {
    if (!response) return "";
    return decodeBody(response.body, response.bodyEncoding);
  }, [response]);

  const typeScriptBody = useMemo(() => {
    if (!textBody) return "";
    return jsonTextToTypeScript(textBody, "Root");
  }, [textBody]);

  const isLarge =
    Boolean(response) &&
    (response?.sizeBytes ?? 0) > LARGE_RESPONSE_RENDER_BYTES &&
    !forceRender;

  const contentType = response?.contentType ?? "";
  const isJson =
    /json/i.test(contentType) ||
    textBody.trim().startsWith("{") ||
    textBody.trim().startsWith("[");
  const isImage = /^image\//i.test(contentType) && !/svg/i.test(contentType);
  const isHtml = /html/i.test(contentType);
  const isBinary = response?.bodyEncoding === "base64" && !isImage;
  const empty = !response && !sendError && !(assertionResults && assertionResults.length > 0);

  const copyTarget = viewMode === "type" ? typeScriptBody : textBody;

  const download = () => {
    if (!response) return;
    const bytes =
      response.bodyEncoding === "base64"
        ? Uint8Array.from(atob(response.body), (c) => c.charCodeAt(0))
        : new TextEncoder().encode(response.body);
    const blob = new Blob([bytes], {
      type: response.contentType ?? "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${response.status}.${isJson ? "json" : "bin"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      className="flex h-full min-h-[220px] flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm dark:shadow-none"
      aria-label="Response"
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/70 px-3 py-2">
        {response ? (
          <>
            <p className={cn("font-mono-ui text-sm font-semibold", statusTone(response.status))}>
              {response.status} {response.statusText || ""}
            </p>
            <p className="font-mono-ui text-xs text-muted-foreground">
              {formatDuration(response.durationMs)}
            </p>
            <p className="font-mono-ui text-xs text-muted-foreground">
              {formatBytes(response.sizeBytes)}
              {response.truncated ? " (truncated)" : ""}
            </p>
          </>
        ) : (
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Response
          </h2>
        )}

        {response ? (
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "pretty" ? "secondary" : "ghost"}
              onClick={() => setViewMode("pretty")}
            >
              Pretty
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "raw" ? "secondary" : "ghost"}
              onClick={() => setViewMode("raw")}
            >
              Raw
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "type" ? "secondary" : "ghost"}
              onClick={() => setViewMode("type")}
              disabled={!isJson}
              title={isJson ? "JSON as TypeScript types" : "Only available for JSON"}
            >
              Type
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Search response"
              onClick={() => setShowSearch((v) => !v)}
            >
              <Search className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Copy response"
              onClick={() => void navigator.clipboard.writeText(copyTarget)}
            >
              <Copy className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Download response"
              onClick={download}
            >
              <Download className="size-3.5" />
            </Button>
          </div>
        ) : sending ? (
          <p className="ml-auto text-xs text-muted-foreground" role="status">
            Waiting for response…
          </p>
        ) : null}
      </header>

      {sendError ? (
        <div className="border-b border-border/70 bg-destructive/8 px-3 py-2 text-sm">
          <p className="font-medium text-destructive">{sendError.message}</p>
          {sendError.details ? (
            <details className="mt-1 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Technical details</summary>
              <pre className="font-mono-ui mt-1 whitespace-pre-wrap">{sendError.details}</pre>
            </details>
          ) : null}
        </div>
      ) : null}

      {showSearch && response ? (
        <div className="border-b border-border/70 px-3 py-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in response…"
            className="h-8 text-xs"
            aria-label="Search in response"
          />
        </div>
      ) : null}

      {empty ? (
        <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-8">
          {history.length > 0 ? (
            <>
              <div>
                <p className="text-sm font-medium">Send a request to see the response here.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Or reopen something from History — the last response is restored when available.
                </p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Recent
                </p>
                <ul className="space-y-1">
                  {history.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="font-mono-ui flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <span className="w-14 shrink-0 font-semibold">{item.method}</span>
                        <span className="truncate text-muted-foreground">{item.url}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Send your first request
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Enter a URL above and press Send. Test any API directly from your browser.
                </p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Try an example
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={sending}
                  onClick={() => void sendSampleUrl(SAMPLE_USERS_URL)}
                >
                  <Zap className="size-3.5" />
                  Sample request
                </Button>
              </div>
            </>
          )}
        </div>
      ) : response || (assertionResults && assertionResults.length > 0) ? (
        <Tabs defaultValue={response ? "body" : "tests"} className="flex min-h-0 flex-1 flex-col gap-0">
          <TabsList variant="line" className="w-full justify-start rounded-none border-b px-2">
            {response ? (
              <>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="cookies">Cookies</TabsTrigger>
              </>
            ) : null}
            <TabsTrigger value="tests">
              Tests
              {assertionResults && assertionResults.length > 0
                ? ` (${assertionResults.filter((r) => r.passed).length}/${assertionResults.length})`
                : ""}
            </TabsTrigger>
          </TabsList>

          {response ? (
            <>
          <TabsContent value="body" className="min-h-0 flex-1 overflow-auto p-3">
            {isLarge ? (
              <div className="space-y-3 rounded-md border border-border p-4">
                <p className="text-sm font-medium">
                  Large response: {formatBytes(response.sizeBytes)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rendering this response may affect performance.
                </p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => setForceRender(true)}>
                    View anyway
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={download}>
                    Download
                  </Button>
                </div>
              </div>
            ) : isImage && response.bodyEncoding === "base64" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:${contentType};base64,${response.body}`}
                alt="Response preview"
                className="max-h-[480px] max-w-full rounded border border-border"
              />
            ) : isBinary || (!response.body && response.truncated) ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {isBinary ? "Binary response" : "Body not cached in history"}
                </p>
                <p className="text-muted-foreground">
                  Content type: {contentType || "unknown"} · {formatBytes(response.sizeBytes)}
                </p>
                {isBinary ? (
                  <Button type="button" size="sm" onClick={download}>
                    Download
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Send the request again to load the full body.
                  </p>
                )}
              </div>
            ) : viewMode === "type" ? (
              <pre className="font-mono-ui whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground">
                {typeScriptBody}
              </pre>
            ) : viewMode === "raw" || !isJson ? (
              <pre className="font-mono-ui whitespace-pre-wrap break-all text-xs leading-relaxed">
                {textBody}
              </pre>
            ) : (
              <JsonTree data={safeParse(textBody)} search={search} />
            )}
          </TabsContent>

          <TabsContent value="headers" className="overflow-auto p-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-2 font-medium">Header</th>
                  <th className="pb-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <tr key={key} className="border-t border-border/60 align-top">
                    <td className="font-mono-ui py-1.5 pr-3 whitespace-nowrap">{key}</td>
                    <td className="font-mono-ui py-1.5 break-all text-muted-foreground">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="cookies" className="overflow-auto p-3">
            {parseCookies(response.headers).length === 0 ? (
              <p className="text-sm text-muted-foreground">No cookies in this response.</p>
            ) : (
              <ul className="space-y-2">
                {parseCookies(response.headers).map((c) => (
                  <li
                    key={c}
                    className="font-mono-ui rounded border border-border/70 px-2 py-1.5 text-xs"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
            </>
          ) : null}

          <TabsContent value="tests" className="overflow-auto p-3">
            {!assertionResults || assertionResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No test results. Add tests in the request Tests tab, then send again.
              </p>
            ) : (
              <ul className="space-y-2">
                {assertionResults.map((result) => (
                  <li
                    key={result.id}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm",
                      result.passed
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-rose-500/40 bg-rose-500/5",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        result.passed
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {result.passed ? "Pass" : "Fail"}
                    </p>
                    <p className="mt-1 font-mono-ui text-xs text-foreground/90">
                      {result.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      ) : null}
    </section>
  );
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseCookies(headers: Record<string, string>): string[] {
  const cookies: string[] = [];
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(...value.split(/,(?=\s*[^;]+=)/).map((s) => s.trim()));
    }
  }
  return cookies;
}

"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { KeyValuePair } from "@/types";
import { createPair } from "@/lib/id";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  valueType?: "text" | "password";
  suggestions?: string[];
}

export function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  valueType = "text",
  suggestions,
}: KeyValueEditorProps) {
  const update = (id: string, patch: Partial<KeyValuePair>) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const remove = (id: string) => {
    const next = pairs.filter((p) => p.id !== id);
    onChange(next.length ? next : [createPair()]);
  };

  const add = () => onChange([...pairs, createPair()]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= pairs.length) return;
    const next = [...pairs];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[28px_1fr_1fr_28px_28px] gap-1.5 px-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <span />
        <span>Key</span>
        <span>Value</span>
        <span className="sr-only">Enabled</span>
        <span className="sr-only">Delete</span>
      </div>
      {pairs.map((pair, index) => (
        <div
          key={pair.id}
          className={cn(
            "grid grid-cols-[28px_1fr_1fr_28px_28px] items-center gap-1.5",
            !pair.enabled && "opacity-50",
          )}
        >
          <button
            type="button"
            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Reorder"
            onClick={() => move(index, index - 1)}
            onContextMenu={(e) => {
              e.preventDefault();
              move(index, index + 1);
            }}
            title="Click to move up, right-click to move down"
          >
            <GripVertical className="size-3.5" />
          </button>
          <Input
            value={pair.key}
            onChange={(e) => update(pair.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className="font-mono-ui h-8 text-xs"
            list={suggestions ? `kv-suggest-${pair.id}` : undefined}
            aria-label="Key"
          />
          {suggestions ? (
            <datalist id={`kv-suggest-${pair.id}`}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          ) : null}
          <Input
            type={valueType}
            value={pair.value}
            onChange={(e) => update(pair.id, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className="font-mono-ui h-8 text-xs"
            aria-label="Value"
          />
          <div className="flex items-center justify-center">
            <Checkbox
              checked={pair.enabled}
              onCheckedChange={(checked) =>
                update(pair.id, { enabled: Boolean(checked) })
              }
              aria-label="Enabled"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(pair.id)}
            aria-label="Delete row"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={add}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

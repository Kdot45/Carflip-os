"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { ObdCodeLookupResult, ObdReading } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { parseObdCodeTokens } from "@/lib/obd";

export function ObdSection({
  projectId,
  readings,
  onChanged,
}: {
  projectId: string;
  readings: ObdReading[];
  onChanged: (readings: ObdReading[]) => void;
}) {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lookups, setLookups] = useState<Record<string, ObdCodeLookupResult>>({});

  useEffect(() => {
    const combinedText = readings.map((r) => r.rawCodesText).join(" ");
    // Nothing to look up — and with no readings there are no code tokens to
    // render anyway, so stale lookups from a since-cleared list are harmless.
    if (!combinedText.trim()) return;
    let cancelled = false;
    api
      .post<{ results: ObdCodeLookupResult[] }>("/obd-codes/lookup", { text: combinedText })
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, ObdCodeLookupResult> = {};
        res.results.forEach((r) => {
          map[r.code] = r;
        });
        setLookups(map);
      })
      .catch(() => {
        // Reference lookup is a bonus, not a requirement — the raw codes
        // the user typed are still saved and shown either way.
      });
    return () => {
      cancelled = true;
    };
  }, [readings]);

  async function addReading(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSaving(true);
    try {
      const { obdReading } = await api.post<{ obdReading: ObdReading }>(`/projects/${projectId}/obd`, {
        rawCodesText: text,
      });
      onChanged([obdReading, ...readings]);
      setText("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="OBD-II codes" subtitle="Paste codes from a scan, one entry per reading." />
      {readings.length > 0 && (
        <div className="mb-3 space-y-2">
          {readings.map((r) => {
            const tokens = parseObdCodeTokens(r.rawCodesText);
            return (
              <div key={r.id} className="rounded-lg bg-ink-700 p-2.5 text-sm">
                <p className="font-mono text-ink-50">{r.rawCodesText}</p>
                <p className="mt-0.5 text-xs text-ink-300">{formatDate(r.createdAt)}</p>
                {tokens.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-ink-600 pt-2">
                    {tokens.map((code) => {
                      const lookup = lookups[code];
                      return (
                        <p key={code} className="text-xs">
                          <span className="font-mono font-semibold text-accent-500">{code}</span>{" "}
                          {lookup?.found ? (
                            <span className="text-ink-100">
                              {lookup.description} <span className="text-ink-300">({lookup.system})</span>
                            </span>
                          ) : (
                            <span className="text-ink-300">
                              not in our generic-code reference — likely manufacturer-specific
                            </span>
                          )}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <form onSubmit={addReading} className="flex flex-col gap-2 sm:flex-row">
        <Textarea
          rows={2}
          placeholder="e.g. P0420, P0171"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Add"}
        </Button>
      </form>
    </Card>
  );
}

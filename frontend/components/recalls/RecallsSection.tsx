"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api, ApiRequestError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { RecallRecord } from "@/lib/types";

export function RecallsSection({ projectId }: { projectId: string }) {
  const [recalls, setRecalls] = useState<RecallRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ recalls: RecallRecord[] }>(`/projects/${projectId}/recalls`)
      .then((res) => {
        if (!cancelled) setRecalls(res.recalls);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? err.message : "Couldn't load recall data.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <Card>
      <CardHeader title="Safety recalls" subtitle="Official NHTSA data for this year/make/model." />
      {error && <p className="text-sm text-bad">{error}</p>}
      {!error && recalls === null && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {!error && recalls !== null && recalls.length === 0 && (
        <p className="text-sm text-ink-300">No open recalls found for this vehicle.</p>
      )}
      {!error && recalls !== null && recalls.length > 0 && (
        <div className="space-y-3">
          {recalls.map((r) => (
            <div key={r.campaignNumber} className="rounded-xl border border-bad/30 bg-bad/10 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="bad">Recall</Badge>
                <p className="font-medium text-ink-50">{r.component}</p>
              </div>
              {r.summary && <p className="mt-1.5 text-sm text-ink-100">{r.summary}</p>}
              {r.consequence && <p className="mt-1 text-sm text-ink-200">{r.consequence}</p>}
              {r.remedy && <p className="mt-1 text-sm text-ink-200">Remedy: {r.remedy}</p>}
              <p className="mt-1.5 font-mono text-xs text-ink-300">
                Campaign {r.campaignNumber}
                {r.reportedDate && ` · Reported ${formatDate(r.reportedDate)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

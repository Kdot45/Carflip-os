"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { DealLabelBadge } from "@/components/ui/Badge";
import { AiDisclaimer } from "@/components/ui/AiDisclaimer";
import { formatCurrency, formatPct } from "@/lib/format";
import { api, ApiRequestError } from "@/lib/api";
import { BidCommentaryResult, MaxBidResult, Project } from "@/lib/types";
import clsx from "@/lib/clsx";

interface UpdateResponse {
  project: Project;
  maxBid: MaxBidResult | null;
}

export function MaxBidPanel({
  project,
  maxBid,
  hasEstimate,
  onUpdated,
}: {
  project: Project;
  maxBid: MaxBidResult | null;
  hasEstimate: boolean;
  onUpdated: (project: Project, maxBid: MaxBidResult | null) => void;
}) {
  const [form, setForm] = useState({
    expectedResalePrice: project.expectedResalePrice !== null ? String(project.expectedResalePrice) : "",
    sellingCosts: String(project.sellingCosts),
    targetProfitAmount: project.targetProfitAmount !== null ? String(project.targetProfitAmount) : "",
    targetMarginPct: project.targetMarginPct !== null ? String(project.targetMarginPct) : "",
  });
  const [aiTake, setAiTake] = useState<BidCommentaryResult | null>(null);
  const [isLoadingTake, setIsLoadingTake] = useState(false);
  const [takeError, setTakeError] = useState<string | null>(null);

  async function getAiTake() {
    setIsLoadingTake(true);
    setTakeError(null);
    try {
      const result = await api.post<BidCommentaryResult>(`/projects/${project.id}/ai/bid-commentary`);
      setAiTake(result);
    } catch (err) {
      setTakeError(err instanceof ApiRequestError ? err.message : "Couldn't get a take right now.");
    } finally {
      setIsLoadingTake(false);
    }
  }

  async function save() {
    const res = await api.patch<UpdateResponse>(`/projects/${project.id}`, {
      expectedResalePrice: form.expectedResalePrice ? Number(form.expectedResalePrice) : null,
      sellingCosts: form.sellingCosts ? Number(form.sellingCosts) : 0,
      targetProfitAmount: form.targetProfitAmount ? Number(form.targetProfitAmount) : null,
      targetMarginPct: form.targetMarginPct ? Number(form.targetMarginPct) : null,
    });
    onUpdated(res.project, res.maxBid);
  }

  const dealLabel = maxBid?.dealLabel ?? "unknown";
  const bidTone =
    dealLabel === "good" ? "text-good" : dealLabel === "marginal" ? "text-marginal" : dealLabel === "bad" ? "text-bad" : "text-ink-300";
  const hasBid = maxBid?.suggestedMaxBid !== null && maxBid !== undefined && maxBid !== null;

  return (
    <Card>
      <CardHeader title="Max bid & profit" subtitle="What should you actually offer?" />

      {!hasEstimate && (
        <p className="mb-4 rounded-lg bg-ink-700 p-3 text-sm text-ink-200">
          Add a repair estimate first — the max bid depends on expected repair cost.
        </p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="expectedResalePrice">Expected resale price</Label>
          <Input
            id="expectedResalePrice"
            type="number"
            value={form.expectedResalePrice}
            onChange={(e) => setForm({ ...form, expectedResalePrice: e.target.value })}
            onBlur={save}
          />
        </div>
        <div>
          <Label htmlFor="sellingCosts">Selling costs</Label>
          <Input
            id="sellingCosts"
            type="number"
            value={form.sellingCosts}
            onChange={(e) => setForm({ ...form, sellingCosts: e.target.value })}
            onBlur={save}
          />
        </div>
        <div>
          <Label htmlFor="targetMarginPct">Target margin %</Label>
          <Input
            id="targetMarginPct"
            type="number"
            placeholder="Uses your default"
            value={form.targetMarginPct}
            onChange={(e) => setForm({ ...form, targetMarginPct: e.target.value })}
            onBlur={save}
          />
        </div>
        <div>
          <Label htmlFor="targetProfitAmount">Target profit $ (optional)</Label>
          <Input
            id="targetProfitAmount"
            type="number"
            placeholder="Overrides margin %"
            value={form.targetProfitAmount}
            onChange={(e) => setForm({ ...form, targetProfitAmount: e.target.value })}
            onBlur={save}
          />
        </div>
      </div>

      <div className="brushed relative overflow-hidden rounded-2xl border border-ink-500 bg-gradient-to-b from-ink-700 via-ink-800 to-ink-900 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">Suggested max bid</p>
        <p
          className={clsx(
            "mt-1 font-mono text-5xl font-extrabold tracking-tight",
            hasBid ? "text-white" : "text-ink-400"
          )}
        >
          {formatCurrency(maxBid?.suggestedMaxBid)}
        </p>
        <div className="mt-2 flex justify-center">
          <DealLabelBadge label={dealLabel} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border border-ink-500 bg-ink-700 p-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">Profit at asking</p>
          <p className={clsx("font-mono text-lg font-bold", bidTone)}>{formatCurrency(maxBid?.expectedProfitAtAsking)}</p>
        </div>
        <div className="rounded-xl border border-ink-500 bg-ink-700 p-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-300">Profit at max bid</p>
          <p className="font-mono text-lg font-bold text-ink-50">{formatCurrency(maxBid?.expectedProfitAtMaxBid)}</p>
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-xs text-ink-300">
        Margin at asking price: {formatPct(maxBid?.marginAtAskingPct)}
      </p>

      {hasEstimate && (
        <div className="mt-4 border-t border-ink-600 pt-4">
          {aiTake ? (
            <div className="rounded-xl border-l-2 border-accent-500 bg-ink-700 p-3">
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-accent-500">AI&rsquo;s take</p>
              <p className="mt-1.5 text-sm italic leading-relaxed text-ink-100">{aiTake.take}</p>
              <AiDisclaimer text={aiTake.disclaimer} />
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={getAiTake} disabled={isLoadingTake} fullWidth>
              {isLoadingTake ? "Thinking…" : "🤖 Get AI's take on this deal"}
            </Button>
          )}
          {takeError && <p className="mt-2 text-center text-xs text-bad">{takeError}</p>}
        </div>
      )}
    </Card>
  );
}

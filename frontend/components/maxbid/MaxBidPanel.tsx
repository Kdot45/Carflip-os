"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { DealLabelBadge } from "@/components/ui/Badge";
import { formatCurrency, formatPct } from "@/lib/format";
import { api } from "@/lib/api";
import { MaxBidResult, Project } from "@/lib/types";
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
    dealLabel === "good" ? "text-good" : dealLabel === "marginal" ? "text-marginal" : dealLabel === "bad" ? "text-bad" : "text-slate-400";

  return (
    <Card>
      <CardHeader title="Max bid & profit" subtitle="What should you actually offer?" />

      {!hasEstimate && (
        <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
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

      <div className="rounded-2xl bg-slate-900 p-5 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">Suggested max bid</p>
        <p className={clsx("mt-1 text-4xl font-bold", maxBid?.suggestedMaxBid !== null && maxBid !== null ? "text-white" : "text-slate-500")}>
          {formatCurrency(maxBid?.suggestedMaxBid)}
        </p>
        <div className="mt-2 flex justify-center">
          <DealLabelBadge label={dealLabel} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Profit at asking price</p>
          <p className={clsx("text-lg font-semibold", bidTone)}>{formatCurrency(maxBid?.expectedProfitAtAsking)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Profit at max bid</p>
          <p className="text-lg font-semibold text-slate-900">{formatCurrency(maxBid?.expectedProfitAtMaxBid)}</p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        Margin at asking price: {formatPct(maxBid?.marginAtAskingPct)}
      </p>
    </Card>
  );
}

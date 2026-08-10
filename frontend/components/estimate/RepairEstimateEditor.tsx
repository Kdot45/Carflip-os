"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/format";
import { api } from "@/lib/api";
import { MaxBidResult, RepairEstimate } from "@/lib/types";
import { LineItemForm, LineItemFormValues, lineItemToFormValues } from "./LineItemForm";
import { LineItemRow } from "./LineItemRow";

interface EstimateResponse {
  estimate: RepairEstimate;
  maxBid: MaxBidResult;
}

export function RepairEstimateEditor({
  projectId,
  estimate,
  onChanged,
}: {
  projectId: string;
  estimate: RepairEstimate | null;
  onChanged: (estimate: RepairEstimate, maxBid: MaxBidResult) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavingLineItem, setIsSavingLineItem] = useState(false);
  const [feesForm, setFeesForm] = useState({
    diagnosticsTotal: estimate ? String(estimate.diagnosticsTotal) : "0",
    consumablesTotal: estimate ? String(estimate.consumablesTotal) : "0",
    feesTotal: estimate ? String(estimate.feesTotal) : "0",
    contingencyPct: estimate ? String(estimate.contingencyPct) : "15",
  });

  async function createEstimate() {
    setIsCreating(true);
    try {
      const res = await api.post<EstimateResponse>(`/projects/${projectId}/estimate`, {});
      onChanged(res.estimate, res.maxBid);
      setFeesForm({
        diagnosticsTotal: String(res.estimate.diagnosticsTotal),
        consumablesTotal: String(res.estimate.consumablesTotal),
        feesTotal: String(res.estimate.feesTotal),
        contingencyPct: String(res.estimate.contingencyPct),
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function saveFees() {
    const res = await api.patch<EstimateResponse>(`/projects/${projectId}/estimate`, {
      diagnosticsTotal: Number(feesForm.diagnosticsTotal),
      consumablesTotal: Number(feesForm.consumablesTotal),
      feesTotal: Number(feesForm.feesTotal),
      contingencyPct: Number(feesForm.contingencyPct),
    });
    onChanged(res.estimate, res.maxBid);
  }

  async function addLineItem(values: LineItemFormValues) {
    if (!estimate) return;
    setIsSavingLineItem(true);
    try {
      const res = await api.post<EstimateResponse>(`/estimates/${estimate.id}/line-items`, {
        ...values,
        partsCost: Number(values.partsCost),
        laborHours: Number(values.laborHours),
        laborRate: Number(values.laborRate),
      });
      onChanged(res.estimate, res.maxBid);
      setIsAdding(false);
    } finally {
      setIsSavingLineItem(false);
    }
  }

  async function updateLineItem(id: string, values: LineItemFormValues) {
    setIsSavingLineItem(true);
    try {
      const res = await api.patch<EstimateResponse>(`/line-items/${id}`, {
        ...values,
        partsCost: Number(values.partsCost),
        laborHours: Number(values.laborHours),
        laborRate: Number(values.laborRate),
      });
      onChanged(res.estimate, res.maxBid);
      setEditingId(null);
    } finally {
      setIsSavingLineItem(false);
    }
  }

  async function deleteLineItem(id: string) {
    const res = await api.delete<EstimateResponse>(`/line-items/${id}`);
    onChanged(res.estimate, res.maxBid);
  }

  if (!estimate) {
    return (
      <Card>
        <CardHeader title="Repair estimate" subtitle="Build a checklist of what this car needs before you bid." />
        <Button onClick={createEstimate} disabled={isCreating}>
          {isCreating ? "Starting…" : "Start repair estimate"}
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Repair estimate" subtitle={`${estimate.lineItems.length} line item(s)`} />

      <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-center sm:grid-cols-6">
        <SummaryStat label="Parts" value={formatCurrencyPrecise(estimate.partsTotal)} />
        <SummaryStat label="Labor" value={formatCurrencyPrecise(estimate.laborTotal)} />
        <SummaryStat label="Diagnostics" value={formatCurrencyPrecise(estimate.diagnosticsTotal)} />
        <SummaryStat label="Consumables" value={formatCurrencyPrecise(estimate.consumablesTotal)} />
        <SummaryStat label="Fees" value={formatCurrencyPrecise(estimate.feesTotal)} />
        <SummaryStat label={`Contingency ${estimate.contingencyPct}%`} value={formatCurrencyPrecise(estimate.contingencyTotal)} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <RangeStat label="Best case" value={formatCurrency(estimate.totalLow)} />
        <RangeStat label="Expected" value={formatCurrency(estimate.totalExpected)} highlight />
        <RangeStat label="Worst case" value={formatCurrency(estimate.totalWorst)} />
      </div>

      <details className="mt-4 rounded-xl border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Edit diagnostics, consumables, fees & contingency %
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label htmlFor="diagnosticsTotal">Diagnostics</Label>
            <Input
              id="diagnosticsTotal"
              type="number"
              value={feesForm.diagnosticsTotal}
              onChange={(e) => setFeesForm({ ...feesForm, diagnosticsTotal: e.target.value })}
              onBlur={saveFees}
            />
          </div>
          <div>
            <Label htmlFor="consumablesTotal">Consumables</Label>
            <Input
              id="consumablesTotal"
              type="number"
              value={feesForm.consumablesTotal}
              onChange={(e) => setFeesForm({ ...feesForm, consumablesTotal: e.target.value })}
              onBlur={saveFees}
            />
          </div>
          <div>
            <Label htmlFor="feesTotal">Fees</Label>
            <Input
              id="feesTotal"
              type="number"
              value={feesForm.feesTotal}
              onChange={(e) => setFeesForm({ ...feesForm, feesTotal: e.target.value })}
              onBlur={saveFees}
            />
          </div>
          <div>
            <Label htmlFor="contingencyPct">Contingency %</Label>
            <Input
              id="contingencyPct"
              type="number"
              value={feesForm.contingencyPct}
              onChange={(e) => setFeesForm({ ...feesForm, contingencyPct: e.target.value })}
              onBlur={saveFees}
            />
          </div>
        </div>
      </details>

      <div className="mt-4">
        {estimate.lineItems.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="py-2">
              <LineItemForm
                initial={lineItemToFormValues(item)}
                onSubmit={(values) => updateLineItem(item.id, values)}
                onCancel={() => setEditingId(null)}
                isSaving={isSavingLineItem}
                submitLabel="Save changes"
              />
            </div>
          ) : (
            <LineItemRow
              key={item.id}
              item={item}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => deleteLineItem(item.id)}
            />
          )
        )}
        {estimate.lineItems.length === 0 && !isAdding && (
          <p className="py-3 text-sm text-slate-500">No line items yet. Add what this car needs.</p>
        )}
      </div>

      {isAdding ? (
        <div className="mt-2">
          <LineItemForm
            onSubmit={addLineItem}
            onCancel={() => setIsAdding(false)}
            isSaving={isSavingLineItem}
            submitLabel="Add item"
          />
        </div>
      ) : (
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setIsAdding(true)}>
          + Add line item
        </Button>
      )}
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] leading-tight text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function RangeStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-xl bg-accent-50 p-3" : "rounded-xl bg-slate-50 p-3"}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={highlight ? "text-lg font-bold text-accent-700" : "text-lg font-bold text-slate-900"}>{value}</p>
    </div>
  );
}

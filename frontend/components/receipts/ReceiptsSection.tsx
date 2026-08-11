"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { formatCurrencyPrecise, formatDate } from "@/lib/format";
import { api } from "@/lib/api";
import { Receipt } from "@/lib/types";

export function ReceiptsSection({
  projectId,
  receipts,
  onChanged,
}: {
  projectId: string;
  receipts: Receipt[];
  onChanged: (receipts: Receipt[]) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    photoUrl: "",
  });

  const total = receipts.reduce((sum, r) => sum + r.amount, 0);

  async function addReceipt(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { receipt } = await api.post<{ receipt: Receipt }>(`/projects/${projectId}/receipts`, {
        amount: Number(form.amount),
        description: form.description,
        date: new Date(form.date).toISOString(),
        photoUrl: form.photoUrl || null,
      });
      onChanged([receipt, ...receipts]);
      setForm({ amount: "", description: "", date: new Date().toISOString().slice(0, 10), photoUrl: "" });
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteReceipt(id: string) {
    await api.delete(`/receipts/${id}`);
    onChanged(receipts.filter((r) => r.id !== id));
  }

  return (
    <Card>
      <CardHeader title="Receipts" subtitle={`${formatCurrencyPrecise(total)} spent so far`} />

      <div className="space-y-2">
        {receipts.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-b border-ink-700 py-2 last:border-0">
            <div>
              <p className="text-sm font-medium text-ink-50">{r.description}</p>
              <p className="text-xs text-ink-300">{formatDate(r.date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-ink-50">{formatCurrencyPrecise(r.amount)}</p>
              <button onClick={() => deleteReceipt(r.id)} className="text-xs text-ink-300 hover:text-bad">
                Delete
              </button>
            </div>
          </div>
        ))}
        {receipts.length === 0 && <p className="text-sm text-ink-300">No receipts yet.</p>}
      </div>

      {isAdding ? (
        <form onSubmit={addReceipt} className="mt-3 space-y-3 rounded-xl border border-ink-500 bg-ink-700 p-3">
          <div>
            <Label htmlFor="r-description">Description</Label>
            <Input
              id="r-description"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="r-amount">Amount</Label>
              <Input
                id="r-amount"
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="r-date">Date</Label>
              <Input
                id="r-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? "Saving…" : "Add receipt"}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setIsAdding(true)}>
          + Add receipt
        </Button>
      )}
    </Card>
  );
}

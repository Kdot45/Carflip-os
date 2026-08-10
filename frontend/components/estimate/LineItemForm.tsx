"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { LineItemCategory, RepairLineItem, Severity } from "@/lib/types";

export interface LineItemFormValues {
  category: LineItemCategory;
  title: string;
  description: string;
  severity: Severity;
  partsCost: string;
  laborHours: string;
  laborRate: string;
  diyOk: boolean;
}

const DEFAULT_VALUES: LineItemFormValues = {
  category: "mechanical",
  title: "",
  description: "",
  severity: "required",
  partsCost: "0",
  laborHours: "0",
  laborRate: "0",
  diyOk: false,
};

export function lineItemToFormValues(item: RepairLineItem): LineItemFormValues {
  return {
    category: item.category,
    title: item.title,
    description: item.description ?? "",
    severity: item.severity,
    partsCost: String(item.partsCost),
    laborHours: String(item.laborHours),
    laborRate: String(item.laborRate),
    diyOk: item.diyOk,
  };
}

export function LineItemForm({
  initial,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel,
}: {
  initial?: LineItemFormValues;
  onSubmit: (values: LineItemFormValues) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel: string;
}) {
  const [values, setValues] = useState<LineItemFormValues>(initial ?? DEFAULT_VALUES);

  function update<K extends keyof LineItemFormValues>(key: K, value: LineItemFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
    >
      <div>
        <Label htmlFor="li-title">Title</Label>
        <Input id="li-title" required value={values.title} onChange={(e) => update("title", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="li-category">Category</Label>
          <Select id="li-category" value={values.category} onChange={(e) => update("category", e.target.value as LineItemCategory)}>
            <option value="mechanical">Mechanical</option>
            <option value="body">Body</option>
            <option value="electrical">Electrical</option>
            <option value="tires">Tires</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="li-severity">Severity</Label>
          <Select id="li-severity" value={values.severity} onChange={(e) => update("severity", e.target.value as Severity)}>
            <option value="safety">Safety</option>
            <option value="required">Required</option>
            <option value="cosmetic">Cosmetic</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="li-description">Description</Label>
        <Textarea
          id="li-description"
          rows={2}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="li-parts">Parts cost</Label>
          <Input
            id="li-parts"
            type="number"
            inputMode="decimal"
            value={values.partsCost}
            onChange={(e) => update("partsCost", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="li-hours">Labor hrs</Label>
          <Input
            id="li-hours"
            type="number"
            inputMode="decimal"
            value={values.laborHours}
            onChange={(e) => update("laborHours", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="li-rate">Labor rate</Label>
          <Input
            id="li-rate"
            type="number"
            inputMode="decimal"
            value={values.laborRate}
            onChange={(e) => update("laborRate", e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={values.diyOk} onChange={(e) => update("diyOk", e.target.checked)} />
        DIY-friendly (skip the shop for this one)
      </label>
      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSaving || !values.title}>
          {isSaving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

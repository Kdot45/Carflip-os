"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { ChecklistItem } from "@/lib/types";
import clsx from "@/lib/clsx";

export function ChecklistSection({
  projectId,
  items,
  onChanged,
}: {
  projectId: string;
  items: ChecklistItem[];
  onChanged: (items: ChecklistItem[]) => void;
}) {
  const [newText, setNewText] = useState("");

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    const { checklistItem } = await api.post<{ checklistItem: ChecklistItem }>(
      `/projects/${projectId}/checklist`,
      { text: newText }
    );
    onChanged([...items, checklistItem]);
    setNewText("");
  }

  async function toggleDone(item: ChecklistItem) {
    const { checklistItem } = await api.patch<{ checklistItem: ChecklistItem }>(`/checklist/${item.id}`, {
      done: !item.done,
    });
    onChanged(items.map((i) => (i.id === item.id ? checklistItem : i)));
  }

  async function deleteItem(id: string) {
    await api.delete(`/checklist/${id}`);
    onChanged(items.filter((i) => i.id !== id));
  }

  const doneCount = items.filter((i) => i.done).length;

  return (
    <Card>
      <CardHeader title="Checklist" subtitle={items.length ? `${doneCount}/${items.length} done` : undefined} />

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 py-1.5">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleDone(item)}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-accent-500 focus:ring-accent-400"
            />
            <span className={clsx("flex-1 text-sm", item.done ? "text-slate-400 line-through" : "text-slate-800")}>
              {item.text}
            </span>
            <button onClick={() => deleteItem(item.id)} className="text-xs text-slate-400 hover:text-red-600">
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
      </div>

      <form onSubmit={addItem} className="mt-3 flex gap-2">
        <Input placeholder="Add a task…" value={newText} onChange={(e) => setNewText(e.target.value)} />
        <Button type="submit" size="sm">
          Add
        </Button>
      </form>
    </Card>
  );
}

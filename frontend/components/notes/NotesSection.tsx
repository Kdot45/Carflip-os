"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";

export function NotesSection({ project, onUpdated }: { project: Project; onUpdated: (project: Project) => void }) {
  const [text, setText] = useState(project.listingNotesText ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = text !== (project.listingNotesText ?? "");

  async function save() {
    setIsSaving(true);
    try {
      const { project: updated } = await api.patch<{ project: Project }>(`/projects/${project.id}`, {
        listingNotesText: text,
      });
      onUpdated(updated);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Notes" subtitle="Listing text, call notes, anything worth remembering." />
      <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      {isDirty && (
        <Button size="sm" className="mt-2" onClick={save} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save notes"}
        </Button>
      )}
    </Card>
  );
}

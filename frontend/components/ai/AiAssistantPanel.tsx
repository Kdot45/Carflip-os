"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { AiDisclaimer } from "@/components/ui/AiDisclaimer";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { ChatMessage, ChatResult, MaxBidResult, RepairEstimate, TriageResult } from "@/lib/types";
import clsx from "@/lib/clsx";

interface EstimateResponse {
  estimate: RepairEstimate;
  maxBid: MaxBidResult;
}

const RISK_TONE: Record<TriageResult["riskLevel"], "good" | "marginal" | "bad"> = {
  low: "good",
  medium: "marginal",
  high: "bad",
};

export function AiAssistantPanel({
  projectId,
  hasEstimate,
  estimateId,
  onLineItemsAdded,
}: {
  projectId: string;
  hasEstimate: boolean;
  estimateId: string | null;
  onLineItemsAdded: (estimate: RepairEstimate, maxBid: MaxBidResult) => void;
}) {
  const [tab, setTab] = useState<"triage" | "chat">("triage");
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  async function runTriage() {
    setIsTriaging(true);
    try {
      const result = await api.post<TriageResult>(`/projects/${projectId}/ai/triage`, { symptoms });
      setTriage(result);
    } finally {
      setIsTriaging(false);
    }
  }

  async function addSuggestedItems() {
    if (!triage || !estimateId) return;
    setIsAddingItems(true);
    try {
      let latest: EstimateResponse | null = null;
      for (const item of triage.suggestedLineItems) {
        latest = await api.post<EstimateResponse>(`/estimates/${estimateId}/line-items`, {
          category: item.category,
          title: item.title,
          description: item.description,
          severity: item.severity,
          partsCost: item.estimatedPartsCost,
          laborHours: item.estimatedLaborHours,
          laborRate: 0,
          diyOk: item.diyOk,
        });
      }
      if (latest) onLineItemsAdded(latest.estimate, latest.maxBid);
    } finally {
      setIsAddingItems(false);
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: chatInput }];
    setMessages(nextMessages);
    setChatInput("");
    setIsChatting(true);
    try {
      const result = await api.post<ChatResult>(`/projects/${projectId}/ai/chat`, { messages: nextMessages });
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
    } finally {
      setIsChatting(false);
    }
  }

  return (
    <Card>
      <CardHeader title="AI assistant" subtitle="Paste symptoms, ask questions, get triage suggestions." />

      <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1">
        {(["triage", "chat"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "triage" ? (
        <div>
          <Textarea
            rows={3}
            placeholder="Describe symptoms (noises, warning lights, how it drives)…"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <Button size="sm" className="mt-2" onClick={runTriage} disabled={isTriaging}>
            {isTriaging ? "Thinking…" : "Run triage"}
          </Button>

          {triage && (
            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Risk level:</span>
                <Badge tone={RISK_TONE[triage.riskLevel]}>{triage.riskLevel}</Badge>
              </div>
              <p className="text-sm text-slate-700">{triage.summary}</p>
              {triage.obdExplanation && (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium">OBD codes: </span>
                  {triage.obdExplanation}
                </p>
              )}
              {triage.suggestedLineItems.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-sm font-medium text-slate-700">Suggested repair items</p>
                  <ul className="space-y-1">
                    {triage.suggestedLineItems.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600">
                        • {item.title} — ~${item.estimatedPartsCost} parts, {item.estimatedLaborHours}h labor
                      </li>
                    ))}
                  </ul>
                  {hasEstimate ? (
                    <Button size="sm" variant="secondary" className="mt-2" onClick={addSuggestedItems} disabled={isAddingItems}>
                      {isAddingItems ? "Adding…" : "Add all to repair estimate"}
                    </Button>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">Start a repair estimate to add these items.</p>
                  )}
                </div>
              )}
              <AiDisclaimer text={triage.disclaimer} />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-3 max-h-72 space-y-2 overflow-y-auto">
            {messages.map((m, i) => (
              <div
                key={i}
                className={clsx(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.role === "user" ? "ml-auto bg-accent-500 text-white" : "bg-slate-100 text-slate-800"
                )}
              >
                {m.content}
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                Ask about this deal — e.g. &ldquo;Is a rebuilt title a dealbreaker here?&rdquo;
              </p>
            )}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <Input
              placeholder="Ask a question…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatting}
            />
            <Button type="submit" size="sm" disabled={isChatting}>
              {isChatting ? "…" : "Send"}
            </Button>
          </form>
          {messages.length > 0 && <AiDisclaimer text="This is an estimate only and not a certified mechanical or legal opinion. Always consult a professional mechanic and check title history before buying." />}
        </div>
      )}
    </Card>
  );
}

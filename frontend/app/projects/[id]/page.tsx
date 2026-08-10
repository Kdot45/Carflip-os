"use client";

import { use, useEffect, useState } from "react";
import { AuthGuard } from "@/components/nav/AuthGuard";
import { PageSpinner } from "@/components/ui/Spinner";
import { DealSummaryCard } from "@/components/deal/DealSummaryCard";
import { ObdSection } from "@/components/deal/ObdSection";
import { RepairEstimateEditor } from "@/components/estimate/RepairEstimateEditor";
import { MaxBidPanel } from "@/components/maxbid/MaxBidPanel";
import { NotesSection } from "@/components/notes/NotesSection";
import { ReceiptsSection } from "@/components/receipts/ReceiptsSection";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";
import { PhotosSection } from "@/components/photos/PhotosSection";
import { AiAssistantPanel } from "@/components/ai/AiAssistantPanel";
import { BottomActionBar } from "@/components/nav/BottomActionBar";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { MaxBidResult, ProjectDetail, RepairEstimate } from "@/lib/types";

function ProjectDetailContent({ id }: { id: string }) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [estimate, setEstimate] = useState<RepairEstimate | null>(null);
  const [maxBid, setMaxBid] = useState<MaxBidResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<ProjectDetail>(`/projects/${id}`),
      api.get<{ estimate: RepairEstimate | null; maxBid: MaxBidResult | null }>(`/projects/${id}/estimate`),
    ]).then(([projectDetail, estimateRes]) => {
      if (cancelled) return;
      setDetail(projectDetail);
      setEstimate(estimateRes.estimate);
      setMaxBid(estimateRes.maxBid);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!detail) return <PageSpinner />;

  const { project } = detail;

  return (
    <div className="space-y-4 pb-6">
      <DealSummaryCard
        project={project}
        onUpdated={(updated) => setDetail({ ...detail, project: updated })}
      />

      <RepairEstimateEditor
        projectId={id}
        estimate={estimate}
        onChanged={(newEstimate, newMaxBid) => {
          setEstimate(newEstimate);
          setMaxBid(newMaxBid);
        }}
      />

      <MaxBidPanel
        project={project}
        maxBid={maxBid}
        hasEstimate={!!estimate}
        onUpdated={(updatedProject, newMaxBid) => {
          setDetail({ ...detail, project: updatedProject });
          setMaxBid(newMaxBid);
        }}
      />

      <AiAssistantPanel
        projectId={id}
        hasEstimate={!!estimate}
        estimateId={estimate?.id ?? null}
        onLineItemsAdded={(newEstimate, newMaxBid) => {
          setEstimate(newEstimate);
          setMaxBid(newMaxBid);
        }}
      />

      <ObdSection
        projectId={id}
        readings={detail.obdReadings}
        onChanged={(readings) => setDetail({ ...detail, obdReadings: readings })}
      />

      <PhotosSection
        projectId={id}
        photos={detail.photos}
        onChanged={(photos) => setDetail({ ...detail, photos })}
      />

      <NotesSection project={project} onUpdated={(updated) => setDetail({ ...detail, project: updated })} />

      <ReceiptsSection
        projectId={id}
        receipts={detail.receipts}
        onChanged={(receipts) => setDetail({ ...detail, receipts })}
      />

      <ChecklistSection
        projectId={id}
        items={detail.checklistItems}
        onChanged={(checklistItems) => setDetail({ ...detail, checklistItems })}
      />

      <BottomActionBar>
        <div className="flex-1">
          <p className="text-[11px] text-slate-500">Suggested max bid</p>
          <p className="text-base font-bold text-slate-900">{formatCurrency(maxBid?.suggestedMaxBid)}</p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          Back to top
        </Button>
      </BottomActionBar>
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <ProjectDetailContent id={id} />
    </AuthGuard>
  );
}

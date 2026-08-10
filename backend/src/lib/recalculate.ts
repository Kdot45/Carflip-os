import { prisma } from "./prisma";
import { calculateMaxBid, calculateRepairTotals, MaxBidResult } from "./calculations";

/**
 * The single place that keeps a RepairEstimate's stored totals (and the
 * max-bid numbers derived from it) in sync with its line items and the
 * parent project's deal financials. Call this after any mutation that could
 * change either side of that equation.
 */
export async function recalculateEstimate(
  estimateId: string
): Promise<{ estimate: Awaited<ReturnType<typeof prisma.repairEstimate.update>>; maxBid: MaxBidResult }> {
  const estimate = await prisma.repairEstimate.findUniqueOrThrow({
    where: { id: estimateId },
    include: { lineItems: true },
  });
  const project = await prisma.project.findUniqueOrThrow({ where: { id: estimate.projectId } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: project.userId } });

  const totals = calculateRepairTotals({
    lineItems: estimate.lineItems.map((item) => ({
      partsCost: Number(item.partsCost),
      laborHours: Number(item.laborHours),
      laborRate: Number(item.laborRate),
    })),
    diagnosticsTotal: Number(estimate.diagnosticsTotal),
    consumablesTotal: Number(estimate.consumablesTotal),
    feesTotal: Number(estimate.feesTotal),
    contingencyPct: Number(estimate.contingencyPct),
  });

  const maxBid = calculateMaxBid({
    askingPrice: Number(project.askingPrice),
    purchasePrice: project.purchasePrice === null ? null : Number(project.purchasePrice),
    totalExpectedRepair: totals.totalExpected,
    sellingCosts: Number(project.sellingCosts),
    expectedResalePrice:
      project.expectedResalePrice === null ? null : Number(project.expectedResalePrice),
    targetProfitAmount:
      project.targetProfitAmount === null ? null : Number(project.targetProfitAmount),
    targetMarginPct: project.targetMarginPct === null ? null : Number(project.targetMarginPct),
    fallbackMarginPct: Number(user.defaultMarginPct),
  });

  const updated = await prisma.repairEstimate.update({
    where: { id: estimateId },
    data: {
      partsTotal: totals.partsTotal,
      laborTotal: totals.laborTotal,
      diagnosticsTotal: totals.diagnosticsTotal,
      consumablesTotal: totals.consumablesTotal,
      feesTotal: totals.feesTotal,
      contingencyTotal: totals.contingencyTotal,
      totalLow: totals.totalLow,
      totalExpected: totals.totalExpected,
      totalWorst: totals.totalWorst,
      suggestedMaxBid: maxBid.suggestedMaxBid,
    },
  });

  return { estimate: updated, maxBid };
}

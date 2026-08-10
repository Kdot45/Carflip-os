import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getOwnedEstimate, getOwnedProject } from "../lib/ownership";
import { recalculateEstimate } from "../lib/recalculate";
import { serializeEstimate, serializeLineItem } from "./serializers";

// Three routers, mounted at three different base paths in index.ts, matching
// the endpoint shapes in the product spec:
//   /projects/:id/estimate        -> projectEstimatesRouter
//   /estimates/:id/line-items     -> estimatesRouter (create only)
//   /line-items/:id               -> lineItemsRouter (update/delete)
export const projectEstimatesRouter = Router({ mergeParams: true });
projectEstimatesRouter.use(requireAuth);

export const estimatesRouter = Router();
estimatesRouter.use(requireAuth);

export const lineItemsRouter = Router();
lineItemsRouter.use(requireAuth);

async function respondWithEstimate(res: import("express").Response, estimateId: string) {
  const { estimate, maxBid } = await recalculateEstimate(estimateId);
  const full = await prisma.repairEstimate.findUniqueOrThrow({
    where: { id: estimate.id },
    include: { lineItems: true },
  });
  res.json({ estimate: serializeEstimate(full), maxBid });
}

const createEstimateSchema = z.object({
  source: z.enum(["ai", "user", "mixed"]).default("user"),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
  contingencyPct: z.number().min(0).max(100).optional(),
});

// POST /projects/:id/estimate — creates a new estimate for the project
// (starting point for the repair workspace, or a fresh revision).
projectEstimatesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const input = createEstimateSchema.parse(req.body ?? {});
    const user = await prisma.user.findUniqueOrThrow({ where: { id: project.userId } });

    const estimate = await prisma.repairEstimate.create({
      data: {
        projectId: project.id,
        source: input.source,
        confidence: input.confidence,
        contingencyPct: input.contingencyPct ?? Number(user.defaultContingencyPct),
      },
    });

    await respondWithEstimate(res, estimate.id);
  })
);

// GET /projects/:id/estimate — latest estimate for the project (recalculated
// on read so it always reflects current line items and deal financials).
projectEstimatesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const estimate = await prisma.repairEstimate.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });
    if (!estimate) {
      return res.json({ estimate: null, maxBid: null });
    }
    await respondWithEstimate(res, estimate.id);
  })
);

const updateEstimateSchema = z.object({
  confidence: z.enum(["low", "medium", "high"]).optional(),
  source: z.enum(["ai", "user", "mixed"]).optional(),
  diagnosticsTotal: z.number().nonnegative().optional(),
  consumablesTotal: z.number().nonnegative().optional(),
  feesTotal: z.number().nonnegative().optional(),
  contingencyPct: z.number().min(0).max(100).optional(),
  assumptionsJson: z.unknown().optional(),
});

// PATCH /projects/:id/estimate — edit the manual/global fields (fees,
// contingency %, etc). Line items are edited via their own endpoints below.
projectEstimatesRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const estimate = await prisma.repairEstimate.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });
    if (!estimate) throw new ApiError(404, "This project has no estimate yet — create one first");

    const input = updateEstimateSchema.parse(req.body);
    await prisma.repairEstimate.update({
      where: { id: estimate.id },
      data: input as any,
    });

    await respondWithEstimate(res, estimate.id);
  })
);

const lineItemSchema = z.object({
  category: z.enum(["mechanical", "body", "electrical", "tires", "other"]),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  severity: z.enum(["safety", "required", "cosmetic"]).default("required"),
  partsCost: z.number().nonnegative().default(0),
  laborHours: z.number().nonnegative().default(0),
  laborRate: z.number().nonnegative().default(0),
  diyOk: z.boolean().default(false),
});

// POST /estimates/:id/line-items
estimatesRouter.post(
  "/:estimateId/line-items",
  asyncHandler(async (req, res) => {
    await getOwnedEstimate(req.userId as string, req.params.estimateId);
    const input = lineItemSchema.parse(req.body);

    const item = await prisma.repairLineItem.create({
      data: { estimateId: req.params.estimateId, ...input },
    });

    const { estimate, maxBid } = await recalculateEstimate(req.params.estimateId);
    const full = await prisma.repairEstimate.findUniqueOrThrow({
      where: { id: estimate.id },
      include: { lineItems: true },
    });
    res.status(201).json({
      lineItem: serializeLineItem(item),
      estimate: serializeEstimate(full),
      maxBid,
    });
  })
);

const updateLineItemSchema = lineItemSchema.partial();

// PATCH /line-items/:id
lineItemsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.repairLineItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Line item not found");
    await getOwnedEstimate(req.userId as string, existing.estimateId);

    const input = updateLineItemSchema.parse(req.body);
    const item = await prisma.repairLineItem.update({ where: { id: req.params.id }, data: input });

    const { estimate, maxBid } = await recalculateEstimate(existing.estimateId);
    const full = await prisma.repairEstimate.findUniqueOrThrow({
      where: { id: estimate.id },
      include: { lineItems: true },
    });
    res.json({ lineItem: serializeLineItem(item), estimate: serializeEstimate(full), maxBid });
  })
);

// DELETE /line-items/:id
lineItemsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.repairLineItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Line item not found");
    await getOwnedEstimate(req.userId as string, existing.estimateId);

    await prisma.repairLineItem.delete({ where: { id: req.params.id } });

    const { estimate, maxBid } = await recalculateEstimate(existing.estimateId);
    const full = await prisma.repairEstimate.findUniqueOrThrow({
      where: { id: estimate.id },
      include: { lineItems: true },
    });
    res.json({ estimate: serializeEstimate(full), maxBid });
  })
);

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import { recalculateEstimate } from "../lib/recalculate";
import {
  serializeChecklistItem,
  serializeEstimate,
  serializePhoto,
  serializeProject,
  serializeReceipt,
} from "./serializers";

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

const PROJECT_STATUSES = ["lead", "bought", "repairing", "listed", "sold", "abandoned"] as const;

const listQuerySchema = z.object({
  status: z.enum(PROJECT_STATUSES).optional(),
  sort: z.enum(["created_at", "profit", "asking_price"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

projectsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);

    const projects = await prisma.project.findMany({
      where: { userId: req.userId, ...(query.status ? { status: query.status } : {}) },
      include: { estimates: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy:
        query.sort === "asking_price"
          ? { askingPrice: query.order }
          : query.sort === "created_at"
            ? { createdAt: query.order }
            : undefined,
    });

    // "profit" isn't a DB column (it's derived from asking price + latest
    // estimate's suggested max bid math), so we sort it in memory.
    const withMetrics = projects.map((project) => {
      const latestEstimate = project.estimates[0] ?? null;
      const expectedProfitAtAsking =
        project.expectedResalePrice !== null && latestEstimate
          ? Number(project.expectedResalePrice) -
            Number(project.sellingCosts) -
            Number(latestEstimate.totalExpected) -
            Number(project.askingPrice)
          : null;

      return {
        ...serializeProject(project),
        suggestedMaxBid: latestEstimate ? Number(latestEstimate.suggestedMaxBid ?? 0) || null : null,
        totalExpectedRepair: latestEstimate ? Number(latestEstimate.totalExpected) : null,
        expectedProfitAtAsking,
      };
    });

    if (query.sort === "profit") {
      withMetrics.sort((a, b) => {
        const diff = (a.expectedProfitAtAsking ?? -Infinity) - (b.expectedProfitAtAsking ?? -Infinity);
        return query.order === "asc" ? diff : -diff;
      });
    }

    res.json({ projects: withMetrics });
  })
);

const createProjectSchema = z.object({
  listingUrl: z.string().url().optional().nullable(),
  year: z.number().int().gte(1900).lte(2100),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional().nullable(),
  miles: z.number().int().nonnegative(),
  askingPrice: z.number().nonnegative(),
  zipForDeal: z.string().min(3),
  titleStatus: z.enum(["clean", "salvage", "rebuilt", "other"]).default("clean"),
  listingNotesText: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
});

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createProjectSchema.parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } });

    const project = await prisma.project.create({
      data: {
        userId: req.userId as string,
        status: "lead",
        vin: input.vin ?? null,
        year: input.year,
        make: input.make,
        model: input.model,
        trim: input.trim ?? null,
        miles: input.miles,
        titleStatus: input.titleStatus,
        askingPrice: input.askingPrice,
        zipForDeal: input.zipForDeal,
        listingUrl: input.listingUrl ?? null,
        listingNotesText: input.listingNotesText ?? null,
        sellingCosts: 0,
        targetMarginPct: user.defaultMarginPct,
      },
    });

    res.status(201).json({ project: serializeProject(project) });
  })
);

projectsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);

    const [photos, obdReadings, estimates, receipts, checklistItems] = await Promise.all([
      prisma.projectPhoto.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } }),
      prisma.obdReading.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } }),
      prisma.repairEstimate.findMany({
        where: { projectId: project.id },
        include: { lineItems: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.receipt.findMany({ where: { projectId: project.id }, orderBy: { date: "desc" } }),
      prisma.checklistItem.findMany({ where: { projectId: project.id }, orderBy: { sortOrder: "asc" } }),
    ]);

    res.json({
      project: serializeProject(project),
      photos: photos.map(serializePhoto),
      obdReadings,
      estimates: estimates.map(serializeEstimate),
      receipts: receipts.map(serializeReceipt),
      checklistItems: checklistItems.map(serializeChecklistItem),
    });
  })
);

const updateProjectSchema = z.object({
  status: z.enum(PROJECT_STATUSES).optional(),
  vin: z.string().nullable().optional(),
  year: z.number().int().gte(1900).lte(2100).optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  trim: z.string().nullable().optional(),
  miles: z.number().int().nonnegative().optional(),
  titleStatus: z.enum(["clean", "salvage", "rebuilt", "other"]).optional(),
  askingPrice: z.number().nonnegative().optional(),
  purchasePrice: z.number().nonnegative().nullable().optional(),
  zipForDeal: z.string().min(3).optional(),
  listingUrl: z.string().url().nullable().optional(),
  listingNotesText: z.string().nullable().optional(),
  expectedResalePrice: z.number().nonnegative().nullable().optional(),
  sellingCosts: z.number().nonnegative().optional(),
  targetProfitAmount: z.number().nonnegative().nullable().optional(),
  targetMarginPct: z.number().min(0).max(100).nullable().optional(),
});

projectsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    await getOwnedProject(req.userId as string, req.params.id);
    const input = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: input,
    });

    // Asking/purchase price, resale price, selling costs, and margin/profit
    // targets all feed the max-bid math, which lives on the estimate row.
    // Keep it in sync so the frontend never shows a stale suggested bid.
    const latestEstimate = await prisma.repairEstimate.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });
    let maxBid = null;
    if (latestEstimate) {
      ({ maxBid } = await recalculateEstimate(latestEstimate.id));
    }

    res.json({ project: serializeProject(project), maxBid });
  })
);

projectsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await getOwnedProject(req.userId as string, req.params.id);
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

const obdSchema = z.object({ rawCodesText: z.string().min(1) });

projectsRouter.post(
  "/:id/obd",
  asyncHandler(async (req, res) => {
    await getOwnedProject(req.userId as string, req.params.id);
    const input = obdSchema.parse(req.body);
    const reading = await prisma.obdReading.create({
      data: { projectId: req.params.id, rawCodesText: input.rawCodesText },
    });
    res.status(201).json({ obdReading: reading });
  })
);

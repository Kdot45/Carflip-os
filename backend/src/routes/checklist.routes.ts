import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import { serializeChecklistItem } from "./serializers";

export const projectChecklistRouter = Router({ mergeParams: true });
projectChecklistRouter.use(requireAuth);

export const checklistRouter = Router();
checklistRouter.use(requireAuth);

const createItemSchema = z.object({
  text: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

// POST /projects/:id/checklist
projectChecklistRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const input = createItemSchema.parse(req.body);

    const count = await prisma.checklistItem.count({ where: { projectId: project.id } });
    const item = await prisma.checklistItem.create({
      data: {
        projectId: project.id,
        text: input.text,
        sortOrder: input.sortOrder ?? count,
      },
    });

    res.status(201).json({ checklistItem: serializeChecklistItem(item) });
  })
);

const updateItemSchema = z.object({
  text: z.string().min(1).optional(),
  done: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// PATCH /checklist/:id
checklistRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.checklistItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Checklist item not found");
    await getOwnedProject(req.userId as string, existing.projectId);

    const input = updateItemSchema.parse(req.body);
    const item = await prisma.checklistItem.update({ where: { id: req.params.id }, data: input });

    res.json({ checklistItem: serializeChecklistItem(item) });
  })
);

// DELETE /checklist/:id
checklistRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.checklistItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Checklist item not found");
    await getOwnedProject(req.userId as string, existing.projectId);

    await prisma.checklistItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

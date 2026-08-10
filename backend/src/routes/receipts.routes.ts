import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import { serializeReceipt } from "./serializers";

export const projectReceiptsRouter = Router({ mergeParams: true });
projectReceiptsRouter.use(requireAuth);

export const receiptsRouter = Router();
receiptsRouter.use(requireAuth);

const createReceiptSchema = z.object({
  amount: z.number().nonnegative(),
  description: z.string().min(1),
  date: z.string().datetime().or(z.string().min(1)),
  photoUrl: z.string().optional().nullable(),
});

// POST /projects/:id/receipts
projectReceiptsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const input = createReceiptSchema.parse(req.body);

    const receipt = await prisma.receipt.create({
      data: {
        projectId: project.id,
        amount: input.amount,
        description: input.description,
        date: new Date(input.date),
        photoUrl: input.photoUrl ?? null,
      },
    });

    res.status(201).json({ receipt: serializeReceipt(receipt) });
  })
);

const updateReceiptSchema = createReceiptSchema.partial();

// PATCH /receipts/:id
receiptsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.receipt.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Receipt not found");
    await getOwnedProject(req.userId as string, existing.projectId);

    const input = updateReceiptSchema.parse(req.body);
    const receipt = await prisma.receipt.update({
      where: { id: req.params.id },
      data: { ...input, date: input.date ? new Date(input.date) : undefined },
    });

    res.json({ receipt: serializeReceipt(receipt) });
  })
);

// DELETE /receipts/:id
receiptsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.receipt.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Receipt not found");
    await getOwnedProject(req.userId as string, existing.projectId);

    await prisma.receipt.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

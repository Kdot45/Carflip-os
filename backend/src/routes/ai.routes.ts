import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import { runChat, runTriage } from "../lib/ai";

export const aiRouter = Router({ mergeParams: true });
aiRouter.use(requireAuth);

function vehicleDescription(project: { year: number; make: string; model: string; trim: string | null }) {
  return `${project.year} ${project.make} ${project.model}${project.trim ? ` ${project.trim}` : ""}`;
}

const triageSchema = z.object({
  symptoms: z.string().optional().nullable(),
});

// POST /projects/:id/ai/triage — reads the project's listing notes + latest
// OBD reading, plus any freeform symptoms passed in, and asks the AI to
// suggest likely issues, explain codes, and flag a risk level. Advisory
// only — see AI_DISCLAIMER, always echoed back in the response.
aiRouter.post(
  "/triage",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const input = triageSchema.parse(req.body ?? {});

    const latestObd = await prisma.obdReading.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });

    const result = await runTriage({
      vehicleDescription: vehicleDescription(project),
      listingNotes: project.listingNotesText,
      obdCodes: latestObd?.rawCodesText ?? null,
      symptoms: input.symptoms ?? null,
    });

    await prisma.aiRun.create({
      data: {
        projectId: project.id,
        purpose: "triage",
        inputSummary: JSON.stringify({
          listingNotes: project.listingNotesText,
          obdCodes: latestObd?.rawCodesText ?? null,
          symptoms: input.symptoms ?? null,
        }).slice(0, 4000),
        outputSummary: JSON.stringify(result).slice(0, 4000),
      },
    });

    res.json(result);
  })
);

const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
    .min(1),
});

// POST /projects/:id/ai/chat — freeform advisory chat, scoped to the
// project's vehicle/listing/OBD context.
aiRouter.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    const input = chatSchema.parse(req.body);

    const latestObd = await prisma.obdReading.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });

    const result = await runChat(input.messages, {
      vehicleDescription: vehicleDescription(project),
      listingNotes: project.listingNotesText,
      obdCodes: latestObd?.rawCodesText ?? null,
    });

    await prisma.aiRun.create({
      data: {
        projectId: project.id,
        purpose: "chat",
        inputSummary: input.messages[input.messages.length - 1].content.slice(0, 4000),
        outputSummary: result.reply.slice(0, 4000),
      },
    });

    res.json(result);
  })
);

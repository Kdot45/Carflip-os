import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import {
  extractListingDetails,
  extractListingDetailsFromImage,
  runChat,
  runTriage,
  SupportedImageMediaType,
} from "../lib/ai";

const SUPPORTED_IMAGE_TYPES: SupportedImageMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const screenshotUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

export const aiRouter = Router({ mergeParams: true });
aiRouter.use(requireAuth);

// Not project-scoped — this runs during the New Deal wizard, before a
// project exists yet, on text the user pasted themselves. Never touches
// the source listing's site; it only reads text already sitting in the
// request body.
export const aiUtilityRouter = Router();
aiUtilityRouter.use(requireAuth);

const extractSchema = z.object({
  text: z.string().min(1).max(20000),
});

// POST /ai/extract-listing
aiUtilityRouter.post(
  "/extract-listing",
  asyncHandler(async (req, res) => {
    const input = extractSchema.parse(req.body);
    const result = await extractListingDetails(input.text);
    res.json(result);
  })
);

// POST /ai/extract-listing-image — multipart/form-data with field `photo`.
// For listings that are awkward to copy-paste text from. Only ever reads
// the uploaded image bytes; never fetches the source listing's URL.
aiUtilityRouter.post(
  "/extract-listing-image",
  screenshotUpload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Missing `photo` file");
    if (!SUPPORTED_IMAGE_TYPES.includes(req.file.mimetype as SupportedImageMediaType)) {
      throw new ApiError(400, "Unsupported image type — use JPEG, PNG, GIF, or WEBP");
    }
    const base64 = req.file.buffer.toString("base64");
    const result = await extractListingDetailsFromImage(
      base64,
      req.file.mimetype as SupportedImageMediaType
    );
    res.json(result);
  })
);

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

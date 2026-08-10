import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import { fileUrl, saveFile } from "../lib/storage";
import { serializePhoto } from "./serializers";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

export const projectPhotosRouter = Router({ mergeParams: true });
projectPhotosRouter.use(requireAuth);

export const photosRouter = Router();
photosRouter.use(requireAuth);

const photoTypeSchema = z.enum(["exterior", "engine", "dash", "tires", "underside", "other"]);

// POST /projects/:id/photos — multipart/form-data with fields `photo` (file)
// and `type` (one of the PhotoType enum values).
projectPhotosRouter.post(
  "/",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);
    if (!req.file) throw new ApiError(400, "Missing `photo` file");
    const type = photoTypeSchema.parse(req.body.type ?? "other");

    const filename = saveFile(req.file.originalname, req.file.buffer);
    const photo = await prisma.projectPhoto.create({
      data: { projectId: project.id, type, storagePath: fileUrl(filename) },
    });

    res.status(201).json({ photo: serializePhoto(photo) });
  })
);

// DELETE /photos/:id
photosRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.projectPhoto.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Photo not found");
    await getOwnedProject(req.userId as string, existing.projectId);

    await prisma.projectPhoto.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

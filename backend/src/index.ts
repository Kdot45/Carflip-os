import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/auth.routes";
import { projectsRouter } from "./routes/projects.routes";
import { projectEstimatesRouter, estimatesRouter, lineItemsRouter } from "./routes/estimates.routes";
import { projectReceiptsRouter, receiptsRouter } from "./routes/receipts.routes";
import { projectChecklistRouter, checklistRouter } from "./routes/checklist.routes";
import { projectPhotosRouter, photosRouter } from "./routes/photos.routes";
import { aiRouter, aiUtilityRouter } from "./routes/ai.routes";
import { projectRecallsRouter } from "./routes/recalls.routes";
import { obdCodesRouter } from "./routes/obd.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { ensureUploadDir } from "./lib/storage";

const app = express();
const PORT = process.env.PORT ?? 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

ensureUploadDir();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/ai", aiUtilityRouter);
app.use("/obd-codes", obdCodesRouter);
app.use("/projects", projectsRouter);

// Nested, project-scoped resources.
app.use("/projects/:id/estimate", projectEstimatesRouter);
app.use("/projects/:id/receipts", projectReceiptsRouter);
app.use("/projects/:id/checklist", projectChecklistRouter);
app.use("/projects/:id/photos", projectPhotosRouter);
app.use("/projects/:id/ai", aiRouter);
app.use("/projects/:id/recalls", projectRecallsRouter);

// Flat resources addressed by their own id (line items, receipts, checklist
// items, photos), per the spec's endpoint list.
app.use("/estimates", estimatesRouter);
app.use("/line-items", lineItemsRouter);
app.use("/receipts", receiptsRouter);
app.use("/checklist", checklistRouter);
app.use("/photos", photosRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CarFlip OS API listening on http://localhost:${PORT}`);
});

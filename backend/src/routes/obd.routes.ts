import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/errorHandler";
import { lookupObdCodes } from "../lib/obdCodes";

// Not project-scoped — this is a static reference lookup against the local
// generic OBD-II code database, not tied to any one deal.
export const obdCodesRouter = Router();
obdCodesRouter.use(requireAuth);

const lookupSchema = z.object({
  text: z.string().min(1).max(2000),
});

// POST /obd-codes/lookup
obdCodesRouter.post(
  "/lookup",
  asyncHandler(async (req, res) => {
    const input = lookupSchema.parse(req.body);
    res.json({ results: lookupObdCodes(input.text) });
  })
);

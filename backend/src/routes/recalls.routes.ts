import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { getOwnedProject } from "../lib/ownership";
import { fetchOpenRecalls } from "../lib/nhtsa";

export const projectRecallsRouter = Router({ mergeParams: true });
projectRecallsRouter.use(requireAuth);

// GET /projects/:id/recalls — open NHTSA safety recalls for this project's
// year/make/model, fetched live from the official government API.
projectRecallsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const project = await getOwnedProject(req.userId as string, req.params.id);

    try {
      const recalls = await fetchOpenRecalls(project.year, project.make, project.model);
      res.json({ recalls });
    } catch (err) {
      console.error("[recalls] NHTSA lookup failed:", err);
      throw new ApiError(502, "Couldn't reach NHTSA's recall database right now");
    }
  })
);

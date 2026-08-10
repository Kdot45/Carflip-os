import { prisma } from "./prisma";
import { ApiError } from "../middleware/errorHandler";

/** Every resource in this app hangs off a Project, which is scoped to a
 * User. This is the one place that enforces "you can only touch your own
 * deals" so every route doesn't have to reimplement it. */
export async function getOwnedProject(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) {
    throw new ApiError(404, "Project not found");
  }
  return project;
}

export async function getOwnedEstimate(userId: string, estimateId: string) {
  const estimate = await prisma.repairEstimate.findUnique({ where: { id: estimateId } });
  if (!estimate) throw new ApiError(404, "Estimate not found");
  await getOwnedProject(userId, estimate.projectId);
  return estimate;
}

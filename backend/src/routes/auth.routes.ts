import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, signAuthToken, verifyPassword } from "../lib/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/requireAuth";
import { serializeUser } from "./serializers";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1),
  homeZip: z.string().min(3),
  role: z.enum(["flipper", "dealer"]).default("flipper"),
});

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const input = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, "An account with that email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        homeZip: input.homeZip,
        role: input.role,
      },
    });

    const token = signAuthToken({ userId: user.id });
    res.status(201).json({ token, user: serializeUser(user) });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signAuthToken({ userId: user.id });
    res.json({ token, user: serializeUser(user) });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.userId } });
    res.json({ user: serializeUser(user) });
  })
);

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  homeZip: z.string().min(3).optional(),
  role: z.enum(["flipper", "dealer"]).optional(),
  defaultLaborRateMechanical: z.number().nonnegative().optional(),
  defaultLaborRateBody: z.number().nonnegative().optional(),
  defaultContingencyPct: z.number().min(0).max(100).optional(),
  defaultMarginPct: z.number().min(0).max(100).optional(),
});

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.userId }, data: input });
    res.json({ user: serializeUser(user) });
  })
);

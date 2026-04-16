import { NextFunction, Request, Response } from "express";
import { env, isPreviewAuthMode } from "../config/env";
import { sendError } from "./http";
import {
  getNextProjectId,
  getNextProjectTeamId,
  getNextTaskId,
  getNextTeamId,
  getNextUserId,
} from "./postgresSequences";
import { prisma } from "./prisma";

type AuthPayload = {
  email?: string;
  sub: string;
  username?: string;
};

type AuthenticatedUser = {
  authProviderId: string;
  email?: string | null;
  teamId?: number | null;
  userId: number;
  username: string;
};

const createStarterWorkspaceForUser = async (user: AuthenticatedUser) => {
  if (user.teamId) {
    return user;
  }

  const created = await prisma.$transaction(async (tx) => {
    const teamId = await getNextTeamId(tx);

    const team = await tx.team.create({
      data: {
        id: teamId,
        teamName: `${user.username}'s Team`,
        productOwnerUserId: user.userId,
        projectManagerUserId: user.userId,
      },
    });

    const updatedUser = await tx.user.update({
      where: { userId: user.userId },
      data: { teamId: team.id },
      select: {
        authProviderId: true,
        email: true,
        teamId: true,
        userId: true,
        username: true,
      },
    });

    const today = new Date();
    const projectStart = new Date(today);
    const projectEnd = new Date(today);
    projectEnd.setDate(projectEnd.getDate() + 30);

    const starterProjectId = await getNextProjectId(tx);

    const starterProject = await tx.project.create({
      data: {
        id: starterProjectId,
        name: `${user.username}'s Launchpad`,
        description:
          "A starter workspace project created automatically for your first session.",
        startDate: projectStart,
        endDate: projectEnd,
        createdByUserId: user.userId,
      },
    });

    const projectTeamId = await getNextProjectTeamId(tx);

    await tx.projectTeam.create({
      data: {
        id: projectTeamId,
        projectId: starterProject.id,
        teamId: team.id,
      },
    });

    const starterTasks = [
      {
        title: "Review your workspace",
        description: "Explore dashboard widgets, team pages, and project views.",
        status: "To Do",
        priority: "High",
        tags: "onboarding,workspace",
        startDate: projectStart,
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      },
      {
        title: "Create your first task",
        description: "Open a project view and add a real task for your workflow.",
        status: "Work In Progress",
        priority: "Medium",
        tags: "setup,task",
        startDate: projectStart,
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      },
      {
        title: "Invite collaborators",
        description: "Use the people and teams surfaces to prepare your workspace.",
        status: "To Do",
        priority: "Low",
        tags: "team,planning",
        startDate: projectStart,
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      },
    ];

    for (const task of starterTasks) {
      const taskId = await getNextTaskId(tx);

      await tx.task.create({
        data: {
          id: taskId,
          ...task,
          projectId: starterProject.id,
          authorUserId: user.userId,
          assignedUserId: user.userId,
        },
      });
    }

    return updatedUser;
  });

  return created;
};

export type AuthenticatedRequest = Request & {
  auth?: AuthPayload;
  currentUser?: AuthenticatedUser;
};

const verifySupabaseToken = async (token: string) => {
  const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.supabaseAnonKey,
    },
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  const user = (await response.json()) as {
    email?: string;
    id: string;
    user_metadata?: {
      preferred_username?: string;
      username?: string;
    };
  };

  return {
    email: user.email,
    sub: user.id,
    username:
      user.user_metadata?.username || user.user_metadata?.preferred_username,
  };
};

const loadCurrentUser = async (payload: AuthPayload) => {
  const fallbackUsername =
    payload.username ||
    payload.email?.split("@")[0] ||
    `user-${payload.sub.slice(0, 8)}`;

  const nextUserId = await getNextUserId(prisma);

  const user = await prisma.user.upsert({
    where: { authProviderId: payload.sub },
    update: {
      email: payload.email,
      username: fallbackUsername,
    },
    create: {
      userId: nextUserId,
      authProviderId: payload.sub,
      email: payload.email,
      username: fallbackUsername,
      profilePictureUrl: "i1.jpg",
    },
    select: {
      authProviderId: true,
      email: true,
      teamId: true,
      userId: true,
      username: true,
    },
  });

  return createStarterWorkspaceForUser(user);
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isPreviewAuthMode) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  let payload: AuthPayload;
  try {
    payload = await verifySupabaseToken(token);
  } catch (error) {
    res.status(401).json({
      message:
        error instanceof Error ? error.message : "Authentication failed",
    });
    return;
  }

  try {
    const currentUser = await loadCurrentUser(payload);
    (req as AuthenticatedRequest).auth = payload;
    (req as AuthenticatedRequest).currentUser = currentUser;
    next();
  } catch (error) {
    sendError(res, error);
  }
};

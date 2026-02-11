import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { getAccessibleProjectIds } from "../lib/access";
import { HttpError, requireNumber, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) throw new HttpError(401, "Authentication required");
  return req.currentUser;
};

export const logActivity = async (
  userId: number,
  action: string,
  options?: { taskId?: number; projectId?: number; details?: string },
) => {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      taskId: options?.taskId ?? null,
      projectId: options?.projectId ?? null,
      details: options?.details ?? null,
    },
  });
};

export const getProjectActivity = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");
    const accessibleIds = await getAccessibleProjectIds(currentUser);

    if (!accessibleIds.includes(projectId)) {
      throw new HttpError(403, "You do not have access to this project");
    }

    const logs = await prisma.activityLog.findMany({
      where: { projectId },
      include: { user: { select: { userId: true, username: true, profilePictureUrl: true } }, task: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(logs);
  } catch (error) {
    sendError(res, error);
  }
};

export const getTaskActivity = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const taskId = requireNumber(req.params.taskId, "taskId");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) throw new HttpError(404, "Task not found");

    const accessibleIds = await getAccessibleProjectIds(currentUser);
    if (!accessibleIds.includes(task.projectId)) {
      throw new HttpError(403, "You do not have access to this task");
    }

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      include: { user: { select: { userId: true, username: true, profilePictureUrl: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (error) {
    sendError(res, error);
  }
};

export const getUserActivity = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    const logs = await prisma.activityLog.findMany({
      where: { userId: currentUser.userId },
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json(logs);
  } catch (error) {
    sendError(res, error);
  }
};

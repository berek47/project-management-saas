import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureProjectAccess } from "../lib/access";
import { HttpError, requireNumber, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) throw new HttpError(401, "Authentication required");
  return req.currentUser;
};

export const getPinnedTasks = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");

    await ensureProjectAccess(currentUser, projectId);

    const pinned = await prisma.pinnedTask.findMany({
      where: { projectId, userId: currentUser.userId },
      include: {
        task: {
          include: { author: true, assignee: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(pinned.map((p) => p.task));
  } catch (error) {
    sendError(res, error);
  }
};

export const pinTask = async (
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
    await ensureProjectAccess(currentUser, task.projectId);

    const existing = await prisma.pinnedTask.findUnique({
      where: { userId_taskId: { userId: currentUser.userId, taskId } },
    });

    if (existing) {
      res.status(409).json({ message: "Task is already pinned" });
      return;
    }

    const pinned = await prisma.pinnedTask.create({
      data: {
        userId: currentUser.userId,
        taskId,
        projectId: task.projectId,
      },
    });

    res.status(201).json(pinned);
  } catch (error) {
    sendError(res, error);
  }
};

export const unpinTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const taskId = requireNumber(req.params.taskId, "taskId");

    const existing = await prisma.pinnedTask.findUnique({
      where: { userId_taskId: { userId: currentUser.userId, taskId } },
    });

    if (!existing) throw new HttpError(404, "Task is not pinned");

    await prisma.pinnedTask.delete({
      where: { userId_taskId: { userId: currentUser.userId, taskId } },
    });

    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
};

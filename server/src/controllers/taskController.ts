import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureProjectAccess, ensureSameTeamOrSelf, getAccessibleProjectIds } from "../lib/access";
import {
  HttpError,
  parseOptionalDate,
  requireNumber,
  requireString,
  sendError,
} from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.currentUser;
};

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.query.projectId, "projectId", {
      optional: true,
    });
    const accessibleProjectIds = await getAccessibleProjectIds(currentUser);

    if (projectId) {
      await ensureProjectAccess(currentUser, projectId);
    }

    const tasks = await prisma.task.findMany({
      where: projectId
        ? { projectId }
        : accessibleProjectIds.length
          ? { projectId: { in: accessibleProjectIds } }
          : {
              OR: [
                { authorUserId: currentUser.userId },
                { assignedUserId: currentUser.userId },
              ],
            },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
      orderBy: { id: "asc" },
    });
    res.json(tasks);
  } catch (error) {
    sendError(res, error);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const title = requireString(req.body.title, "title");
    const description = requireString(req.body.description, "description", {
      optional: true,
    });
    const status = requireString(req.body.status, "status", {
      optional: true,
    });
    const priority = requireString(req.body.priority, "priority", {
      optional: true,
    });
    const tags = requireString(req.body.tags, "tags", {
      optional: true,
    });
    const projectId = requireNumber(req.body.projectId, "projectId");
    const assignedUserId = requireNumber(
      req.body.assignedUserId,
      "assignedUserId",
      { optional: true },
    );
    const points = requireNumber(req.body.points, "points", {
      optional: true,
    });

    await ensureProjectAccess(currentUser, projectId);

    if (assignedUserId) {
      const assignee = await prisma.user.findUnique({
        where: { userId: assignedUserId },
        select: { userId: true, teamId: true },
      });

      if (!assignee) {
        throw new HttpError(404, "Assignee not found");
      }

      ensureSameTeamOrSelf(currentUser, assignee);
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: parseOptionalDate(req.body.startDate, "startDate"),
        dueDate: parseOptionalDate(req.body.dueDate, "dueDate"),
        points,
        projectId,
        authorUserId: currentUser.userId,
        assignedUserId,
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    sendError(res, error);
  }
};

export const updateTaskStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const taskId = requireNumber(req.params.taskId, "taskId");
    const status = requireString(req.body.status, "status");

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        authorUserId: true,
        assignedUserId: true,
        id: true,
        projectId: true,
      },
    });

    if (!existingTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await ensureProjectAccess(currentUser, existingTask.projectId);

    const isActor =
      existingTask.authorUserId === currentUser.userId ||
      existingTask.assignedUserId === currentUser.userId;

    if (!isActor && !currentUser.teamId) {
      throw new HttpError(403, "You do not have access to update this task");
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    sendError(res, error);
  }
};

export const getUserTasks = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const userId = requireNumber(req.params.userId, "userId");

    if (userId !== currentUser.userId) {
      throw new HttpError(403, "You can only view your own task feed");
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ authorUserId: userId }, { assignedUserId: userId }],
      },
      include: {
        author: true,
        assignee: true,
      },
      orderBy: { id: "asc" },
    });
    res.json(tasks);
  } catch (error) {
    sendError(res, error);
  }
};

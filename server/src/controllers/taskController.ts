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
import { getNextTaskId } from "../lib/postgresSequences";
import { prisma } from "../lib/prisma";
import { logActivity } from "./activityLogController";
import { createNotification } from "./notificationController";

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

    const limit = requireNumber(req.query.limit, "limit", { optional: true });
    const offset = requireNumber(req.query.offset, "offset", { optional: true });
    const sortBy = requireString(req.query.sortBy, "sortBy", { optional: true });
    const sortOrder = requireString(req.query.sortOrder, "sortOrder", { optional: true });

    const allowedSortFields = ["id", "dueDate", "priority", "title", "createdAt"] as const;
    type SortField = typeof allowedSortFields[number];
    const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
      ? (sortBy as SortField)
      : "id";
    const order = sortOrder === "desc" ? "desc" : "asc";

    const where = projectId
      ? { projectId }
      : accessibleProjectIds.length
        ? { projectId: { in: accessibleProjectIds } }
        : {
            OR: [
              { authorUserId: currentUser.userId },
              { assignedUserId: currentUser.userId },
            ],
          };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          author: true,
          assignee: true,
          comments: {
            include: { user: true },
            orderBy: { id: "asc" },
          },
          attachments: true,
        },
        orderBy: { [sortField]: order },
        ...(limit !== undefined && { take: limit }),
        ...(offset !== undefined && { skip: offset }),
      }),
      prisma.task.count({ where }),
    ]);

    res.setHeader("X-Total-Count", String(total));
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

    const nextTaskId = await getNextTaskId(prisma);

    const newTask = await prisma.task.create({
      data: {
        id: nextTaskId,
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
    await logActivity(currentUser.userId, "task_created", {
      taskId: newTask.id,
      projectId,
      details: `Created task "${title}"`,
    });

    if (assignedUserId && assignedUserId !== currentUser.userId) {
      await createNotification(
        assignedUserId,
        "task_assigned",
        `You were assigned to task "${title}"`,
        { taskId: newTask.id, projectId },
      );
    }

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
      where: { id: taskId },
      data: { status },
    });

    await logActivity(currentUser.userId, "task_status_changed", {
      taskId,
      projectId: existingTask.projectId,
      details: `Changed status to "${status}"`,
    });

    res.json(updatedTask);
  } catch (error) {
    sendError(res, error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const taskId = requireNumber(req.params.taskId, "taskId");

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { authorUserId: true, assignedUserId: true, projectId: true, title: true },
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

    const title = requireString(req.body.title, "title", { optional: true });
    const description = requireString(req.body.description, "description", { optional: true });
    const priority = requireString(req.body.priority, "priority", { optional: true });
    const tags = requireString(req.body.tags, "tags", { optional: true });
    const points = requireNumber(req.body.points, "points", { optional: true });
    const assignedUserId = requireNumber(req.body.assignedUserId, "assignedUserId", { optional: true });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(tags !== undefined && { tags }),
        ...(points !== undefined && { points }),
        ...(assignedUserId !== undefined && { assignedUserId }),
        ...(req.body.dueDate !== undefined && {
          dueDate: parseOptionalDate(req.body.dueDate, "dueDate"),
        }),
      },
      include: { author: true, assignee: true },
    });

    await logActivity(currentUser.userId, "task_updated", {
      taskId,
      projectId: existingTask.projectId,
      details: `Updated task "${existingTask.title}"`,
    });

    if (
      assignedUserId &&
      assignedUserId !== existingTask.assignedUserId &&
      assignedUserId !== currentUser.userId
    ) {
      await createNotification(
        assignedUserId,
        "task_assigned",
        `You were assigned to task "${updatedTask.title}"`,
        { taskId, projectId: existingTask.projectId },
      );
    }

    res.json(updatedTask);
  } catch (error) {
    sendError(res, error);
  }
};

export const createTaskComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const taskId = requireNumber(req.params.taskId, "taskId");
    const text = requireString(req.body.text, "text");

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, projectId: true },
    });

    if (!existingTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await ensureProjectAccess(currentUser, existingTask.projectId);

    const comment = await prisma.comment.create({
      data: {
        taskId,
        text,
        userId: currentUser.userId,
      },
      include: {
        user: true,
      },
    });

    await logActivity(currentUser.userId, "task_comment_added", {
      taskId,
      projectId: existingTask.projectId,
      details: `Added a comment`,
    });

    res.status(201).json(comment);
  } catch (error) {
    sendError(res, error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const taskId = requireNumber(req.params.taskId, "taskId");

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { authorUserId: true, projectId: true, title: true },
    });

    if (!existingTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await ensureProjectAccess(currentUser, existingTask.projectId);

    if (existingTask.authorUserId !== currentUser.userId && !currentUser.teamId) {
      throw new HttpError(403, "Only the task author can delete this task");
    }

    await prisma.comment.deleteMany({ where: { taskId } });
    await prisma.taskAssignment.deleteMany({ where: { taskId } });
    await prisma.attachment.deleteMany({ where: { taskId } });
    await prisma.task.delete({ where: { id: taskId } });

    await logActivity(currentUser.userId, "task_deleted", {
      projectId: existingTask.projectId,
      details: `Deleted task "${existingTask.title}"`,
    });

    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
};

export const getOverdueTasks = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    const tasks = await prisma.task.findMany({
      where: {
        assignedUserId: currentUser.userId,
        dueDate: { lt: new Date() },
        status: { not: "Completed" },
      },
      include: {
        author: true,
        assignee: true,
      },
      orderBy: { dueDate: "asc" },
    });

    res.json(tasks);
  } catch (error) {
    sendError(res, error);
  }
};

export const bulkUpdateTaskStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const status = requireString(req.body.status, "status");
    const taskIds: unknown = req.body.taskIds;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new HttpError(400, "taskIds must be a non-empty array");
    }

    const ids = taskIds.map((id) => requireNumber(id, "taskId"));

    const tasks = await prisma.task.findMany({
      where: { id: { in: ids } },
      select: { id: true, projectId: true },
    });

    if (tasks.length !== ids.length) {
      throw new HttpError(404, "One or more tasks not found");
    }

    const projectIds = [...new Set(tasks.map((t) => t.projectId))];
    for (const pid of projectIds) {
      await ensureProjectAccess(currentUser, pid);
    }

    await prisma.task.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    for (const task of tasks) {
      await logActivity(currentUser.userId, "task_status_changed", {
        taskId: task.id,
        projectId: task.projectId,
        details: `Bulk status change to "${status}"`,
      });
    }

    res.json({ updated: ids.length, status });
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

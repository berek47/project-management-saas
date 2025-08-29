import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureProjectAccess } from "../lib/access";
import { HttpError, requireNumber, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) throw new HttpError(401, "Authentication required");
  return req.currentUser;
};

export const getProjectAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");

    await ensureProjectAccess(currentUser, projectId);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        status: true,
        priority: true,
        dueDate: true,
        points: true,
        assignedUserId: true,
        assignee: { select: { userId: true, username: true } },
      },
    });

    const now = new Date();

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let totalPoints = 0;
    let completedPoints = 0;
    let overdueTasks = 0;

    for (const task of tasks) {
      const status = task.status ?? "No Status";
      byStatus[status] = (byStatus[status] ?? 0) + 1;

      const priority = task.priority ?? "No Priority";
      byPriority[priority] = (byPriority[priority] ?? 0) + 1;

      if (task.points) {
        totalPoints += task.points;
        if (task.status === "Completed") completedPoints += task.points;
      }

      if (
        task.dueDate &&
        task.dueDate < now &&
        task.status !== "Completed"
      ) {
        overdueTasks++;
      }
    }

    const assigneeMap: Record<number, { username: string; taskCount: number }> = {};
    for (const task of tasks) {
      if (task.assignee) {
        const { userId, username } = task.assignee;
        if (!assigneeMap[userId]) {
          assigneeMap[userId] = { username, taskCount: 0 };
        }
        assigneeMap[userId].taskCount++;
      }
    }

    res.json({
      totalTasks: tasks.length,
      byStatus,
      byPriority,
      totalPoints,
      completedPoints,
      completionRate: tasks.length > 0 ? Math.round(((byStatus["Completed"] ?? 0) / tasks.length) * 100) : 0,
      pointsCompletionRate: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
      overdueTasks,
      tasksByAssignee: Object.values(assigneeMap).sort((a, b) => b.taskCount - a.taskCount),
    });
  } catch (error) {
    sendError(res, error);
  }
};

export const getWorkspaceAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalTasks, completedThisWeek, overdueCount] = await Promise.all([
      prisma.task.count({
        where: {
          OR: [
            { authorUserId: currentUser.userId },
            { assignedUserId: currentUser.userId },
          ],
        },
      }),
      prisma.task.count({
        where: {
          assignedUserId: currentUser.userId,
          status: "Completed",
          dueDate: { gte: sevenDaysAgo },
        },
      }),
      prisma.task.count({
        where: {
          assignedUserId: currentUser.userId,
          dueDate: { lt: now },
          status: { not: "Completed" },
        },
      }),
    ]);

    res.json({ totalTasks, completedThisWeek, overdueCount });
  } catch (error) {
    sendError(res, error);
  }
};

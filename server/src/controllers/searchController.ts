import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { getAccessibleProjectIds } from "../lib/access";
import { HttpError, requireNumber, requireString, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.currentUser;
};

export const search = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const query =
      typeof req.query.query === "string" ? req.query.query.trim() : "";

    if (!query || query.length < 2) {
      throw new HttpError(
        400,
        "Search query must contain at least 2 characters",
      );
    }

    const accessibleProjectIds = await getAccessibleProjectIds(currentUser);

    const tasks = await prisma.task.findMany({
      where: {
        ...(accessibleProjectIds.length
          ? { projectId: { in: accessibleProjectIds } }
          : {
              OR: [
                { authorUserId: currentUser.userId },
                { assignedUserId: currentUser.userId },
              ],
            }),
        AND: [
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: 20,
    });

    const projects = await prisma.project.findMany({
      where: {
        id: { in: accessibleProjectIds.length ? accessibleProjectIds : [-1] },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    });

    const users = await prisma.user.findMany({
      where: {
        ...(currentUser.teamId
          ? {
              OR: [{ teamId: currentUser.teamId }, { userId: currentUser.userId }],
            }
          : { userId: currentUser.userId }),
        username: { contains: query, mode: "insensitive" },
      },
      take: 20,
    });
    res.json({ tasks, projects, users });
  } catch (error) {
    sendError(res, error);
  }
};

export const filterTasks = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const accessibleProjectIds = await getAccessibleProjectIds(currentUser);

    const projectId = requireNumber(req.query.projectId, "projectId", { optional: true });
    const status = requireString(req.query.status, "status", { optional: true });
    const priority = requireString(req.query.priority, "priority", { optional: true });
    const assignedUserId = requireNumber(req.query.assignedUserId, "assignedUserId", { optional: true });

    if (projectId) {
      if (!accessibleProjectIds.includes(projectId)) {
        throw new HttpError(403, "You do not have access to this project");
      }
    }

    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId
          ? { projectId }
          : accessibleProjectIds.length
            ? { projectId: { in: accessibleProjectIds } }
            : { OR: [{ authorUserId: currentUser.userId }, { assignedUserId: currentUser.userId }] }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedUserId && { assignedUserId }),
      },
      include: {
        author: true,
        assignee: true,
        comments: { include: { user: true }, orderBy: { id: "asc" } },
        attachments: true,
      },
      orderBy: { id: "asc" },
    });

    res.json(tasks);
  } catch (error) {
    sendError(res, error);
  }
};

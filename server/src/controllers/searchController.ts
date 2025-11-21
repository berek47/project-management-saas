import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { getAccessibleProjectIds } from "../lib/access";
import { HttpError, sendError } from "../lib/http";
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

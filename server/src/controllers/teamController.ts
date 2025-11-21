import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { HttpError, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.currentUser;
};

export const getTeams = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    if (!currentUser.teamId) {
      res.json([]);
      return;
    }

    const teams = await prisma.team.findMany({
      where: { id: currentUser.teamId },
      orderBy: { id: "asc" },
    });

    const referencedUserIds = Array.from(
      new Set(
        teams
          .flatMap((team) => [team.productOwnerUserId, team.projectManagerUserId])
          .filter((value): value is number => typeof value === "number"),
      ),
    );

    const users = referencedUserIds.length
      ? await prisma.user.findMany({
          where: { userId: { in: referencedUserIds } },
          select: { userId: true, username: true },
        })
      : [];

    const usernameById = new Map(users.map((user) => [user.userId, user.username]));

    const teamsWithUsernames = teams.map((team) => ({
      ...team,
      productOwnerUsername: team.productOwnerUserId
        ? usernameById.get(team.productOwnerUserId)
        : undefined,
      projectManagerUsername: team.projectManagerUserId
        ? usernameById.get(team.projectManagerUserId)
        : undefined,
    }));

    res.json(teamsWithUsernames);
  } catch (error) {
    sendError(res, error);
  }
};

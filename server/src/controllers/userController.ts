import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureSameTeamOrSelf } from "../lib/access";
import { HttpError, requireNumber, requireString, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.currentUser;
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const users = await prisma.user.findMany({
      where: currentUser.teamId
        ? {
            OR: [{ teamId: currentUser.teamId }, { userId: currentUser.userId }],
          }
        : { userId: currentUser.userId },
      orderBy: { userId: "asc" },
    });
    res.json(users);
  } catch (error) {
    sendError(res, error);
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const authProviderId = requireString(
      req.params.authProviderId,
      "authProviderId",
    );
    const user = await prisma.user.findUnique({
      where: {
        authProviderId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    ensureSameTeamOrSelf(currentUser, {
      userId: user.userId,
      teamId: user.teamId,
    });

    res.json(user);
  } catch (error) {
    sendError(res, error);
  }
};

export const postUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUser = req.currentUser;
    const username = requireString(req.body.username, "username");
    const authProviderId = requireString(
      req.body.authProviderId,
      "authProviderId",
    );
    const email = requireString(req.body.email, "email", {
      optional: true,
    });
    const profilePictureUrl =
      requireString(req.body.profilePictureUrl, "profilePictureUrl", {
        optional: true,
      }) || "i1.jpg";
    const teamId = requireNumber(req.body.teamId, "teamId", {
      optional: true,
    });

    if (currentUser && currentUser.authProviderId !== authProviderId) {
      throw new HttpError(403, "You can only save your own workspace profile");
    }

    const user = await prisma.user.upsert({
      where: { authProviderId },
      update: {
        username,
        email,
        profilePictureUrl,
        teamId,
      },
      create: {
        username,
        authProviderId,
        email,
        profilePictureUrl,
        teamId,
      },
    });
    res.status(201).json({ message: "User saved successfully", user });
  } catch (error) {
    sendError(res, error);
  }
};

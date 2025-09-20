import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureProjectAccess } from "../lib/access";
import { HttpError, requireNumber, requireString, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) throw new HttpError(401, "Authentication required");
  return req.currentUser;
};

export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const commentId = requireNumber(req.params.commentId, "commentId");
    const text = requireString(req.body.text, "text");

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: { select: { projectId: true } } },
    });

    if (!comment) throw new HttpError(404, "Comment not found");
    if (comment.userId !== currentUser.userId) {
      throw new HttpError(403, "You can only edit your own comments");
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { text },
      include: { user: true },
    });

    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
};

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const commentId = requireNumber(req.params.commentId, "commentId");

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: { select: { projectId: true } } },
    });

    if (!comment) throw new HttpError(404, "Comment not found");

    await ensureProjectAccess(currentUser, comment.task.projectId);

    const isOwner = comment.userId === currentUser.userId;
    if (!isOwner && !currentUser.teamId) {
      throw new HttpError(403, "You do not have permission to delete this comment");
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
};

import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { HttpError, requireNumber, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) throw new HttpError(401, "Authentication required");
  return req.currentUser;
};

export const createNotification = async (
  userId: number,
  type: string,
  message: string,
  options?: { taskId?: number; projectId?: number },
) => {
  await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      taskId: options?.taskId ?? null,
      projectId: options?.projectId ?? null,
    },
  });
};

export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    const notifications = await prisma.notification.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    sendError(res, error);
  }
};

export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const notificationId = requireNumber(req.params.id, "id");

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new HttpError(404, "Notification not found");
    if (notification.userId !== currentUser.userId) {
      throw new HttpError(403, "Not your notification");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
};

export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    await prisma.notification.updateMany({
      where: { userId: currentUser.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    sendError(res, error);
  }
};

export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    const count = await prisma.notification.count({
      where: { userId: currentUser.userId, isRead: false },
    });

    res.json({ count });
  } catch (error) {
    sendError(res, error);
  }
};

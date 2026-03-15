import { Router } from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "../controllers/notificationController";

const router = Router();

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

export default router;

import { Router } from "express";
import {
  getProjectActivity,
  getTaskActivity,
  getUserActivity,
  getUserActivitySummary,
} from "../controllers/activityLogController";

const router = Router();

router.get("/project/:projectId", getProjectActivity);
router.get("/task/:taskId", getTaskActivity);
router.get("/me", getUserActivity);
router.get("/me/summary", getUserActivitySummary);

export default router;

import { Router } from "express";
import {
  getProjectActivity,
  getTaskActivity,
  getUserActivity,
} from "../controllers/activityLogController";

const router = Router();

router.get("/project/:projectId", getProjectActivity);
router.get("/task/:taskId", getTaskActivity);
router.get("/me", getUserActivity);

export default router;

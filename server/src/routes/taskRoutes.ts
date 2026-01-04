import { Router } from "express";
import {
  createTaskComment,
  createTask,
  getTasks,
  getUserTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getOverdueTasks,
  bulkUpdateTaskStatus,
  duplicateTask,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.patch("/:taskId", updateTask);
router.post("/:taskId/comments", createTaskComment);
router.get("/user/:userId", getUserTasks);
router.get("/overdue", getOverdueTasks);
router.patch("/bulk-status", bulkUpdateTaskStatus);
router.post("/:taskId/duplicate", duplicateTask);
router.delete("/:taskId", deleteTask);

export default router;

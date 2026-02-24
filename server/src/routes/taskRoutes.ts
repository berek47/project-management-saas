import { Router } from "express";
import {
  createTaskComment,
  createTask,
  getTasks,
  getUserTasks,
  updateTaskStatus,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.post("/:taskId/comments", createTaskComment);
router.get("/user/:userId", getUserTasks);

export default router;

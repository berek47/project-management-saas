import { Router } from "express";
import { exportProjectTasksCsv, exportProjectTasksJson } from "../controllers/exportController";

const router = Router();

router.get("/projects/:projectId/tasks.csv", exportProjectTasksCsv);
router.get("/projects/:projectId/tasks.json", exportProjectTasksJson);

export default router;

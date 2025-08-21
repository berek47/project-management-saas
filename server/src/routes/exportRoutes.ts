import { Router } from "express";
import { exportProjectTasksCsv } from "../controllers/exportController";

const router = Router();

router.get("/projects/:projectId/tasks.csv", exportProjectTasksCsv);

export default router;

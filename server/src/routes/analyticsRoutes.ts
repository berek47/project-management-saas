import { Router } from "express";
import { getProjectAnalytics, getWorkspaceAnalytics } from "../controllers/analyticsController";

const router = Router();

router.get("/projects/:projectId", getProjectAnalytics);
router.get("/workspace", getWorkspaceAnalytics);

export default router;

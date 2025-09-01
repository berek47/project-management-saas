import { Router } from "express";
import { getProjectAnalytics, getWorkspaceAnalytics, getTeamAnalytics } from "../controllers/analyticsController";

const router = Router();

router.get("/projects/:projectId", getProjectAnalytics);
router.get("/workspace", getWorkspaceAnalytics);
router.get("/teams/:teamId", getTeamAnalytics);

export default router;

import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  getProjectMembers,
} from "../controllers/projectController";

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProject);
router.put("/:projectId", updateProject);
router.get("/:projectId/members", getProjectMembers);
router.delete("/:projectId", deleteProject);

export default router;

import { Router } from "express";
import { getPinnedTasks, pinTask, unpinTask } from "../controllers/pinnedTaskController";

const router = Router();

router.get("/project/:projectId", getPinnedTasks);
router.post("/:taskId", pinTask);
router.delete("/:taskId", unpinTask);

export default router;

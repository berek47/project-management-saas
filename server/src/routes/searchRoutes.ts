import { Router } from "express";
import { search, filterTasks } from "../controllers/searchController";

const router = Router();

router.get("/", search);
router.get("/filter", filterTasks);

export default router;

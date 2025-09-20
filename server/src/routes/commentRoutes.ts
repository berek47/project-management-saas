import { Router } from "express";
import { updateComment, deleteComment } from "../controllers/commentController";

const router = Router();

router.patch("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;

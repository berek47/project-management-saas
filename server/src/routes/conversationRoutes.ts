import { Router } from "express";
import {
  createDirectConversation,
  createMessage,
  createTeamConversation,
  deleteMessage,
  getConversationMessages,
  getConversations,
  markConversationRead,
  updateMessage,
} from "../controllers/conversationController";

const router = Router();

router.get("/", getConversations);
router.post("/direct", createDirectConversation);
router.post("/team", createTeamConversation);
router.get("/:conversationId/messages", getConversationMessages);
router.post("/:conversationId/messages", createMessage);
router.patch("/:conversationId/messages/:messageId", updateMessage);
router.delete("/:conversationId/messages/:messageId", deleteMessage);
router.patch("/:conversationId/read", markConversationRead);

export default router;

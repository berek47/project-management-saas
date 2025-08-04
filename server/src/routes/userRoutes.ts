import { Router } from "express";

import { getUser, getUsers, postUser, updateUserProfile, getMyProfile } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/me/profile", getMyProfile);
router.patch("/me/profile", updateUserProfile);
router.get("/:authProviderId", getUser);

export default router;

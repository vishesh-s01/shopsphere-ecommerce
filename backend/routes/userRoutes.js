import express from "express";
import checkJwt from "../middleware/authMiddleware.js";
import {
  syncUser,
  getCurrentUser,
  updateRole,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/sync", checkJwt, syncUser);

router.get("/me", checkJwt, getCurrentUser);

router.patch("/role", checkJwt, updateRole);

export default router;
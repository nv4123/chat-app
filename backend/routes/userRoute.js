// routes/users.js

import express from "express";
import { getAllUsers, getUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifytokens.js";

const router = express.Router();


// GET /api/users - get all users (protected)
router.get("/", verifyToken, getAllUsers);

// GET /api/users/me - get current user (protected)
router.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

// GET /api/users/:id - get one user by ID (protected)
router.get("/:id", verifyToken, getUser);

export default router;

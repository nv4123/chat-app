// routes/chatMessages.js

import express from "express";
import { createMessage, getMessages } from "../controllers/chatmessageController.js";
import { verifyToken } from "../middleware/verifytokens.js";

const router = express.Router();

// POST /api/messages - Create a new message (protected)
router.post("/", verifyToken, createMessage);

// GET /api/messages/chat/:chatRoomId - Get all messages from a specific chat room (protected)
router.get("/chat/:chatRoomId", verifyToken, getMessages);

export default router;

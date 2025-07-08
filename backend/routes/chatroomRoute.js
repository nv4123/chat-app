// routes/ChatRoom.js

import express from "express";
import {
  createChatRoom,
  getChatRoomOfUser,
  getChatRoomOfUsers,
} from "../controllers/chatroomController.js";
import { verifyToken } from "../middleware/verifytokens.js";

const router = express.Router();

// Create a new chat room between two users
router.post("/create", verifyToken, createChatRoom);

// Get all chat rooms for a user
router.get("/user/:userId", verifyToken, getChatRoomOfUser);

// Get the specific chat room shared between two users
router.get("/pair/:firstUserId/:secondUserId", verifyToken, getChatRoomOfUsers);

export default router;

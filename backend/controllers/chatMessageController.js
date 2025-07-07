// controllers/chatMessageController.js

import ChatMessage from "../models/ChatMessage.js";
import mongoose from "mongoose";

// POST /api/messages - Send a message
export const createMessage = async (req, res) => {
  const { chatRoomId, sender, text } = req.body;

  // Log the incoming request body for debugging
  console.log("Request Body:", req.body);

  // 1. Validate input fields
  if (!chatRoomId || !sender || !text) {
    return res
      .status(400)
      .json({ message: "chatRoomId, sender, and text are required." });
  }

  // 2. Validate chatRoomId as a MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
    return res.status(400).json({ message: "Invalid chatRoomId format." });
  }

  try {
    // 3. Create new message
    const newMessage = new ChatMessage({
      chatRoomId,
      sender,
      text,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error.message);
    res.status(500).json({
      message: "Server error while saving message",
      error: error.message,
    });
  }
};

// GET /api/messages/:chatRoomId - Get all messages in a chat room
export const getMessages = async (req, res) => {
  const { chatRoomId } = req.params;

  // Validate chatRoomId format
  if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
    return res.status(400).json({ message: "Invalid chatRoomId format." });
  }

  try {
    // Fetch messages sorted by createdAt (oldest first)
    const messages = await ChatMessage.find({ chatRoomId }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({
      message: "Server error while fetching messages",
      error: error.message,
    });
  }
};

// controllers/chatMessageController.js

import ChatMessage from "../models/chatmessageModel.js";
import mongoose from "mongoose";

// POST /api/messages - Send a message
export const createMessage = async (req, res) => {
  const sender = req.user?.id;
  console.log("req.user at top of controller:", req.user);

  const { chatRoomId, receiver, text } = req.body;

  console.log("Final sender before saving:", sender, typeof sender);
  console.log("Final chatRoomId before saving:", chatRoomId, typeof chatRoomId);
  console.log("Final receiver before saving:", receiver, typeof receiver);
  console.log("Mongoose models:", mongoose.models);
  if (!chatRoomId || !sender || !receiver || !text) {
    return res
      .status(400)
      .json({ message: "chatRoomId, sender, receiver, and text are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
    return res.status(400).json({ message: "Invalid chatRoomId format." });
  }

  try {
     console.log("Final sender before saving:", sender);

    const newMessage = new ChatMessage({
      
      chatRoomId,   // ✅ this matches your schema now
      sender,
      receiver,
      text,
    });
    console.log("neMessage to save:", newMessage);
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

  if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
    return res.status(400).json({ message: "Invalid chatRoomId format." });
  }

  try {
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

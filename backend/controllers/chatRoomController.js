// controllers/chatRoomController.js

import ChatRoom from "../models/chatroomModel.js";
import mongoose from "mongoose";
export const createChatRoom = async (req, res) => {
  const senderId = req.user?.id;  // ✅ From token
  const { receiverId } = req.body;

  // Log the incoming data for debugging
  console.log("Sender from token:", senderId);
  console.log("Receiver from body:", receiverId);

  // Validate input
  if (!senderId || !receiverId || senderId === receiverId) {
    return res.status(400).json({ message: "Invalid sender or receiver ID." });
  }

  if (
    !mongoose.Types.ObjectId.isValid(senderId) ||
    !mongoose.Types.ObjectId.isValid(receiverId)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid MongoDB ObjectId format." });
  }

  try {
    const existingRoom = await ChatRoom.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }

    const newChatRoom = new ChatRoom({
      members: [senderId, receiverId],
    });

    await newChatRoom.save();
    res.status(201).json(newChatRoom);
  } catch (error) {
    console.error("Error creating chat room:", error.message);
    res.status(500).json({
      message: "Server error while creating chat room",
      error: error.message,
    });
  }
};

// Get all chat rooms for a user, sorted by latest message time
export const getChatRoomOfUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const chatRooms = await ChatRoom.aggregate([
      {
        $match: {
          members: { $in: [new mongoose.Types.ObjectId(userId)] },
        },
      },
      {
        $lookup: {
          from: "chatmessages",
          localField: "_id",
          foreignField: "chatRoomId",
          as: "messages",
        },
      },
      {
        $addFields: {
          latestMessage: { $last: "$messages" },
        },
      },
      {
        $sort: {
          "latestMessage.createdAt": -1,
        },
      },
      {
        $project: {
          messages: 0,
        },
      },
    ]);

    res.status(200).json(chatRooms);
  } catch (error) {
    console.error("Error fetching chat rooms for user:", error.message);
    res.status(500).json({
      message: "Error fetching chat rooms for user",
      error: error.message,
    });
  }
};

// Get a chat room between two specific users
export const getChatRoomOfUsers = async (req, res) => {
  const { firstUserId, secondUserId } = req.params;

  try {
    const room = await ChatRoom.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });

    if (!room) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching chat room",
      error: error.message,
    });
  }
};
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import userModel from "./models/userModel.js";
import ChatMessage from "./models/chatmessageModel.js";

import "./config/db.js";
import { verifyToken, verifySocketToken } from "./middleware/verifytokens.js";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";            // Fix file name user(s).js
import chatRoomRoutes from "./routes/chatroomRoute.js";     // from ChatRoom.js
import chatMessageRoutes from "./routes/chatmessageRoute.js"; // from chatMessages.js

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.send("API is running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/chatrooms", verifyToken, chatRoomRoutes);
app.use("/api/messages", verifyToken, chatMessageRoutes);

io.use(verifySocketToken);

global.onlineUsers = new Map();

const getUserIdBySocketId = (map, socketId) => {
  for (let [userId, sId] of map.entries()) {
    if (sId === socketId) return userId;
  }
};

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("messageDelivered", async ({ messageId }) => {
   // await ChatMessage.findByIdAndUpdate(messageId, { $set : {status: "delivered"} });
  });

  socket.on("messageRead", async ({ chatRoomId }) => {
   // await ChatMessage.updateMany(
   //   { chatRoomId, status: { $ne: "read" } },
   //   { $set: { status: "read" } }
   // );
  });

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("getUsers", Array.from(onlineUsers.keys())); // send array of userIds
  });

  socket.on("sendMessage", async ({ sender, receiver, text, chatRoomId }) => {
    // Use keys matching backend model exactly
    console.log({sender,
      receiver,
      chatRoomId,
      text,
      status: "sent",})
    const newMessage = new ChatMessage({
      sender,
      receiver,
      chatRoomId,
      text,
      status: "sent",
    });

    await newMessage.save();

    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("getMessage", {
        ...newMessage._doc,
      });

      // Update status to delivered if receiver connected
     // await ChatMessage.findByIdAndUpdate(newMessage._id, { $set : { status: "delivered"} });

      socket.emit("messageStatusUpdate", {
        messageId: newMessage._id,
        status: "delivered",
      });
    } else {
      // Receiver offline, message 'sent' only
      socket.emit("messageStatusUpdate", {
        messageId: newMessage._id,
        status: "sent",
      });
    }

    io.to(chatRoomId).emit("receiveMessage", {
      chatRoomId,
      sender,
      text,
      timestamp: newMessage.createdAt || new Date().toISOString(),
    });
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("roomMessage", ({ chatRoomId, sender, text }) => {
    io.to(chatRoomId).emit("receiveMessage", {
      chatRoomId,
      sender,
      text,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("typing", ({ chatRoomId, sender, receiver }) => {
    const receiverSocket = onlineUsers.get(receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typingStatus", {
        chatRoomId,
        sender,
        isTyping: true,
      });
    }
  });

  socket.on("stopTyping", ({ chatRoomId, sender, receiver }) => {
    const receiverSocket = onlineUsers.get(receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typingStatus", {
        chatRoomId,
        sender,
        isTyping: false,
      });
    }
  });

  socket.on("disconnect", async () => {
    const userId = getUserIdBySocketId(onlineUsers, socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      await userModel.findByIdAndUpdate(userId, { lastSeen: new Date() });
    }
    io.emit("getUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("logoutUser", async (userId) => {
    onlineUsers.delete(userId);
    await userModel.findByIdAndUpdate(userId, { lastSeen: new Date() });
    io.emit("getUsers", Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
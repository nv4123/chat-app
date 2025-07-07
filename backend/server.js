import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import User from "./models/User.js";
import ChatMessage from "./models/ChatMessage.js";
import "./config/db.js";
import { verifyToken, verifySocketToken } from "./middleware/verifytokens.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoomRoutes from "./routes/chatroom.js";
import chatMessageRoutes from "./routes/chatMessage.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.send("API is running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/chatrooms", verifyToken, chatRoomRoutes);
app.use("/api/messages", verifyToken, chatMessageRoutes);

io.use(verifySocketToken);

global.onlineUsers = new Map();

const getKeyByValue = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("messageDelivered", async ({ messageId }) => {
    await ChatMessage.findByIdAndUpdate(messageId, { status: "delivered" });
  });

  socket.on("messageRead", async ({ chatRoomId }) => {
    await ChatMessage.updateMany(
      { chatRoomId, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );
  });

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text, chatRoomId }) => {
    const newMessage = new ChatMessage({
      sender: senderId,
      receiver: receiverId, // Added to match schema
      chatRoomId,
      text,
      status: "sent",
      timestamp: new Date(),
    });

    await newMessage.save();

    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      socket.to(receiverSocket).emit("getMessage", {
        ...newMessage._doc,
      });
      await ChatMessage.findByIdAndUpdate(newMessage._id, { status: "delivered" });
      socket.emit("messageStatusUpdate", {
        messageId: newMessage._id,
        status: "delivered",
      });
    } else {
      socket.emit("messageStatusUpdate", {
        messageId: newMessage._id,
        status: "sent",
      });
    }

    io.to(chatRoomId).emit("receiveMessage", {
      chatRoomId,
      sender: senderId,
      text,
      timestamp: newMessage.timestamp,
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
    console.log("📨 Room message sent to room:", chatRoomId);
  });

  socket.on("typing", ({ chatRoomId, senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typingStatus", {
        chatRoomId,
        senderId,
        isTyping: true,
      });
    }
  });

  socket.on("stopTyping", ({ chatRoomId, senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typingStatus", {
        chatRoomId,
        senderId,
        isTyping: false,
      });
    }
  });

  socket.on("disconnect", async () => {
    const userId = getKeyByValue(onlineUsers, socket.id);
    onlineUsers.delete(userId);
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    }
    io.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("logoutUser", async (userId) => {
    onlineUsers.delete(userId);
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    }
    io.emit("getUsers", Array.from(onlineUsers));
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
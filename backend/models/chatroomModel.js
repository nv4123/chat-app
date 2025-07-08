// models/Chatroom.js

import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: function (v) {
          return v.length === 2;
        },
        message: "ChatRoom must have exactly 2 members",
      },
    },
  },
  { timestamps: true }
);

// Optional: Index to avoid duplicate rooms between same two users
chatRoomSchema.index({ members: 1 }, { unique: false });

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;

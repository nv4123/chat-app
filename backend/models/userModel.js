// models/User.js

import mongoose from "mongoose";

// Define the schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true }
);

// Export the model
export default mongoose.model("User", userSchema);

// backend/controllers/user.js

import User from "../models/userModel.js";
import { Types } from "mongoose";
const ObjectId = Types.ObjectId; // Import ObjectId from mongoose.Types

// GET /api/users - Get all users (excluding passwords)
export const getAllUsers = async (req, res) => {
  const search = req.query.search || ""; // if empty, returns all
  console.log(req.user);
  try {
    const users = await User.find(
      {

        name: { $regex: search, $options: "i" }, 
        _id:{$ne:new ObjectId(req.user.id)},// case-insensitive match
      },
      "-password"
    );

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error while fetching users." });
  }
};

// GET /api/users/:id - Get single user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error while fetching user." });
  }
};

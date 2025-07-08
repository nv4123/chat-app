// controllers/authController.js

import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, phone, password } = req.body;

  // Input validation
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Phone number validation (example: 10 digits)
  const phoneRegex = /^\d{10}$/;
  if (!phone.match(phoneRegex)) {
    return res.status(400).json({ message: "Invalid phone number." });
  }

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ phone });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Phone number already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  // Input validation
  if (!phone || !password) {
    return res
      .status(400)
      .json({ message: "Phone and password are required." });
  }

  try {
    // Find user by phone
    const user = await userModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, phone: userModel.phone, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// middleware/verifytokens.js
import { request } from "express";
import jwt from "jsonwebtoken";

// ✅ REST API middleware
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // attach user ID from token
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token is invalid or expired" });
  }
};

// ✅ Socket.IO token middleware
export const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error("Invalid or expired token"));
  }
};

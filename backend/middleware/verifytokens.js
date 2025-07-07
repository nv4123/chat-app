// middleware/verifytokens.js

import jwt from "jsonwebtoken";

// ✅ Middleware for verifying token in REST API routes
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next(); // Continue to next middleware or controller
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token is invalid or expired" });
  }
};

// ✅ Middleware for verifying token in Socket.IO
export const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next(); // Continue with socket connection
  } catch (error) {
    return next(new Error("Invalid or expired token"));
  }
};

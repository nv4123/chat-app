import { io } from "socket.io-client";

class SocketService {
  socket = null;

  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io("http://localhost:5000", {
      auth: { token },
    });
    this.socket.on("connect", () => {
    console.log("✅ Socket connected with ID:", this.socket.id);
  });

  // ❗ Optional: catch errors
  this.socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

export const socketService = new SocketService();
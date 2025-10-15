import { io } from "socket.io-client";

class SocketService {

  socket = null;

  init() {

    if (this.socket) return this.socket;

    const server = "https://webrtc.usernaxo.com";

    this.socket = io(server, { transports: ["websocket", "polling"] });

    this.socket.on("connect", () => console.log("Socket connected"));
    this.socket.on("disconnect", () => console.log("Socket disconnected"));

    return this.socket;

  }

  dispose() {

    if (this.socket) {

      this.socket.disconnect();
      this.socket = null;

    }

  }
  
}

export const socketService = new SocketService();

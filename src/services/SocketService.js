import { io } from "socket.io-client";

class SocketService {

  constructor() {
    this.socket = null;
  }

  init() {

    const server = "https://webrtc.usernaxo.com";

    this.socket = io(server, {transports: ["websocket"]});

    this.socket.on("connect", () => console.log("Socket connected"));
    this.socket.on("disconnect", () => console.log("Socket disconnected"));

  }
  
  onConnect(callback) {

    this.socket?.on("connect", () => callback());

  }

  on(event, handler) {

    this.socket?.on(event, handler);

  }

  off(event, handler) {

    this.socket?.off(event, handler);

  }

  emit(event, data) {

    this.socket?.emit(event, data);

  }

  dispose() {

    this.socket?.disconnect();
    this.socket = null;

  }

}

export const socketService = new SocketService();

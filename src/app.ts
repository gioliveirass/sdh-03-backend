import { Server, Socket } from "socket.io";

import express from "express";
import http from "http";

class App {
  private app: express.Application;
  private http: http.Server;
  private io: Server;

  constructor() {
    this.app = express();
    this.http = new http.Server(this.app);
    this.io = new Server(this.http, { cors: { origin: "*" } });
  }

  public listen() {
    this.http.listen(3333, () => {
      console.log("Server is running on port 3333!");
    });
  }

  public listenSocket() {
    this.io.of("/streams").on("connection", this.socketEvents);
  }

  private socketEvents(socket: Socket) {
    console.log("Socket connected: " + socket.id);

    socket.on("subscribe", (data) => {
      console.log("User inserted into room " + data.roomId);

      socket.join(data.roomId);
      socket.join(data.socketId);

      const roomSession = Array.from(socket.rooms);

      if (roomSession.length > 1) {
        socket
          .to(data.roomId)
          .emit("new user", { socketId: socket.id, username: data.username });
      }

      socket.on("chat", (message) => {
        console.log("Send message: " + message);

        socket.broadcast.to(data.roomId).emit("chat", {
          message: message.message,
          username: message.username,
          time: message.time,
        });
      });
    });

    socket.on("new user start", (data) => {
      console.log("New user connected: ", data);
      socket.to(data.to).emit("new user start", { sender: data.sender });
    });

    socket.on("send peer description", (data) => {
      socket.to(data.to).emit("send peer description", {
        description: data.description,
        sender: data.sender,
      });
    });

    socket.on("ice candidates", (data) => {
      socket.to(data.to).emit("ice candidates", {
        candidate: data.candidate,
        sender: data.sender,
      });
    });

    socket.on("disconnect", (data) => {
      console.log("Socket disconnected: " + socket.id);
      socket.disconnect();
    });
  }
}

export default App;

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

      socket.on("chat", (message) => {
        console.log("Send message: " + message);

        socket.broadcast.to(data.roomId).emit("chat", {
          message: message.message,
          username: message.username,
          time: message.time,
        });
      });
    });
  }
}

export default App;

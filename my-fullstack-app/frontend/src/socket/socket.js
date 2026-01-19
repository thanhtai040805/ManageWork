import { io } from "socket.io-client";

const socket = io("http://localhost:8888", {
  withCredentials: true,
  transports: ["polling", "websocket"],
  autoConnect: false, // QUAN TRỌNG
});

export default socket;

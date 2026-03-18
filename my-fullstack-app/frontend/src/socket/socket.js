import { io } from "socket.io-client";

const socket = io("http://localhost:8888", {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("access_token"),
  },
});

export default socket;

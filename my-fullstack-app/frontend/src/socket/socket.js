import { io } from "socket.io-client";

const getToken = () => localStorage.getItem("access_token");

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8888", {
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});

export default socket;
export { getToken };

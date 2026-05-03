import { io } from "socket.io-client";

const getToken = () => localStorage.getItem("access_token");

const socket = io("http://localhost:8888", {
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});

export default socket;
export { getToken };

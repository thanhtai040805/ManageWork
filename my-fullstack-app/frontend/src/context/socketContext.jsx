import { createContext, useContext, useEffect } from "react";
import socket from "@/socket/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    console.log("CONNECTING SOCKET...");
    socket.connect();

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED", socket.id);
    });

    socket.on("connect_error", (e) => {
      console.log("CONNECT ERROR", e.message);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

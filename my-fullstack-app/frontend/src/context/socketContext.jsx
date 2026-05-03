import { createContext, useContext, useEffect } from "react";
import socket, { getToken } from "@/socket/socket";

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    const token = getToken();
    if (!token) return; // Chỉ connect khi có token

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

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

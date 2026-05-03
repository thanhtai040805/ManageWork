import { useEffect , useState } from 'react'
import  socket , { getToken } from '../socket/socket'
import { useChatStore } from '@/stores/chat';
const useSocket = () => {
    const setSocketConnected = useChatStore((s) => s.setConnected);

    useEffect(() => {
        const token = getToken();
        if (!token) return; // Chỉ connect khi có token

        if (!socket.connected) socket.connect();

        const onConnect = () => {
            console.log("🟢 Socket connected:", socket.id);
            setSocketConnected(true);
        }
        const onDisconnect = () => {
            setSocketConnected(false);
            console.log("🔴 Socket disconnected");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        }
    }, [])
    return { socket };
}

export default useSocket;
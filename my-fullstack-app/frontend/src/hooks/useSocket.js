import { useEffect , useState } from 'react'
import  socket  from '../socket/socket'

const useSocket = () => {
    const [connected , setConnected] = useState(false);
    
    useEffect(() => {
        if (!socket.connected) socket.connect();

        const onConnect = () => {
            console.log("🟢 Socket connected:", socket.id);
            setConnected(true);
        }
        const onDisconnect = () => {
            setConnected(false);
            console.log("🔴 Socket disconnected");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        }
    }, [])
    return { connected };
}

export default useSocket;
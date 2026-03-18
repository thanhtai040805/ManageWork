import { useEffect } from "react";
import { getMyChatRoomsAPI } from "@/services/chat-room.service";
import { useChatStore } from "@/stores/chat/chatStore";

export function useChatRooms() {
  const { rooms, setRooms, loadingRooms, setLoadingRooms } = useChatStore();

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await getMyChatRoomsAPI();
      setRooms(res || []);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!rooms.length) fetchRooms();
  }, []);

  return { rooms, loading: loadingRooms, fetchRooms };
}

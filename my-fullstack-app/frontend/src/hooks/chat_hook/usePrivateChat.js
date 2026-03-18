import { useState } from "react";
import { createChatRoomAPI } from "@/services/chat-room.service";
import { useChatStore } from "@/stores/chat/chatStore";

export function usePrivateChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const addRoom = useChatStore((s) => s.addRoom);

  const startPrivateChat = async ({ userId, username }) => {
    try {
      setLoading(true);
      setError(null);

      const res = await createChatRoomAPI({
        room_name: username,
        is_group: false,
        member_ids: [userId],
      });

      const room = res?.room;
      if (room) addRoom(room);

      return room;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { startPrivateChat, loading, error };
}

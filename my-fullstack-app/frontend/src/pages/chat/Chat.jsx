import React from "react";
import { RoomList } from "@/features/chat/RoomList";
import { ChatPanel } from "@/features/chat";
import { useChatStore } from "@/stores/chat/chatStore";

export const Chat = () => {
  const currentRoom = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === s.currentRoomId),
  );

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
      <RoomList />
      <ChatPanel />
    </div>
  );
};

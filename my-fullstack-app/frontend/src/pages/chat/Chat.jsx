import React from "react";
import { RoomList } from "@/features/chat/RoomList";
import { ChatPanel } from "@/features/chat";
import { useChatStore } from "@/stores/chat/chatStore";

export const Chat = () => {
  const currentRoom = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === s.currentRoomId),
  );

  return (
    <div className="flex">
      <RoomList />
      <ChatPanel selectedRoom={currentRoom} />
    </div>
  );
};

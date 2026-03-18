import React from "react";
import { MessageInput, MessageList, TypingIndicator } from "./index";
import { useChatStore } from "@/stores/chat/chatStore";

export const ChatPanel = () => {
  const selectedRoom = useChatStore((s) => s.rooms.find(r => r.room_id === s.currentRoomId));
  console.log("Selected Room:", selectedRoom);

  if (!selectedRoom) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white">
            {(
              selectedRoom.room_name ||
              selectedRoom.full_name ||
              selectedRoom.name
            )
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          {/* Name */}
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              {selectedRoom.room_name ||
                selectedRoom.full_name ||
                selectedRoom.name}
            </h2>
            <p className="text-xs text-gray-400">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={selectedRoom.messages || []} />

      {/* Typing */}
      <TypingIndicator />

      {/* Input */}
      <MessageInput room={selectedRoom}/>
    </div>
  );
};

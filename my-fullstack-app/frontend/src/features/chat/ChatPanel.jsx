import React, { useMemo } from "react";
import { MessageInput, MessageList, TypingIndicator } from "./index";
import { useChatStore } from "@/stores/chat/chatStore";
import { useOnlineStore } from "@/stores/chat/useOnlineStore";

export const ChatPanel = () => {
  const selectedRoom = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === s.currentRoomId)
  );

  const onlineUsers = useOnlineStore((s) => s.onlineUsers);
  const is_group = selectedRoom?.is_group || false;
  const partner_id = selectedRoom?.partner_id;
  const members = selectedRoom?.members || [];
  const { isOnline, onlineCount } = useMemo(() => {
    if (!selectedRoom) {
      return { isOnline: false, onlineCount: 0 };
    }
    if (!is_group) {
      const status =
        partner_id && onlineUsers instanceof Set
          ? onlineUsers.has(partner_id)
          : false;

      return { isOnline: status, onlineCount: 0 };
    }
    const count = members.reduce(
      (acc, m) => acc + (onlineUsers.has(m.user_id) ? 1 : 0),
      0
    );

    return { isOnline: false, onlineCount: count };
  }, [selectedRoom, is_group, partner_id, members, onlineUsers]);
  if (!selectedRoom) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  const displayName =
    selectedRoom.room_name ||
    selectedRoom.full_name ||
    selectedRoom.name ||
    "Unknown";

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      <div className="px-5 py-4 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-800">
              {displayName}
            </h2>

            <p className="text-xs text-gray-400">
              {!is_group
                ? isOnline
                  ? "Online"
                  : "Offline"
                : `${onlineCount} online`}
            </p>
          </div>
        </div>
      </div>

      <MessageList roomId={selectedRoom.room_id} />
      <TypingIndicator />
      <MessageInput room={selectedRoom} />
    </div>
  );
};
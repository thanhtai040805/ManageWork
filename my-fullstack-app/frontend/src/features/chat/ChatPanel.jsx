import React, { useContext, useMemo , useEffect} from "react";
import { MessageInput, MessageList, TypingIndicator } from "./index";
import { useChatStore } from "@/stores/chat/chatStore";
import { useOnlineStore } from "@/stores/chat/useOnlineStore";
import { ThemeContext } from "@/context/themeContext";

export const ChatPanel = () => {
  const { primaryColor } = useContext(ThemeContext);
  const rooms = useChatStore((s) => s.rooms);
  const selectedRoom = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === s.currentRoomId)
  );
  const selectFirstRoom = useChatStore((s) => s.selectFirstRoom);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      selectFirstRoom();
    }
  }, [rooms, selectedRoom]);

  console.log("Selected Room:", selectedRoom);
  
  const onlineUsers = useOnlineStore((s) => s.onlineUsers);
  const is_group = selectedRoom?.is_group || false;
  const partner_id = selectedRoom?.partner_id;
  const members = selectedRoom?.members || [];
  const { isOnline, onlineCount } = useMemo(() => {
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
  }, [selectedRoom, onlineUsers]);

  const displayName =
    selectedRoom?.name ||
    "Unknown";

  if (!selectedRoom) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-[#efeae2] min-h-[calc(100vh-140px)]">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#efeae2] min-h-[calc(100vh-140px)]">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-[#f0f2f5]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {displayName}
            </h2>

            <p className="text-xs text-gray-500">
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
import React, { useContext } from "react";
import RoomItem from "./RoomItem";
import { UserItem } from "./userItem";
import { useChatRooms } from "@/hooks/chat_hook/useChatRooms";
import { useChatSearch } from "@/hooks/chat_hook/useChatSearch";
import { usePrivateChat } from "@/hooks/chat_hook/usePrivateChat";
import { useChatStore } from "@/stores/chat/chatStore";
import { loadMessagesAPI } from "@/services/message.service";
import { useMessageStore } from "@/stores/chat/messageStore";
import { ThemeContext } from "@/context/themeContext";

export const RoomList = () => {
  const { primaryColor } = useContext(ThemeContext);
  const { rooms, loading } = useChatRooms();
  const { keyword, setKeyword, isSearchMode, roomsResult, usersResult } =
    useChatSearch(rooms);
  const { startPrivateChat, loading: privateChatLoading } = usePrivateChat();
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const setMessages = useMessageStore((s) => s.setMessages);

  const handleClick = async (room) => {
    setCurrentRoom(room.room_id);
    const res = await loadMessagesAPI({ roomId: room.room_id });
    setMessages(room.room_id, res.messages);
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white flex flex-col min-h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-gray-200 bg-[#f0f2f5]">
        <h2 className="text-base font-semibold text-gray-800">Chats</h2>
      </div>

      <div className="p-3 border-b border-gray-100 bg-[#f0f2f5]">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search or start new chat"
          className="w-full rounded-lg bg-white px-3 py-2 text-sm outline-none"
          style={{
            border: `1px solid ${primaryColor}22`,
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearchMode ? (
          <>
            {roomsResult.map((room) => (
              <RoomItem
                key={room.room_id}
                room={room}
                active={currentRoomId === room.room_id}
                onClick={() => {
                  handleClick(room);
                  setKeyword("");
                }}
              />
            ))}

            {usersResult.map((user) => (
              <UserItem
                user={user}
                key={user.user_id}
                disabled={loading || privateChatLoading}
                onClick={async () => {
                  const room = await startPrivateChat({
                    username: user.full_name,
                    userId: user.user_id,
                  });
                  if (room) {
                    handleClick(room);
                  }
                  setKeyword("");
                }}
              />
            ))}
          </>
        ) : (
          <>
            {rooms.map((room) => (
              <RoomItem
                key={room.room_id}
                room={room}
                active={currentRoomId === room.room_id}
                onClick={() => {
                  handleClick(room);
                  setKeyword("");
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

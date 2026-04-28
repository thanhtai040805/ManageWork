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
import { emitOpenRoom } from "@/socket/socketEmit";

import { Plus, Search, MessageSquare } from "lucide-react";

export const RoomList = () => {
  const { primaryColor } = useContext(ThemeContext);
  const { rooms, loading } = useChatRooms();
  const { keyword, setKeyword, isSearchMode, roomsResult, usersResult } =
    useChatSearch(rooms);
  const { startPrivateChat, loading: privateChatLoading } = usePrivateChat();
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);
  const setMessages = useMessageStore((s) => s.setMessages);

  const markRoomAsRead = useChatStore((s) => s.markRoomAsRead);

  const handleClick = async (room) => {
    setCurrentRoom(room.room_id);
    markRoomAsRead(room.room_id);
    emitOpenRoom(room.room_id);
    const res = await loadMessagesAPI({ roomId: room.room_id });
    setMessages(room.room_id, res.messages);
  };

  React.useEffect(() => {
    if (!loading && rooms.length > 0 && !currentRoomId && !isSearchMode) {
      handleClick(rooms[0]);
    }
  }, [loading, rooms, currentRoomId, isSearchMode]);

  return (
    <div className="w-[320px] h-full border-r border-gray-200/60 bg-white flex flex-col z-20">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: primaryColor }}>
             <MessageSquare size={18} fill="currentColor" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Messages</h2>
        </div>
        <button 
          className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
          title="New Chat"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors">
            <Search size={16} />
          </div>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-2xl bg-gray-100/80 border-2 border-transparent px-10 py-2.5 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-black/5"
            style={{
              "--tw-ring-color": primaryColor + "11",
            }}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
        {isSearchMode ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {roomsResult.length > 0 && (
              <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Conversations</div>
            )}
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

            {usersResult.length > 0 && (
              <div className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">New People</div>
            )}
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
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {rooms.length === 0 && !loading && (
              <div className="mt-10 text-center px-6">
                <p className="text-sm text-gray-400 font-medium leading-relaxed">No active chats found. Try searching for someone!</p>
              </div>
            )}
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
          </div>
        )}
      </div>
    </div>
  );
};

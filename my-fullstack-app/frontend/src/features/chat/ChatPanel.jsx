import React, { useContext, useMemo, useEffect, useState } from "react";
import { MessageInput, MessageList, TypingIndicator } from "./index";
import { useChatStore } from "@/stores/chat/chatStore";
import { useOnlineStore } from "@/stores/chat/useOnlineStore";
import { ThemeContext } from "@/context/themeContext";
import { AuthContext } from "@/context/authContext";
import { Settings, UserPlus, Info, Pin } from "lucide-react";
import { PinnedMessagesDialog } from "./PinnedMessagesDialog";

export const ChatPanel = () => {
  const { primaryColor } = useContext(ThemeContext);
  const [showPinned, setShowPinned] = useState(false);
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

  const roomRole = selectedRoom?.role || 'member';
  console.log("Selected Room:", selectedRoom);
  
  const { auth } = useContext(AuthContext);
  const currentUserId = String(auth?.user?.uid);
  
  const onlineUsers = useOnlineStore((s) => s.onlineUsers);
  const is_group = selectedRoom?.is_group || false;
  const partner_id = selectedRoom?.partner_id;
  const members = selectedRoom?.members || [];

  const { isOnline, onlineCount, othersOnline } = useMemo(() => {
    if (!is_group) {
      const status =
        partner_id && onlineUsers instanceof Set
          ? onlineUsers.has(String(partner_id))
          : false;
      return { isOnline: status, onlineCount: 0, othersOnline: status };
    }
    
    // In group, count online users excluding current user
    const others = members.filter(m => String(m.user_id) !== currentUserId);
    const count = others.reduce(
      (acc, m) => acc + (onlineUsers.has(String(m.user_id)) ? 1 : 0),
      0
    );

    return { isOnline: false, onlineCount: count, othersOnline: count > 0 };
  }, [selectedRoom, onlineUsers, currentUserId]);

  const displayName =
    selectedRoom?.name ||
    "Unknown";

  if (!selectedRoom) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#f8f9fa] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-80">
        <div className="flex flex-col items-center gap-6 text-center animate-in zoom-in duration-700">
          <div 
            className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <Settings size={48} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Select a conversation</h2>
            <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
              Choose a room from the sidebar or search for a new person to start chatting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8f9fa] relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/60 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            {selectedRoom?.avatar_url ? (
              <img 
                src={selectedRoom.avatar_url} 
                alt={displayName} 
                className="w-11 h-11 rounded-2xl object-cover shadow-sm border border-gray-100"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {!is_group && isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>

          <div>
            <h2 className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-1.5">
              {displayName}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${othersOnline ? "bg-green-500" : "bg-gray-300"}`} />
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                {!is_group
                  ? isOnline
                    ? "Active Now"
                    : "Offline"
                  : `${onlineCount} others online`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPinned(true)}
            className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all active:scale-95 group"
            title="Pinned Messages"
          >
            <Pin size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all active:scale-95">
            <Info size={20} />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all active:scale-95">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <MessageList roomId={selectedRoom.room_id} />
      <TypingIndicator />
      <MessageInput room={selectedRoom} />

      {showPinned && (
        <PinnedMessagesDialog 
          roomId={selectedRoom.room_id} 
          onClose={() => setShowPinned(false)} 
        />
      )}
    </div>
  );
};
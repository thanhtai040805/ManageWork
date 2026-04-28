import { useContext } from "react";
import { ThemeContext } from "@/context/themeContext";
import { useOnlineStore } from "@/stores/chat/useOnlineStore";

export default function RoomItem({ room, active, onClick }) {
  const { primaryColor } = useContext(ThemeContext);
  const isOnline = useOnlineStore((s) => s.onlineUsers.has(String(room.partner_id)));
  
  const isUser = room.type === "user"; // From search
  const isGroup = room.is_group;
  const displayName = isUser ? room.full_name : room.name;

  const avatarUrl = isUser ? room.avatar_url : (room.avatar_url || room.partner_avatar);
  const lastMessage = room.last_message_content;
  const lastTime = room.last_message_at;
  const senderName = room.last_message_sender_name;

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`relative px-4 py-3 cursor-pointer rounded-2xl transition-all duration-300 group select-none overflow-hidden ${
        active 
          ? "bg-gray-50 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]" 
          : "hover:bg-gray-50/60"
      }`}
    >
      {/* Active Indicator Bar */}
      {active && (
        <div 
          className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full animate-in slide-in-from-left-1 duration-300"
          style={{ backgroundColor: primaryColor }}
        />
      )}

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-2xl text-white text-lg font-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-500"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
            >
              {(displayName || "U").charAt(0).toUpperCase()}
            </div>
          )}
          
          {!isGroup && isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full shadow-sm ring-1 ring-black/5" title="Online" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className={`text-[14px] truncate tracking-tight transition-colors ${active ? "font-black text-gray-900" : "font-bold text-gray-700"}`}>
              {displayName}
            </h4>
            <span className="text-[10px] text-gray-400 font-bold shrink-0 ml-2">
              {formatTime(lastTime)}
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <p className={`text-[12px] truncate leading-none transition-colors ${
              room.unread_count > 0 
                ? "text-gray-900 font-black" 
                : "text-gray-400 font-medium"
            }`}>
              {isUser ? "Start a conversation" : (
                <>
                  {senderName && <span className="opacity-80">{senderName}: </span>}
                  {lastMessage || "No messages yet"}
                </>
              )}
            </p>
            
            {room.unread_count > 0 && (
              <span
                className="text-white text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center font-black shadow-lg animate-in zoom-in duration-500 shrink-0 transform scale-90 group-hover:scale-100"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 10px -2px ${primaryColor}88`
                }}
              >
                {room.unread_count > 99 ? "99+" : room.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

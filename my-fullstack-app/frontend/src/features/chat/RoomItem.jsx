import { useContext } from "react";
import { ThemeContext } from "@/context/themeContext";

export default function RoomItem({ room, active, onClick }) {
  const { primaryColor } = useContext(ThemeContext);
  const isUser = room.type === "user";
  const displayName = isUser ? room.full_name : room.room_name || room.name;

  return (
    <div
      onClick={onClick}
      className={`px-3 py-3 cursor-pointer border-b border-gray-100 hover:bg-[#f5f6f6] transition ${
        active ? "bg-[#f0f2f5]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {(displayName || "U").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500 truncate mt-1">
            {isUser ? "Start new chat" : room.last_message || "No messages yet"}
          </p>
        </div>

        {!isUser && room.unread_count > 0 && (
          <span
            className="text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            {room.unread_count}
          </span>
        )}
      </div>
    </div>
  );
}

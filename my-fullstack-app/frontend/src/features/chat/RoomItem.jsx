export default function RoomItem({ room, active, onClick }) {
  const isUser = room.type === "user";
  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${
        active ? "bg-blue-50" : ""
      }`}
    >
      <p className="font-medium text-sm truncate">
        {isUser ? room.full_name : room.room_name || room.name}
      </p>

      <p className="text-xs text-gray-500 truncate mt-1">
        {isUser ? "Start new chat" : room.last_message || "Have no message"}
      </p>

      {!isUser && room.unread_count > 0 && (
        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          {room.unread_count}
        </span>
      )}
    </div>
  );
}

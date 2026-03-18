import React, { useEffect, useMemo, useState } from "react";
import RoomItem from "./RoomItem";
import { UserItem } from "./userItem";
import { useChatRooms } from "@/hooks/chat_hook/useChatRooms";
import { useChatSearch } from "@/hooks/chat_hook/useChatSearch";
import { usePrivateChat } from "@/hooks/chat_hook/usePrivateChat";
import { useChatStore } from "@/stores/chat/chatStore";

export const RoomList = () => {
  const { rooms, loading, selectRoom } = useChatRooms();
  const { keyword, setKeyword, isSearchMode, roomsResult, usersResult } =
    useChatSearch(rooms);
  const { startPrivateChat, loading: privateChatLoading } = usePrivateChat();

  const setCurrentRoom = useChatStore((s) => s.setCurrentRoom);

  const handleClick = (room) => {
    setCurrentRoom(room.room_id);
  };

  return (
    <div className="w-80 h-full border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold"> Chat Rooms</h2>
      </div>

      {/* Search */}
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />

      {/* List */}
      {isSearchMode ? (
        <>
          {roomsResult.map((room) => (
            <RoomItem
              key={room.room_id}
              room={room}
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
              disabled={loading}
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
              onClick={() => {
                handleClick(room);
                setKeyword("");
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

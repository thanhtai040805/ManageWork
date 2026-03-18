import { useEffect } from "react";
import { searchChatRoomsAndUsersAPI } from "@/services/chat-room.service";
import { useChatStore } from "@/stores/chat/chatStore";

export function useChatSearch() {
  const { keyword, setKeyword, searchResults, setSearchResults, rooms } =
    useChatStore();

  const isSearchMode = keyword.trim() !== "";

  useEffect(() => {
    const trimmed = keyword.trim();

    if (!trimmed) {
      setSearchResults(rooms);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchChatRoomsAndUsersAPI({ keyword: trimmed });
        setSearchResults(res || []);
      } catch {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, rooms]);

  const roomsResult = searchResults.filter((i) => i.type === "room");
  const usersResult = searchResults.filter((i) => i.type === "user");

  return {
    keyword,
    setKeyword,
    isSearchMode,
    roomsResult,
    usersResult,
  };
}

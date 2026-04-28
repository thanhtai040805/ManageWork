import { useEffect, useState, useMemo, useContext } from "react";
import { useTypingStore } from "@/stores/chat/typingStore";
import { useChatStore } from "@/stores/chat/chatStore";
import { AuthContext } from "../../context/authContext";
import { ThemeContext } from "@/context/themeContext";

export const TypingIndicator = () => {
  const { auth } = useContext(AuthContext);
  const { primaryColor } = useContext(ThemeContext);
  const currentUserId = auth?.user?.uid;
  const currentRoomId = useChatStore((s) => s.currentRoomId);
  const typingUsersObj = useTypingStore(
    (s) => s.typingUsers[currentRoomId] || {}
  );

  const typingUsers = useMemo(
    () =>
      Object.values(typingUsersObj).filter(
        (u) => u.userId !== currentUserId
      ),
    [typingUsersObj, currentUserId]
  );

  const [visibleUsers, setVisibleUsers] = useState([]);

  useEffect(() => {
    if (typingUsers.length > 0) {
      setVisibleUsers(typingUsers);
    } else {
      const t = setTimeout(() => setVisibleUsers([]), 500);
      return () => clearTimeout(t);
    }
  }, [typingUsers]);

  if (!visibleUsers.length) return null;
  const names = visibleUsers.map((u) => u.name);

  return (
    <div className="px-6 pb-2 relative z-0">
      <div
        className="inline-flex items-center gap-2.5 rounded-2xl px-3 py-1.5 text-[11px] bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-300"
        style={{
          color: "#667781",
        }}
      >
        <div className="flex items-center gap-1">
          <span
            className="h-1 w-1 rounded-full animate-bounce bg-gray-400"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1 w-1 rounded-full animate-bounce bg-gray-400"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1 w-1 rounded-full animate-bounce bg-gray-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="font-bold uppercase tracking-tight opacity-80">
          {names.length === 1
            ? `${names[0]}`
            : names.length === 2
            ? `${names[0]} & ${names[1]}`
            : `${names[0]} and others`}
          <span className="ml-1 font-medium lowercase italic">is typing...</span>
        </span>
      </div>
    </div>
  );
};
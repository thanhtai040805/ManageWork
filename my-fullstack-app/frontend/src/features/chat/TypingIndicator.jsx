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
    <div className="px-4 pb-2">
      <div
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs bg-white border shadow-sm"
        style={{
          borderColor: `${primaryColor}33`,
          color: "#667781",
        }}
      >
        <span className="italic">
          {names.length === 1
            ? `${names[0]} is typing`
            : names.length === 2
            ? `${names[0]} and ${names[1]} are typing`
            : `${names.slice(0, 2).join(", ")} and others are typing`}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: primaryColor, animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: primaryColor, animationDelay: "120ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: primaryColor, animationDelay: "240ms" }}
          />
        </span>
      </div>
    </div>
  );
};
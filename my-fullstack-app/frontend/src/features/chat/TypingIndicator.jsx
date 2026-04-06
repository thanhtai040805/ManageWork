import { useEffect, useState, useMemo , useContext} from "react";
import { useTypingStore } from "@/stores/chat/typingStore";
import { useChatStore } from "@/stores/chat/chatStore";
import { TypingDots } from "./TypingDots";
import { AuthContext } from "../../context/authContext";
export const TypingIndicator = () => {
  const { auth } = useContext(AuthContext);
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
    <p className="text-xs text-gray-400 italic px-4 pb-2 flex items-center gap-1">
      {names.length === 1
        ? `${names[0]} is typing`
        : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : `${names.slice(0, 2).join(", ")} and others are typing`}
      <TypingDots />
    </p>
  );
};
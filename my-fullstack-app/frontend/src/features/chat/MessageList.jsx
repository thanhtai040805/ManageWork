import { useContext, useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { useMessageStore } from "@/stores/chat/messageStore";
import { AuthContext } from "@/context/authContext";

export const MessageList = ({ roomId }) => {
  const { auth } = useContext(AuthContext);
  const currentUserId = auth?.user?.uid;
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const previousRoomRef = useRef(roomId);
  const previousLastMessageIdRef = useRef(null);
  const wasNearBottomRef = useRef(true);

  const messages = useMessageStore(
    (state) => state.messagesByRoom[roomId] || []
  );

  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return true;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < 120;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      wasNearBottomRef.current = isNearBottom();
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [roomId]);


  useEffect(() => {
    const roomChanged = previousRoomRef.current !== roomId;
    const lastMessage = messages[messages.length - 1];
    const currentLastId = lastMessage?.message_id ?? null;
    const lastChanged = previousLastMessageIdRef.current !== currentLastId;
    const senderId =
      lastMessage?.sender_id ?? lastMessage?.senderId ?? lastMessage?.user_id;
    const isOwnLastMessage =
      senderId != null && currentUserId != null
        ? String(senderId) === String(currentUserId)
        : false;

    if (roomChanged) {
      previousRoomRef.current = roomId;
      previousLastMessageIdRef.current = currentLastId;
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      });
      return;
    }

    if (!lastChanged) return;
    previousLastMessageIdRef.current = currentLastId;

    if (wasNearBottomRef.current || isOwnLastMessage) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, roomId, currentUserId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4"
      style={{
        backgroundColor: "#efeae2",
        backgroundImage:
          "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.35) 2px, transparent 0)",
        backgroundSize: "36px 36px",
      }}
    >
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
          No messages yet
        </div>
      )}

      <div className="flex flex-col">
        {messages.map((msg, index) => (
          <MessageItem key={msg.message_id || index} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
import { useContext, useEffect, useRef, useState } from "react";
import { MessageItem } from "./MessageItem";
import { useMessageStore } from "@/stores/chat/messageStore";
import { useChatStore } from "@/stores/chat/chatStore";
import { AuthContext } from "@/context/authContext";
import { formatDateLabel } from "@/utils/formatDateLabel";

export const MessageList = ({ roomId }) => {
  const { auth } = useContext(AuthContext);
  const currentUserId = auth?.user?.uid;
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const previousRoomRef = useRef(roomId);
  const previousLastMessageIdRef = useRef(null);
  const wasNearBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messages = useMessageStore(
    (state) => state.messagesByRoom[roomId] || []
  );

  const roomRole = useChatStore((s) =>
    s.rooms.find((r) => r.room_id === roomId)?.role || 'member'
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
      const near = isNearBottom();
      wasNearBottomRef.current = near;
      setShowScrollBtn(!near);
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

    const shouldScroll = isNearBottom() || isOwnLastMessage;
    if (shouldScroll) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [messages, roomId, currentUserId]);

  return (
    <div className="flex-1 relative flex flex-col min-h-0">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth max-h-[75vh]"
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
          {messages.map((msg, index) => {
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];

            const msgDate = new Date(msg.created_at).toDateString();
            const prevMsgDate = prevMsg ? new Date(prevMsg.created_at).toDateString() : null;
            const showDateSeparator = msgDate !== prevMsgDate;

            const isFirstInGroup = !prevMsg || showDateSeparator ||
              (prevMsg.sender_id !== msg.sender_id) ||
              (new Date(msg.created_at) - new Date(prevMsg.created_at) > 300000); // 5 min gap

            const isLastInGroup = !nextMsg ||
              (new Date(nextMsg.created_at).toDateString() !== msgDate) ||
              (nextMsg.sender_id !== msg.sender_id);

            return (
              <div key={msg.message_id || index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6 sticky top-0 z-10">
                    <span className="px-4 py-1.5 bg-gray-400/20 backdrop-blur-md text-gray-600 text-[11px] font-bold rounded-full shadow-sm border border-white/20">
                      {formatDateLabel(msg.created_at)}
                    </span>
                  </div>
                )}
                <MessageItem
                  message={msg}
                  roomRole={roomRole}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                />
              </div>
            );
          })}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* New Message / Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-6 right-6 bg-white text-gray-600 p-3 rounded-full shadow-xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 animate-in slide-in-from-bottom-4 duration-300 z-20 flex items-center gap-2 group"
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold mr-1">New Messages</span>
          <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};
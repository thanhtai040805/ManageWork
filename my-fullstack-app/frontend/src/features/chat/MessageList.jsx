import { useContext, useEffect, useRef, useState } from "react";
import { MessageItem } from "./MessageItem";
import { useMessageStore } from "@/stores/chat/messageStore";
import { useChatStore } from "@/stores/chat/chatStore";
import { AuthContext } from "@/context/authContext";
import { formatDateLabel } from "@/utils/formatDateLabel";
import { loadMessagesAPI } from "@/services/message.service";
import { Loader2 } from "lucide-react";

export const MessageList = ({ roomId, highlightedMessageId, onClearHighlight }) => {
  const { auth } = useContext(AuthContext);
  const currentUserId = auth?.user?.uid;
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const messageRefs = useRef({});
  const previousRoomRef = useRef(roomId);
  const previousLastMessageIdRef = useRef(null);
  const wasNearBottomRef = useRef(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const prependMessages = useMessageStore((s) => s.prependMessages);

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

    const handleScroll = async () => {
      const near = isNearBottom();
      wasNearBottomRef.current = near;
      setShowScrollBtn(!near);

      // Infinite scroll logic
      if (container.scrollTop < 50 && !isLoadingMore && hasMore) {
        handleLoadMore();
      }
    };

    const handleLoadMore = async () => {
      if (isLoadingMore || !hasMore || messages.length === 0) return;

      setIsLoadingMore(true);
      const firstMsg = messages[0];
      const scrollHeightBefore = container.scrollHeight;

      try {
        const res = await loadMessagesAPI({
          roomId,
          cursorMessageId: firstMsg.message_id,
          cursorCreatedAt: firstMsg.created_at
        });

        if (res.messages && res.messages.length > 0) {
          prependMessages(roomId, res.messages);
          if (res.messages.length < 30) setHasMore(false);

          // Preserve scroll position
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - scrollHeightBefore;
            }
          });
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more messages:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [roomId, messages, isLoadingMore, hasMore]);


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

  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      const element = messageRefs.current[highlightedMessageId];
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add a visual pulse or highlight effect
      element.classList.add("ring-4", "ring-indigo-500/30", "rounded-2xl");

      const timer = setTimeout(() => {
        element.classList.remove("ring-4", "ring-indigo-500/30", "rounded-2xl");
        onClearHighlight();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [highlightedMessageId, messages]);

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
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}
        {!hasMore && messages.length > 0 && (
          <div className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            End of message history
          </div>
        )}
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
              <div
                key={msg.message_id || index}
                ref={el => messageRefs.current[msg.message_id] = el}
                className="transition-all duration-1000"
              >
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
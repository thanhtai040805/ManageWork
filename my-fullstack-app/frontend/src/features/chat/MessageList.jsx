import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { useMessageStore } from "@/stores/chat/messageStore";

export const MessageList = ({ roomId }) => {
  const bottomRef = useRef(null);

  const messages = useMessageStore(
    (state) => state.messagesByRoom[roomId] || []
  );

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
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
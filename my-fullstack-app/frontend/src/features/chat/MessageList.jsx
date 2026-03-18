import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

export const MessageList = ({ messages = [] }) => {
  const bottomRef = useRef(null);

  // auto scroll xuống cuối khi có message mới
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
          <MessageItem key={msg.id || index} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

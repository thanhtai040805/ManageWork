import React, { useState, useRef } from "react";
import { emitTyping, emitSendMessage } from "@/socket/socketEmit";
import { useMessageStore } from "@/stores/chat/messageStore";

export const MessageInput = ({ room }) => {
  const [message, setMessage] = useState("");
  const typingRef = useRef(null);

  const store = useMessageStore();

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!room?.room_id) return;

    if (typingRef.current) return;

    emitTyping(room.room_id);

    typingRef.current = setTimeout(() => {
      typingRef.current = null;
    }, 500);
  };

  const sendMessage = async () => {
    if (!message.trim() || !room?.room_id) return;

    try {
      const savedMessage = await emitSendMessage(room.room_id, message);
      store.addMessage(room.room_id, savedMessage);
      setMessage("");
    } catch (err) {
      console.error("Send message failed:", err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t bg-white px-4 py-3 flex items-center gap-2 shadow-inner">
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
      />

      <button
        onClick={sendMessage}
        className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-5 py-2 rounded-full text-sm font-medium transition"
      >
        Send
      </button>
    </div>
  );
};
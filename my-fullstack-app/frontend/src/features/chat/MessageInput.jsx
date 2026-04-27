import React, { useContext, useState, useRef } from "react";
import { emitTyping, emitSendMessage } from "@/socket/socketEmit";
import { useMessageStore } from "@/stores/chat/messageStore";
import { ThemeContext } from "@/context/themeContext";

export const MessageInput = ({ room }) => {
  const { primaryColor } = useContext(ThemeContext);
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
    <div className="border-t border-gray-200 bg-[#f0f2f5] px-4 py-3 flex items-center gap-2">
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 border border-transparent rounded-lg px-4 py-2.5 text-sm outline-none bg-white transition"
        style={{
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.06)",
        }}
      />

      <button
        onClick={sendMessage}
        className="text-white px-5 py-2.5 rounded-lg text-sm font-medium transition active:scale-[0.98]"
        style={{ backgroundColor: primaryColor }}
      >
        Send
      </button>
    </div>
  );
};
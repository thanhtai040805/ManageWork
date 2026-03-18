import { useState, useRef, useEffect } from "react";
import { useMessageStore } from "@/stores/chat";
import { emitSendMessage } from "@/socket/socketEmit";

export const MessageInput = ({ room }) => {
  const [message, setMessage] = useState("");

  const onMessage = (e) => {
    setMessage(e.target.value);
  };

  const store = useMessageStore();

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const savedMessage = await emitSendMessage(room.room_id, message);
      // update UI ngay lập tức
      store.addMessage(room.room_id, savedMessage);
      setMessage("");
    } catch (err) {
      console.error("Send message failed:", err.message);
    }
  };

  return (
    <div className="border-t bg-white px-4 py-3 flex items-center gap-2 shadow-inner">
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={onMessage}
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

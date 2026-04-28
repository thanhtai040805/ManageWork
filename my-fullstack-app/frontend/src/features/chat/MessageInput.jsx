import React, { useContext, useState, useRef } from "react";
import { emitTyping, emitSendMessage } from "@/socket/socketEmit";
import { useMessageStore } from "@/stores/chat/messageStore";
import { useChatUIStore } from "@/stores/chat/chatUIStore";
import { ThemeContext } from "@/context/themeContext";
import { Image as ImageIcon, Paperclip, Send, Smile, X, Reply } from "lucide-react";

export const MessageInput = ({ room }) => {
  const { primaryColor } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const typingRef = useRef(null);
  const textareaRef = useRef(null);

  const store = useMessageStore();
  const { replyingToMessage, clearReply } = useChatUIStore();

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    adjustHeight();

    if (!room?.room_id) return;
    if (typingRef.current) return;

    emitTyping(room.room_id);
    typingRef.current = setTimeout(() => {
      typingRef.current = null;
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !room?.room_id) return;

    try {
      const savedMessage = await emitSendMessage(room.room_id, message.trim(), replyingToMessage?.message_id || null);
      store.addMessage(room.room_id, savedMessage);
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      clearReply();
    } catch (err) {
      console.error("Send message failed:", err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 bg-transparent relative z-10">
      {/* Floating Container */}
      <div className="bg-white rounded-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1),0_10px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-200/50 overflow-hidden transition-all duration-300 focus-within:shadow-xl focus-within:border-gray-300/50">
        
        {/* Reply Preview Bar */}
        {replyingToMessage && (
          <div className="px-5 py-3 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-3 border-l-4 pl-4 py-1" style={{ borderColor: primaryColor }}>
                <Reply size={16} style={{ color: primaryColor }} />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>Replying to</span>
                   <p className="text-xs text-gray-500 line-clamp-1 italic font-medium">{replyingToMessage.content}</p>
                </div>
             </div>
             <button onClick={clearReply} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 transition-all active:scale-90">
                <X size={16} />
             </button>
          </div>
        )}

        <div className="px-4 py-2 flex items-end gap-2 min-h-[56px]">
          {/* Action Buttons */}
          <div className="flex items-center pb-1">
             <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <Paperclip size={20} />
             </button>
             <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <ImageIcon size={20} />
             </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message..."
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-[14px] resize-none max-h-[150px] scrollbar-hide font-medium placeholder:text-gray-400"
          />

          <div className="flex items-center gap-1 pb-1">
             <button className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all">
                <Smile size={22} />
             </button>
             <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-2.5 rounded-2xl transition-all duration-300 shadow-md transform active:scale-90 ${
                  !message.trim() ? "bg-gray-100 text-gray-300 shadow-none" : "text-white hover:brightness-110 shadow-lg"
                }`}
                style={message.trim() ? { 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px -4px ${primaryColor}aa`
                } : {}}
              >
                <Send size={18} fill={message.trim() ? "currentColor" : "none"} className={message.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-[-10deg]" : ""} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
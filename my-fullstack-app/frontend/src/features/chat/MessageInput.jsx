import React, { useContext, useState, useRef } from "react";
import { emitTyping, emitSendMessage } from "@/socket/socketEmit";
import { useMessageStore } from "@/stores/chat/messageStore";
import { useChatUIStore } from "@/stores/chat/chatUIStore";
import { ThemeContext } from "@/context/themeContext";
import { Image as ImageIcon, Paperclip, Send, Smile, X, Reply, File, Upload } from "lucide-react";
import { uploadFileAPI } from "@/services/file.service";

export const MessageInput = ({ room }) => {
  const { primaryColor } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const typingRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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
    if (!message.trim() && attachments.length === 0) return;

    try {
      // Upload attachments first if any
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        setUploading(true);
        for (const file of attachments) {
          if (file.url) {
            uploadedAttachments.push({
              attachmentUrl: file.url,
              fileType: file.type,
              fileName: file.name
            });
          } else {
            const res = await uploadFileAPI(file);
            uploadedAttachments.push({
              attachmentUrl: res.data?.file_url || res.file_url,
              fileType: file.type.startsWith('image/') ? 'image' : 'file',
              fileName: file.name
            });
          }
        }
        setUploading(false);
      }

      const messageType = uploadedAttachments.some(a => a.fileType === 'image') ? 'image' : 'text';
      
      const savedMessage = await emitSendMessage(
        room.room_id, 
        message.trim(), 
        replyingToMessage?.message_id || null,
        uploadedAttachments,
        messageType
      );
      store.addMessage(room.room_id, savedMessage);
      setMessage("");
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      clearReply();
    } catch (err) {
      setUploading(false);
      console.error("Send message failed:", err.message);
    }
  };

  const handleFileSelect = async (e, isImage = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // For images, create preview URLs
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple
              onChange={(e) => handleFileSelect(e, false)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            />
            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              multiple
              onChange={(e) => handleFileSelect(e, true)}
              accept="image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              title="Send image"
            >
              <ImageIcon size={20} />
            </button>
          </div>

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100">
              {attachments.map((file, idx) => (
                <div key={idx} className="relative group">
                  {file.preview ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <File size={20} className="text-gray-500" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute -bottom-4 left-0 text-[10px] text-gray-500 truncate max-w-[60px]">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          )}

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
              disabled={(!message.trim() && attachments.length === 0) || uploading}
              className={`p-2.5 rounded-2xl transition-all duration-300 shadow-md transform active:scale-90 ${(!message.trim() && attachments.length === 0) || uploading ? "bg-gray-100 text-gray-300 shadow-none" : "text-white hover:brightness-110 shadow-lg"
                }`}
              style={(message.trim() || attachments.length > 0) && !uploading ? {
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px -4px ${primaryColor}aa`
              } : {}}
            >
              {uploading ? (
                <Upload size={18} className="animate-spin" />
              ) : (
                <Send size={18} fill={(message.trim() || attachments.length > 0) ? "currentColor" : "none"} className={(message.trim() || attachments.length > 0) ? "translate-x-0.5 -translate-y-0.5 rotate-[-10deg]" : ""} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
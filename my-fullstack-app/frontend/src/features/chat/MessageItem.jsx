import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "@/context/themeContext";
import { AuthContext } from "@/context/authContext";
import { Pin, Reply, Smile, MoreHorizontal, Edit2, Trash2, X, Check } from "lucide-react";
import { useChatUIStore } from "@/stores/chat/chatUIStore";
import {
  emitToggleReaction,
  emitTogglePinMessage,
  emitEditMessage,
  emitDeleteMessage
} from "@/socket/socketEmit";

const REACTION_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageItem = ({ message, roomRole, isFirstInGroup, isLastInGroup }) => {
  const { primaryColor } = useContext(ThemeContext);
  const { auth } = useContext(AuthContext);
  const setReplyingToMessage = useChatUIStore((s) => s.setReplyingToMessage);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message?.content || "");
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const editInputRef = useRef(null);

  const currentUserId = auth?.user?.uid;
  const senderId = message?.sender_id ?? message?.senderId ?? message?.user_id;
  const senderName = message?.sender_name || message?.full_name || "Unknown";
  const avatarUrl = message?.sender_avatar || message?.avatar_url;
  const isMe = String(senderId) === String(currentUserId);
  const content = message?.content || "";
  const reactions = message?.reactions || [];
  const isPinned = message?.is_pinned || false;
  const isDeleted = message?.is_deleted || false;
  const parentMessage = message?.parent_message;
  const isSystem = message?.message_type === 'system';

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <span className="px-4 py-1 bg-white/40 backdrop-blur-sm text-gray-500 text-[10px] rounded-full uppercase tracking-widest font-bold border border-white/50 shadow-sm">
          {content}
        </span>
      </div>
    );
  }

  const handleToggleReaction = (emoji) => {
    emitToggleReaction({
      messageId: message.message_id,
      roomId: message.room_id,
      reactionType: emoji
    });
    setShowReactionPicker(false);
  };

  const handleTogglePin = () => {
    emitTogglePinMessage({
      messageId: message.message_id,
      roomId: message.room_id,
      isPinned: !isPinned
    });
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || editContent === content) {
      setIsEditing(false);
      return;
    }
    emitEditMessage({
      messageId: message.message_id,
      roomId: message.room_id,
      newContent: editContent
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this message?")) {
      emitDeleteMessage({
        messageId: message.message_id,
        roomId: message.room_id
      });
    }
  };

  if (isDeleted) {
    return (
      <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-1`}>
        <div className={`px-4 py-2 rounded-2xl text-[11px] italic text-gray-400 border border-gray-100 bg-gray-50/50`}>
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-4" : "mb-1"} group animate-in fade-in slide-in-from-bottom-1 duration-300`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar for Others */}
        {!isMe && (
          <div className="w-8 flex-shrink-0">
            {isLastInGroup ? (
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`}
                alt={senderName}
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
              />
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}

        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>

          {/* Sender Name in Group */}
          {!isMe && isFirstInGroup && (
            <span className="text-[11px] font-bold text-gray-500 mb-1 ml-2 uppercase tracking-tight">
              {senderName}
            </span>
          )}

          {/* Reply Preview */}
          {parentMessage && (
            <div className={`text-[11px] text-gray-400 mb-1 flex items-center gap-1.5 px-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <Reply size={12} className="opacity-50" />
              <div className="flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-full border border-black/5 max-w-[200px]">
                <span className="font-bold text-gray-500 truncate">{parentMessage.sender_name}:</span>
                <span className="truncate opacity-80">{parentMessage.content}</span>
              </div>
            </div>
          )}

          <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            <div className="relative group/bubble">
              {/* Reaction Picker Overlay */}
              {showReactionPicker && (
                <div className={`absolute -top-12 ${isMe ? "right-0" : "left-0"} z-50 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-100 rounded-full p-1 flex gap-0.5 animate-in zoom-in-95 duration-200 ring-4 ring-black/5`}>
                  {REACTION_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full transition-transform hover:scale-150 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`relative px-4 py-2.5 rounded-2xl text-[14px] transition-all duration-300 ${isMe
                    ? `text-white ${isLastInGroup ? "rounded-br-none" : ""}`
                    : `bg-white text-gray-800 ${isLastInGroup ? "rounded-bl-none" : ""} border border-gray-200/50 shadow-sm`
                  } ${isPinned ? "ring-2 ring-yellow-400 ring-offset-2" : ""}`}
                style={
                  isMe
                    ? {
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}ee)`,
                      boxShadow: `0 4px 15px -5px ${primaryColor}66`
                    }
                    : {}
                }
              >
                {/* Bubble Tail */}
                {isLastInGroup && (
                  <div className={`absolute bottom-0 w-3 h-3 ${isMe ? "-right-1 bg-[#222]" : "-left-1 bg-white border-l border-b border-gray-200/50"} transform rotate-45 z-0`}
                    style={isMe ? { background: primaryColor } : {}} />
                )}

                {isPinned && (
                  <div className="absolute -top-2.5 -right-1.5 bg-yellow-400 text-white p-1 rounded-full shadow-md border-2 border-white z-20">
                    <Pin size={10} fill="currentColor" />
                  </div>
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-2 min-w-[200px] relative z-10">
                    <textarea
                      ref={editInputRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 p-0 text-[14px] resize-none w-full text-inherit placeholder:text-inherit/50 font-medium"
                      rows={Math.max(1, editContent.split('\n').length)}
                    />
                    <div className="flex justify-end gap-1 border-t border-white/20 pt-2">
                      <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={14} />
                      </button>
                      <button onClick={handleSaveEdit} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col">
                    <p className="break-words whitespace-pre-wrap leading-relaxed font-medium">
                      {content}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 self-end ${isMe ? "text-white/70" : "text-gray-400"}`}>
                      <span className="text-[9px]">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      {isMe && <Check size={10} className="opacity-70" />}
                    </div>
                  </div>
                )}

                {/* Reactions summary */}
                {reactions.length > 0 && (
                  <div className={`absolute -bottom-3 ${isMe ? "right-2" : "left-2"} flex gap-1 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-full px-2 py-0.5 shadow-md scale-100 transition-transform cursor-pointer overflow-hidden z-20 ring-2 ring-black/5`}>
                    <div className="flex -space-x-1">
                      {Array.from(new Set(reactions.map(r => r.reaction_type))).slice(0, 3).map((emoji, idx) => (
                        <span key={idx} className="text-xs drop-shadow-sm">{emoji}</span>
                      ))}
                    </div>
                    <span className="text-[9px] text-gray-500 font-black ml-1">{reactions.length}</span>
                  </div>
                )}
              </div>
            </div>

            <MessageActions
              onReply={() => setReplyingToMessage(message)}
              onReact={() => setShowReactionPicker(!showReactionPicker)}
              onPin={roomRole === 'admin' ? handleTogglePin : null}
              onEdit={isMe ? () => { setIsEditing(true); setEditContent(content); } : null}
              onDelete={isMe ? handleDelete : null}
              isPinned={isPinned}
              isMe={isMe}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageActions = ({ onReply, onReact, onPin, onEdit, onDelete, isPinned, isMe }) => (
  <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform ${isMe ? "flex-row-reverse translate-x-1" : "-translate-x-1"}`}>
    <ActionButton onClick={onReply} icon={<Reply size={14} />} title="Reply" />
    <ActionButton onClick={onReact} icon={<Smile size={14} />} title="React" />
    {onPin && <ActionButton onClick={onPin} icon={<Pin size={14} fill={isPinned ? "currentColor" : "none"} />} title={isPinned ? "Unpin" : "Pin"} active={isPinned} />}
    {onEdit && <ActionButton onClick={onEdit} icon={<Edit2 size={14} />} title="Edit" />}
    {onDelete && <ActionButton onClick={onDelete} icon={<Trash2 size={14} />} title="Delete" danger />}
  </div>
);

const ActionButton = ({ onClick, icon, title, active, danger }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 ${active ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-gray-600"
      } ${danger ? "hover:text-red-500 hover:bg-red-50" : ""}`}
  >
    {icon}
  </button>
);

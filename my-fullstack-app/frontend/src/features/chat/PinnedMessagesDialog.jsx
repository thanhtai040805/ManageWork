import React, { useEffect, useState } from "react";
import { getPinnedMessagesAPI } from "@/services/chat-room.service";
import { Pin, X } from "lucide-react";

export const PinnedMessagesDialog = ({ roomId, isOpen, onClose, onJump, primaryColor }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && roomId) {
      fetchPinned();
    }
  }, [isOpen, roomId]);

  const fetchPinned = async () => {
    setLoading(true);
    try {
      const res = await getPinnedMessagesAPI(roomId);
      setPinnedMessages(res.messages || []);
    } catch (err) {
      console.error("Failed to fetch pinned messages:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500 shadow-sm border border-yellow-100">
              <Pin size={20} fill="currentColor" className="rotate-12" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 tracking-tight leading-none">Pinned Messages</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Important updates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center">
               <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
               <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Searching records...</p>
            </div>
          ) : pinnedMessages.length === 0 ? (
            <div className="py-20 text-center px-10">
              <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <Pin size={32} />
              </div>
              <p className="text-sm text-gray-400 font-medium italic">No pinned messages found in this conversation.</p>
            </div>
          ) : (
            pinnedMessages.map((msg) => (
              <div key={msg.message_id} className="bg-white p-5 rounded-3xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                      {msg.sender_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight">
                      {msg.sender_name || 'User'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed font-medium">{msg.content}</p>
                <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                    <button 
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                      onClick={() => onJump(msg.message_id)}
                    >
                      Jump to message
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

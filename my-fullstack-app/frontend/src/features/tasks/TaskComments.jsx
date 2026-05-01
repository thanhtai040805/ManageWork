import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Trash2, Loader2 } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/v1/api";

export const TaskComments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments/task/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setComments(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/comments/create`, 
        { taskId, content: newComment },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      setComments([res?.data?.data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setComments(comments.filter(c => c.comment_id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="flex justify-center p-4 md:p-8"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} md:size={18} className="text-slate-500" />
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Activity & Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          className="w-full bg-white border border-slate-200 rounded-xl p-2 md:p-3 pb-10 md:pb-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[80px] md:min-h-[100px]"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Cmd+Enter</span>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="bg-indigo-600 text-white px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2"
          >
            {isSubmitting ? <Loader2 size={14} md:size={16} className="animate-spin" /> : <Send size={14} md:size={16} />}
            <span className="hidden md:inline">Post</span>
          </button>
        </div>
      </form>

      {/* Comments List - with max height for scrolling */}
      <div className="max-h-[300px] md:max-h-[400px] lg:max-h-[500px] overflow-y-auto custom-scrollbar space-y-3 md:space-y-4 pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-6 md:py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs md:text-sm text-slate-400">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.comment_id} className="group flex gap-2 md:gap-3">
              <div className="flex-shrink-0 w-7 md:w-8 h-7 md:h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={14} md:size={16} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-xs md:text-sm font-semibold text-slate-900">{comment.user_name}</span>
                    <span className="text-[10px] md:text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(comment.comment_id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                  >
                    <Trash2 size={12} md:size={14} />
                  </button>
                </div>
                <div className="text-xs md:text-sm text-slate-700 bg-white border border-slate-100 rounded-lg px-2 md:px-3 py-1.5 md:py-2 shadow-sm">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

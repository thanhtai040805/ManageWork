import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "@/context/themeContext";
import { useChannelStore } from "@/stores/chat/channelStore";
import { channelPostAPI } from "@/services/channelPost.service";
import { Send, Pin, MessageCircle, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import useChannelSocket from "@/hooks/useChannelSocket";

export function ChannelView({ channelId, channelName }) {
  const { primaryColor } = useContext(ThemeContext);
  const storePosts = useChannelStore(state => state.posts);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newPost, setNewPost] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [expandedRepliesData, setExpandedRepliesData] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  const { setPosts } = useChannelStore();

  useChannelSocket(channelId);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (channelId) {
      loadPosts();
    }
  }, [channelId]);

  const handleReplyInputChange = (postId, value) => {
    setReplyInputs(prev => ({ ...prev, [postId]: value }));
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await channelPostAPI.getPostsByChannel(channelId);
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !channelId) return;

    try {
      const post = await channelPostAPI.createPost({
        channel_id: channelId,
        content: newPost.trim(),
      });
      setNewPost("");
      useChannelStore.getState().addPost({ ...post, channel_id: channelId });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCreateReply = async (postId) => {
    const content = replyInputs[postId];
    if (!content?.trim()) return;
    try {
      const reply = await channelPostAPI.createReply({
        post_id: postId,
        content: content.trim(),
      });
      setReplyInputs(prev => ({ ...prev, [postId]: "" }));
      useChannelStore.getState().addReplyToPost(postId, { ...reply, channel_id: channelId });
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const loadRepliesForPost = async (postId) => {
    try {
      const data = await channelPostAPI.getReplies(postId);
      useChannelStore.setState(state => ({
        posts: state.posts.map(p =>
          p.post_id === postId
            ? {
              ...p,
              replies: data || [],
              reply_count: data?.length || 0
            }
            : p
        )
      }));
    } catch (error) {
      console.error("Error loading replies:", error);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    if (!expandedRepliesData[post.post_id]) {
      loadRepliesForPost(post.post_id, false);
    }
  };

  const toggleRepliesExpand = (postId) => {
    const isExpanded = !expandedReplies[postId];
    setExpandedReplies(prev => ({
      ...prev,
      [postId]: isExpanded
    }));
    if (isExpanded) {
      loadRepliesForPost(postId);
    }
  };

  const handlePinPost = async (postId, isPinned) => {
    try {
      await channelPostAPI.togglePinPost(postId, !isPinned);
      loadPosts();
    } catch (error) {
      console.error("Error pinning post:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await channelPostAPI.deletePost(postId);
      loadPosts();
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleDeleteReply = async (replyId, postId) => {
    if (!confirm("Delete this reply?")) return;
    try {
      await channelPostAPI.deleteReply(replyId);
      loadRepliesForPost(postId);
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const getPostReplies = (post) => {
    const storePost = storePosts.find(p => p.post_id === post.post_id);
    return storePost?.replies || [];
  };

  return (
    <div key={refreshKey} className="flex h-full w-full overflow-y-auto">
      <div className="flex-1 flex flex-col border-r border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900"># {channelName || "Channel"}</h2>
          <p className="text-sm text-gray-500">Posts & Threads</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[75vh]">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading posts...</div>
          ) : storePosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            storePosts.map((post) => (
              <div key={post.post_id}>
                <div
                  onClick={() => handlePostClick(post)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPost?.post_id === post.post_id
                    ? "border-gray-300 bg-gray-50"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && <Pin size={14} className="text-amber-500 fill-amber-500" />}
                      <span className="font-bold text-sm text-gray-900">{post.author_name}</span>
                      <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    {currentUser?.uid === post.author_id && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePinPost(post.post_id, post.is_pinned); }}
                          className="text-gray-400 hover:text-amber-500 p-1"
                        >
                          <Pin size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePost(post.post_id); }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleRepliesExpand(post.post_id); }}
                      className="flex items-center gap-1 hover:text-gray-600"
                    >
                      <MessageCircle size={14} />
                      <span>{post.reply_count} replies</span>
                      {expandedReplies[post.post_id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {expandedReplies[post.post_id] && (
                  <div className="ml-4 mt-2 space-y-2">
                    {(getPostReplies(post) || []).map((reply) => (
                      <div key={reply.reply_id} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{reply.author_name}</span>
                          {currentUser?.uid === reply.author_id && (
                            <button
                              onClick={() => handleDeleteReply(reply.reply_id, post.post_id)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(reply.created_at).toLocaleString()}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        value={replyInputs[post.post_id] || ""}
                        onChange={(e) => handleReplyInputChange(post.post_id, e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateReply(post.post_id)}
                      />
                      <button
                        onClick={() => handleCreateReply(post.post_id)}
                        className="px-3 py-2 rounded-lg text-white text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCreatePost} className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Create a post..."
                className="w-full h-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                rows={2}
              />
            </div>
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="px-4 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {selectedPost && (
        <div className="w-[400px] flex flex-col bg-gray-50">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Thread</h3>
            <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[80vh] p-4 space-y-4">
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{selectedPost.author_name}</span>
                {currentUser?.uid === selectedPost.author_id && (
                  <div className="flex gap-1">
                    <button onClick={() => handlePinPost(selectedPost.post_id, selectedPost.is_pinned)} className="text-gray-400 hover:text-amber-500">
                      <Pin size={14} />
                    </button>
                    <button onClick={() => handleDeletePost(selectedPost.post_id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700">{selectedPost.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(selectedPost.created_at).toLocaleString()}</p>
            </div>

            {(getPostReplies(selectedPost) || []).map((reply) => (
              <div key={reply.reply_id} className="p-3 bg-white rounded-lg border ml-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{reply.author_name}</span>
                  {currentUser?.uid === reply.author_id && (
                    <button onClick={() => handleDeleteReply(reply.reply_id, selectedPost.post_id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700">{reply.content}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(reply.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                value={replyInputs[selectedPost.post_id] || ""}
                onChange={(e) => handleReplyInputChange(selectedPost.post_id, e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateReply(selectedPost.post_id)}
              />
              <button
                onClick={() => handleCreateReply(selectedPost.post_id)}
                className="px-3 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChannelView;
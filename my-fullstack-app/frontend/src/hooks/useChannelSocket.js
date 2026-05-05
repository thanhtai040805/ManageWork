import { useEffect, useCallback } from "react";
import { registerSocketEvents } from "../socket/socketEvents";
import { useChannelStore } from "../stores/chat/channelStore";
import socket from "../socket/socket";

const useChannelSocket = (channelId) => {
  const addPost = useChannelStore(state => state.addPost);
  const addReplyToPost = useChannelStore(state => state.addReplyToPost);

  useEffect(() => {
    if (!channelId) return () => {};

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("channel:join", { channelId });

    const onChannelPostNew = (post) => {
      if (post.channel_id === channelId) {
        addPost(post);
      }
    };

    const onChannelReplyNew = (reply) => {
      if (reply.channel_id === channelId) {
        const post = useChannelStore.getState().posts.find(p => p.post_id === reply.post_id);
        const existingReplies = post?.replies || [];
        const alreadyHasReply = existingReplies.some(r => r.reply_id === reply.reply_id);
        if (!alreadyHasReply) {
          addReplyToPost(reply.post_id, reply);
        }
      }
    };

    const cleanup = registerSocketEvents({
      onChannelPostNew,
      onChannelReplyNew,
    });

    return () => {
      socket.emit("channel:leave", { channelId });
      cleanup();
    };
  }, [channelId, addPost, addReplyToPost]);
};

export default useChannelSocket;
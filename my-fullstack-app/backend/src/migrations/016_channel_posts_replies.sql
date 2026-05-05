-- Channel Posts and Replies (Thread system for channels)
BEGIN;

-- Channel Posts (like threads)
CREATE TABLE IF NOT EXISTS channel_posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channel_posts_channel ON channel_posts(channel_id);
CREATE INDEX idx_channel_posts_author ON channel_posts(author_id);
CREATE INDEX idx_channel_posts_pinned ON channel_posts(channel_id, is_pinned) WHERE is_pinned = true;

-- Channel Replies (responses to posts)
CREATE TABLE IF NOT EXISTS channel_replies (
  reply_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES channel_posts(post_id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channel_replies_post ON channel_replies(post_id);
CREATE INDEX idx_channel_replies_author ON channel_replies(author_id);

COMMIT;
BEGIN;

-- User mute settings (mute notifications from specific users)
DROP TABLE IF EXISTS user_mutes CASCADE;

CREATE TABLE user_mutes (
  mute_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  muted_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, muted_user_id)
);

CREATE INDEX idx_user_mutes_user ON user_mutes(user_id);

-- User block settings (block users from contacting)
DROP TABLE IF EXISTS user_blocks CASCADE;

CREATE TABLE user_blocks (
  block_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE INDEX idx_user_blocks_user ON user_blocks(user_id);

COMMIT;
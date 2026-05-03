BEGIN;

-- Channel Categories (folders to organize channels)
DROP TABLE IF EXISTS channel_categories CASCADE;

CREATE TABLE channel_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channel_categories_project ON channel_categories(project_id);

-- Channels
DROP TABLE IF EXISTS channels CASCADE;

CREATE TABLE channels (
  channel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category_id UUID REFERENCES channel_categories(category_id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  description TEXT,
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channels_project ON channels(project_id);
CREATE INDEX idx_channels_category ON channels(category_id);

-- Channel Members (for private channels)
DROP TABLE IF EXISTS channel_members CASCADE;

CREATE TABLE channel_members (
  channel_id UUID REFERENCES channels(channel_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX idx_channel_members_user ON channel_members(user_id);

-- Add channel_id to existing chat_rooms for integration
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES channels(channel_id) ON DELETE SET NULL;

-- Add project_id to chat_rooms (some group chats may be project-related)
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL;

COMMIT;
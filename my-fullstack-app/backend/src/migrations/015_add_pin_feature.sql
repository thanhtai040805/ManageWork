-- Add pin feature to messages and chat_rooms
BEGIN;

-- Add is_pinned to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES users(user_id);

-- Add is_pinned to chat_rooms (for DMs/Groups)
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;

-- Add is_pinned to channels
ALTER TABLE channels ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES users(user_id);

-- Create index for pinned messages
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(room_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_chat_rooms_pinned ON chat_rooms(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_channels_pinned ON channels(project_id, is_pinned) WHERE is_pinned = true;

COMMIT;
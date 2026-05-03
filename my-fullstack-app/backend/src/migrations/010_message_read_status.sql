BEGIN;

-- Add read status to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Create table for message read receipts (who read which message)
DROP TABLE IF EXISTS message_reads CASCADE;

CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(message_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  read_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX idx_message_reads_user ON message_reads(user_id);
CREATE INDEX idx_message_reads_message ON message_reads(message_id);

-- Add last_read_at to chat_room_members for room-level read status
ALTER TABLE chat_room_members ADD COLUMN IF NOT EXISTS last_read_message_id UUID;
ALTER TABLE chat_room_members ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP;

COMMIT;
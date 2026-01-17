ALTER TABLE chat_rooms
ADD COLUMN created_by UUID,
ADD COLUMN last_message_at TIMESTAMP;

CREATE INDEX idx_chat_rooms_last_message
ON chat_rooms (last_message_at DESC);



ALTER TABLE chat_room_members
ADD COLUMN last_read_message_id UUID,
ADD COLUMN last_read_at TIMESTAMP,
ADD COLUMN role TEXT DEFAULT 'member';
ADD COLUMN unread_count INT DEFAULT 0;

CREATE INDEX idx_chat_room_members_user
ON chat_room_members (user_id);


ALTER TABLE messages
ADD COLUMN edited_at TIMESTAMP,
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_messages_room_created
ON messages (room_id, created_at DESC);



CREATE TABLE message_attachments (
  attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'file', 'video')),
  url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_message
    FOREIGN KEY (message_id)
    REFERENCES messages(message_id)
    ON DELETE CASCADE
);


CREATE TABLE message_reads (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),

  PRIMARY KEY (message_id, user_id),

  CONSTRAINT fk_message_read
    FOREIGN KEY (message_id)
    REFERENCES messages(message_id)
    ON DELETE CASCADE
);

-- members
CREATE INDEX idx_chat_room_members_user_room
ON chat_room_members (user_id, room_id);

CREATE INDEX idx_chat_room_members_room
ON chat_room_members (room_id);

-- messages (cursor-based)
CREATE INDEX idx_messages_room_cursor
ON messages (room_id, created_at DESC, message_id DESC);

-- attachments
CREATE INDEX idx_message_attachments_message
ON message_attachments (message_id);

-- reads
CREATE INDEX idx_message_reads_user
ON message_reads (user_id);
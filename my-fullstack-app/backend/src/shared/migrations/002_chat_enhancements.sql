BEGIN;

-- Add columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL;

-- Add columns to chat_rooms table
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS description TEXT;

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    reaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);

COMMIT;

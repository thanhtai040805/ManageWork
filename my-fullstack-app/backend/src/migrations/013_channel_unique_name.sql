-- Add unique constraint on channel name per project
-- Delete duplicates keeping the oldest
DELETE FROM channels 
WHERE EXISTS (
  SELECT 1 FROM channels c2 
  WHERE c2.project_id = channels.project_id 
    AND LOWER(c2.name) = LOWER(channels.name)
    AND c2.created_at < channels.created_at
);

-- Add unique constraint
CREATE UNIQUE INDEX idx_channel_name_project ON channels(LOWER(name), project_id) 
WHERE name IS NOT NULL AND project_id IS NOT NULL;
-- Migration: Add Cloudinary columns to files table
-- This adds support for cloud storage with Cloudinary

BEGIN;

-- Add new columns for Cloudinary integration
ALTER TABLE files ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(500);
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);
ALTER TABLE files ADD COLUMN IF NOT EXISTS context_type VARCHAR(50) DEFAULT 'task';
ALTER TABLE files ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL;

-- Create index for new columns
CREATE INDEX IF NOT EXISTS idx_files_context_type ON files(context_type);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_cloudinary_public_id ON files(cloudinary_public_id);

COMMIT;
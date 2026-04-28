BEGIN;

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop in dependency order to allow re-running safely
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_room_members CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS recurring_tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============
-- Core
-- ==============
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  theme_color TEXT NOT NULL DEFAULT '#f87171',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Join table for project members
CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

CREATE TABLE recurring_tasks (
  recurring_task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  repeat_type TEXT NOT NULL,
  repeat_days INTEGER[] NOT NULL DEFAULT '{}'::integer[],
  created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_tasks_created_by ON recurring_tasks(created_by);
CREATE INDEX idx_recurring_tasks_project_id ON recurring_tasks(project_id);
CREATE INDEX idx_recurring_tasks_is_active ON recurring_tasks(is_active);

CREATE TABLE tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(project_id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  order_index INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL,
  recurring_task_id UUID REFERENCES recurring_tasks(recurring_task_id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_recurring_task_id ON tasks(recurring_task_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE TABLE subtasks (
  subtask_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  title TEXT,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);

CREATE TABLE comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE TABLE tags (
  tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  color TEXT
);

CREATE INDEX idx_tags_name ON tags(name);

CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- ==============
-- Calendar/Event
-- ==============
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  location TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_time ON events(start_time);

CREATE TABLE reminders (
  reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  remind_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_event_id ON reminders(event_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);

-- ==============
-- Activity / Notifications / Files
-- ==============
CREATE TABLE activity_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(task_id) ON DELETE SET NULL,
  action TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Chat
CREATE TABLE chat_rooms (
  room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN,
  created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  last_message_at TIMESTAMP,
  last_message_id UUID
);

CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);

CREATE TABLE chat_room_members (
  room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_read_message_id UUID,
  last_read_at TIMESTAMP,
  unread_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_chat_room_members_user_id ON chat_room_members(user_id);
CREATE INDEX idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX idx_chat_room_members_user_room ON chat_room_members(user_id, room_id);

CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC, message_id DESC);

CREATE TABLE message_attachments (
  attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE,
  attachment_url TEXT NOT NULL,
  attachment_type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- File attachments for tasks or messages
CREATE TABLE files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(task_id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_task_id ON files(task_id);
CREATE INDEX idx_files_message_id ON files(message_id);

-- Minimal table for team activity stats (only referenced by user/activity queries)
CREATE TABLE team_members (
  team_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);

COMMIT;


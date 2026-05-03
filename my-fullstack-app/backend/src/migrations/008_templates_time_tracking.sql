BEGIN;

-- Project Templates
DROP TABLE IF EXISTS project_templates CASCADE;
DROP TABLE IF EXISTS task_templates CASCADE;

CREATE TABLE project_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE task_templates (
  task_template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES project_templates(template_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo'
);

-- Time Tracking
DROP TABLE IF EXISTS time_entries CASCADE;

CREATE TABLE time_entries (
  entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);

COMMIT;
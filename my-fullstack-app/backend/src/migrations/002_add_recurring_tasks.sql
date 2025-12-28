-- Migration: Add recurring_tasks table and update tasks table
-- This implements the ClickUp-style recurring task pattern

-- 1. Create recurring_tasks table (RecurringTask template/rule)
CREATE TABLE IF NOT EXISTS recurring_tasks (
  recurring_task_id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  repeat_type VARCHAR(20) NOT NULL, -- 'weekly', 'custom'
  repeat_days INTEGER[], -- [0,1,2,3,4,5,6] for custom (0=Sun, 6=Sat)
  created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add recurring_task_id to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS recurring_task_id INTEGER REFERENCES recurring_tasks(recurring_task_id) ON DELETE SET NULL;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_task_id ON tasks(recurring_task_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_created_by ON recurring_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_project_id ON recurring_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_is_active ON recurring_tasks(is_active);

-- 4. Add comments for documentation
COMMENT ON TABLE recurring_tasks IS 'Template/rule for recurring tasks (similar to ClickUp RecurringTask pattern)';
COMMENT ON COLUMN tasks.recurring_task_id IS 'Reference to recurring_tasks table if this task is part of a recurring series';


BEGIN;

CREATE TABLE IF NOT EXISTS task_dependencies (
  dependency_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'blocking',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on_task_id ON task_dependencies(depends_on_task_id);
CREATE UNIQUE INDEX idx_task_dependencies_unique ON task_dependencies(task_id, depends_on_task_id);

COMMIT;
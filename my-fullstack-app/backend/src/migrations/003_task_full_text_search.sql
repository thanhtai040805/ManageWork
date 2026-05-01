BEGIN;

-- Add search_vector column to tasks table
ALTER TABLE tasks ADD COLUMN search_vector tsvector;

-- Create a GIN index on search_vector
CREATE INDEX idx_tasks_search_vector ON tasks USING gin(search_vector);

-- Function to update search_vector
CREATE OR REPLACE FUNCTION tasks_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search_vector on INSERT or UPDATE
DROP TRIGGER IF EXISTS trg_tasks_search_vector_update ON tasks;
CREATE TRIGGER trg_tasks_search_vector_update
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION tasks_search_vector_trigger();

-- Backfill search_vector for existing tasks
UPDATE tasks SET search_vector = 
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B');

COMMIT;

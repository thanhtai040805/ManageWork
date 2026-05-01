-- Make project_id nullable in recurring_tasks for tasks without project

BEGIN;

ALTER TABLE recurring_tasks 
ALTER COLUMN project_id DROP NOT NULL;

COMMIT;
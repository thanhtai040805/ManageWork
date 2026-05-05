-- Seed Data Migration: 20 Users with comprehensive test data
-- Run after all schema migrations
-- Password for all users: Password123@

BEGIN;

-- Clear existing test users first (if re-running)
DELETE FROM users WHERE username LIKE 'user%';
DELETE FROM projects WHERE name IS NOT NULL;
DELETE FROM tasks WHERE task_id IS NOT NULL;
DELETE FROM tags WHERE tag_id IS NOT NULL;
DELETE FROM subtasks WHERE subtask_id IS NOT NULL;
DELETE FROM comments WHERE comment_id IS NOT NULL;
DELETE FROM activity_logs WHERE log_id IS NOT NULL;
DELETE FROM chat_rooms WHERE room_id IS NOT NULL;
DELETE FROM messages WHERE message_id IS NOT NULL;
DELETE FROM notifications WHERE notification_id IS NOT NULL;
DELETE FROM events WHERE event_id IS NOT NULL;
DELETE FROM channels WHERE channel_id IS NOT NULL;

-- ============================================
-- USERS (User1 - User20)
-- ============================================
INSERT INTO users (user_id, username, email, password_hash, full_name, avatar_url, role, theme_color, created_at, updated_at) VALUES
(gen_random_uuid(), 'user1', 'user1@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User One', NULL, 'admin', '#f87171', NOW(), NOW()),
(gen_random_uuid(), 'user2', 'user2@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Two', NULL, 'member', '#60a5fa', NOW(), NOW()),
(gen_random_uuid(), 'user3', 'user3@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Three', NULL, 'member', '#34d399', NOW(), NOW()),
(gen_random_uuid(), 'user4', 'user4@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Four', NULL, 'member', '#a78bfa', NOW(), NOW()),
(gen_random_uuid(), 'user5', 'user5@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Five', NULL, 'member', '#fbbf24', NOW(), NOW()),
(gen_random_uuid(), 'user6', 'user6@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Six', NULL, 'member', '#f472b6', NOW(), NOW()),
(gen_random_uuid(), 'user7', 'user7@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Seven', NULL, 'member', '#22d3d8', NOW(), NOW()),
(gen_random_uuid(), 'user8', 'user8@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Eight', NULL, 'member', '#a3e635', NOW(), NOW()),
(gen_random_uuid(), 'user9', 'user9@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Nine', NULL, 'member', '#c084fc', NOW(), NOW()),
(gen_random_uuid(), 'user10', 'user10@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Ten', NULL, 'member', '#fb923c', NOW(), NOW()),
(gen_random_uuid(), 'user11', 'user11@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Eleven', NULL, 'member', '#818cf8', NOW(), NOW()),
(gen_random_uuid(), 'user12', 'user12@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Twelve', NULL, 'member', '#2dd4bf', NOW(), NOW()),
(gen_random_uuid(), 'user13', 'user13@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Thirteen', NULL, 'member', '#facc15', NOW(), NOW()),
(gen_random_uuid(), 'user14', 'user14@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Fourteen', NULL, 'member', '#e879f9', NOW(), NOW()),
(gen_random_uuid(), 'user15', 'user15@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Fifteen', NULL, 'member', '#38bdf8', NOW(), NOW()),
(gen_random_uuid(), 'user16', 'user16@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Sixteen', NULL, 'member', '#4ade80', NOW(), NOW()),
(gen_random_uuid(), 'user17', 'user17@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Seventeen', NULL, 'member', '#f87171', NOW(), NOW()),
(gen_random_uuid(), 'user18', 'user18@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Eighteen', NULL, 'member', '#fb7185', NOW(), NOW()),
(gen_random_uuid(), 'user19', 'user19@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Nineteen', NULL, 'member', '#a5f3fc', NOW(), NOW()),
(gen_random_uuid(), 'user20', 'user20@test.com', '$2b$10$z7nAndn5afLknwacJKNUh.6nm0OuYkhQAA6JL3rG0RK7alIUIe2Wq', 'User Twenty', NULL, 'member', '#dcfce7', NOW(), NOW());

-- ============================================
-- PROJECTS (10 projects)
-- ============================================
INSERT INTO projects (project_id, name, description, owner_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'Website Redesign', 'Complete redesign of company website with new branding', (SELECT user_id FROM users WHERE username = 'user1'), NOW(), NOW()),
(gen_random_uuid(), 'Mobile App', 'Build cross-platform mobile application', (SELECT user_id FROM users WHERE username = 'user2'), NOW(), NOW()),
(gen_random_uuid(), 'Marketing Campaign', 'Q2 marketing and social media campaign', (SELECT user_id FROM users WHERE username = 'user3'), NOW(), NOW()),
(gen_random_uuid(), 'Internal Tools', 'Build internal tools for team productivity', (SELECT user_id FROM users WHERE username = 'user1'), NOW(), NOW()),
(gen_random_uuid(), 'Data Analysis', 'Analyze customer data and create reports', (SELECT user_id FROM users WHERE username = 'user4'), NOW(), NOW()),
(gen_random_uuid(), 'Customer Portal', 'New customer self-service portal', (SELECT user_id FROM users WHERE username = 'user2'), NOW(), NOW()),
(gen_random_uuid(), 'API Integration', 'Integrate third-party APIs', (SELECT user_id FROM users WHERE username = 'user5'), NOW(), NOW()),
(gen_random_uuid(), 'Security Audit', 'Comprehensive security review', (SELECT user_id FROM users WHERE username = 'user6'), NOW(), NOW()),
(gen_random_uuid(), 'Documentation', 'Technical documentation updates', (SELECT user_id FROM users WHERE username = 'user3'), NOW(), NOW()),
(gen_random_uuid(), 'Training Program', 'Employee training and onboarding', (SELECT user_id FROM users WHERE username = 'user7'), NOW(), NOW());

-- ============================================
-- PROJECT MEMBERS
-- ============================================
INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), (SELECT user_id FROM users WHERE username = 'user2'), 'member', NOW()),
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), (SELECT user_id FROM users WHERE username = 'user3'), 'admin', NOW()),
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), (SELECT user_id FROM users WHERE username = 'user4'), 'viewer', NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), (SELECT user_id FROM users WHERE username = 'user1'), 'member', NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), (SELECT user_id FROM users WHERE username = 'user5'), 'admin', NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), (SELECT user_id FROM users WHERE username = 'user6'), 'member', NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), (SELECT user_id FROM users WHERE username = 'user7'), 'member', NOW()),
((SELECT project_id FROM projects WHERE name = 'Internal Tools'), (SELECT user_id FROM users WHERE username = 'user9'), 'admin', NOW()),
((SELECT project_id FROM projects WHERE name = 'Internal Tools'), (SELECT user_id FROM users WHERE username = 'user10'), 'member', NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), (SELECT user_id FROM users WHERE username = 'user11'), 'admin', NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), (SELECT user_id FROM users WHERE username = 'user12'), 'member', NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), (SELECT user_id FROM users WHERE username = 'user13'), 'member', NOW());

-- ============================================
-- TASKS (31 tasks)
-- ============================================
INSERT INTO tasks (project_id, title, description, status, priority, start_date, due_date, order_index, created_by, assigned_to, created_at, updated_at) VALUES
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), 'Design homepage mockup', 'Create initial design for new homepage', 'done', 'high', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', 0, (SELECT user_id FROM users WHERE username = 'user1'), (SELECT user_id FROM users WHERE username = 'user2'), NOW() - INTERVAL '10 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), 'Implement responsive header', 'Build responsive navigation header', 'in_progress', 'high', NOW() - INTERVAL '5 days', NOW() + INTERVAL '3 days', 1, (SELECT user_id FROM users WHERE username = 'user1'), (SELECT user_id FROM users WHERE username = 'user2'), NOW() - INTERVAL '5 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), 'Create contact form', 'Design and implement contact form', 'todo', 'medium', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days', 2, (SELECT user_id FROM users WHERE username = 'user1'), (SELECT user_id FROM users WHERE username = 'user3'), NOW() - INTERVAL '3 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), 'SEO optimization', 'Implement SEO best practices', 'todo', 'low', NOW(), NOW() + INTERVAL '14 days', 3, (SELECT user_id FROM users WHERE username = 'user1'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Website Redesign'), 'Mobile responsive design', 'Ensure all pages work on mobile', 'in_progress', 'high', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 4, (SELECT user_id FROM users WHERE username = 'user3'), (SELECT user_id FROM users WHERE username = 'user4'), NOW() - INTERVAL '2 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), 'Setup React Native project', 'Initialize new React Native project', 'done', 'high', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', 0, (SELECT user_id FROM users WHERE username = 'user2'), (SELECT user_id FROM users WHERE username = 'user1'), NOW() - INTERVAL '15 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), 'Implement authentication', 'Build login and registration screens', 'done', 'high', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', 1, (SELECT user_id FROM users WHERE username = 'user2'), (SELECT user_id FROM users WHERE username = 'user1'), NOW() - INTERVAL '10 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), 'Create dashboard screen', 'Build main dashboard UI', 'in_progress', 'medium', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', 2, (SELECT user_id FROM users WHERE username = 'user2'), (SELECT user_id FROM users WHERE username = 'user5'), NOW() - INTERVAL '5 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), 'Push notifications setup', 'Implement push notification system', 'todo', 'medium', NOW(), NOW() + INTERVAL '10 days', 3, (SELECT user_id FROM users WHERE username = 'user2'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Mobile App'), 'Offline mode', 'Implement offline data sync', 'todo', 'low', NOW() + INTERVAL '3 days', NOW() + INTERVAL '21 days', 4, (SELECT user_id FROM users WHERE username = 'user2'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), 'Define target audience', 'Identify and document target customer segments', 'done', 'high', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days', 0, (SELECT user_id FROM users WHERE username = 'user3'), (SELECT user_id FROM users WHERE username = 'user6'), NOW() - INTERVAL '20 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), 'Create social media content', 'Plan content calendar for all platforms', 'in_progress', 'high', NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 days', 1, (SELECT user_id FROM users WHERE username = 'user3'), (SELECT user_id FROM users WHERE username = 'user7'), NOW() - INTERVAL '10 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), 'Design email templates', 'Create email marketing templates', 'in_progress', 'medium', NOW() - INTERVAL '7 days', NOW() + INTERVAL '3 days', 2, (SELECT user_id FROM users WHERE username = 'user3'), (SELECT user_id FROM users WHERE username = 'user8'), NOW() - INTERVAL '7 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), 'Analytics setup', 'Configure tracking and analytics', 'todo', 'medium', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', 3, (SELECT user_id FROM users WHERE username = 'user3'), NULL, NOW() - INTERVAL '5 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), 'Launch campaign', 'Execute marketing campaign launch', 'todo', 'high', NOW() + INTERVAL '5 days', NOW() + INTERVAL '15 days', 4, (SELECT user_id FROM users WHERE username = 'user3'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Internal Tools'), 'Build time tracking tool', 'Employee time tracking dashboard', 'in_progress', 'high', NOW() - INTERVAL '8 days', NOW() + INTERVAL '7 days', 0, (SELECT user_id FROM users WHERE username = 'user1'), (SELECT user_id FROM users WHERE username = 'user9'), NOW() - INTERVAL '8 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Internal Tools'), 'Expense reporting system', 'Create expense submission and approval workflow', 'todo', 'medium', NOW() - INTERVAL '3 days', NOW() + INTERVAL '14 days', 1, (SELECT user_id FROM users WHERE username = 'user1'), (SELECT user_id FROM users WHERE username = 'user10'), NOW() - INTERVAL '3 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Internal Tools'), 'Leave management', 'Request and approval system for leave', 'todo', 'medium', NOW(), NOW() + INTERVAL '21 days', 2, (SELECT user_id FROM users WHERE username = 'user1'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), 'Collect customer data', 'Gather data from all sources', 'done', 'high', NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days', 0, (SELECT user_id FROM users WHERE username = 'user4'), (SELECT user_id FROM users WHERE username = 'user11'), NOW() - INTERVAL '12 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), 'Clean and process data', 'Remove duplicates and normalize data', 'in_progress', 'high', NOW() - INTERVAL '7 days', NOW() + INTERVAL '3 days', 1, (SELECT user_id FROM users WHERE username = 'user4'), (SELECT user_id FROM users WHERE username = 'user12'), NOW() - INTERVAL '7 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), 'Create visualization dashboards', 'Build interactive data dashboards', 'todo', 'medium', NOW(), NOW() + INTERVAL '14 days', 2, (SELECT user_id FROM users WHERE username = 'user4'), (SELECT user_id FROM users WHERE username = 'user13'), NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Data Analysis'), 'Generate monthly report', 'Automated monthly analytics report', 'todo', 'low', NOW() + INTERVAL '5 days', NOW() + INTERVAL '20 days', 3, (SELECT user_id FROM users WHERE username = 'user4'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Customer Portal'), 'Requirements gathering', 'Collect requirements from stakeholders', 'done', 'high', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', 0, (SELECT user_id FROM users WHERE username = 'user2'), (SELECT user_id FROM users WHERE username = 'user2'), NOW() - INTERVAL '10 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Customer Portal'), 'Design user interface', 'Create portal mockups', 'in_progress', 'high', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', 1, (SELECT user_id FROM users WHERE username = 'user2'), (SELECT user_id FROM users WHERE username = 'user2'), NOW() - INTERVAL '5 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'API Integration'), 'API documentation review', 'Review available APIs', 'done', 'medium', NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days', 0, (SELECT user_id FROM users WHERE username = 'user5'), (SELECT user_id FROM users WHERE username = 'user5'), NOW() - INTERVAL '8 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'API Integration'), 'Implement payment API', 'Integrate Stripe payment gateway', 'in_progress', 'high', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days', 1, (SELECT user_id FROM users WHERE username = 'user5'), (SELECT user_id FROM users WHERE username = 'user5'), NOW() - INTERVAL '3 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Security Audit'), 'Vulnerability scan', 'Run automated security scans', 'done', 'high', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', 0, (SELECT user_id FROM users WHERE username = 'user6'), (SELECT user_id FROM users WHERE username = 'user6'), NOW() - INTERVAL '5 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Security Audit'), 'Penetration testing', 'Manual security testing', 'in_progress', 'high', NOW(), NOW() + INTERVAL '10 days', 1, (SELECT user_id FROM users WHERE username = 'user6'), (SELECT user_id FROM users WHERE username = 'user6'), NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Documentation'), 'API docs update', 'Update REST API documentation', 'todo', 'medium', NOW(), NOW() + INTERVAL '7 days', 0, (SELECT user_id FROM users WHERE username = 'user3'), NULL, NOW(), NOW()),
((SELECT project_id FROM projects WHERE name = 'Training Program'), 'Create training materials', 'Develop onboarding materials', 'in_progress', 'medium', NOW() - INTERVAL '4 days', NOW() + INTERVAL '6 days', 0, (SELECT user_id FROM users WHERE username = 'user7'), (SELECT user_id FROM users WHERE username = 'user7'), NOW() - INTERVAL '4 days', NOW()),
((SELECT project_id FROM projects WHERE name = 'Training Program'), 'Schedule training sessions', 'Plan and schedule training calendar', 'todo', 'low', NOW(), NOW() + INTERVAL '14 days', 1, (SELECT user_id FROM users WHERE username = 'user7'), NULL, NOW(), NOW());

-- ============================================
-- SUBTASKS (6 subtasks)
-- ============================================
INSERT INTO subtasks (subtask_id, task_id, title, is_done, created_at) VALUES
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), 'Create wireframes', true, NOW()),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), 'Finalize color scheme', true, NOW()),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), 'Get stakeholder approval', false, NOW()),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Implement authentication' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), 'Setup OAuth', true, NOW()),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Implement authentication' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), 'Social login integration', false, NOW()),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Implement authentication' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), 'Password reset flow', true, NOW());

-- ============================================
-- TAGS
-- ============================================
INSERT INTO tags (tag_id, name, color) VALUES
(gen_random_uuid(), 'urgent', '#ef4444'),
(gen_random_uuid(), 'bug', '#f97316'),
(gen_random_uuid(), 'feature', '#22c55e'),
(gen_random_uuid(), 'enhancement', '#3b82f6'),
(gen_random_uuid(), 'documentation', '#8b5cf6'),
(gen_random_uuid(), 'design', '#ec4899'),
(gen_random_uuid(), 'testing', '#14b8a6'),
(gen_random_uuid(), 'review', '#eab308');

-- ============================================
-- TASK TAGS
-- ============================================
INSERT INTO task_tags (task_id, tag_id) VALUES
((SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT tag_id FROM tags WHERE name = 'design')),
((SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT tag_id FROM tags WHERE name = 'feature')),
((SELECT task_id FROM tasks WHERE title = 'Implement authentication' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), (SELECT tag_id FROM tags WHERE name = 'feature')),
((SELECT task_id FROM tasks WHERE title = 'Implement authentication' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), (SELECT tag_id FROM tags WHERE name = 'urgent')),
((SELECT task_id FROM tasks WHERE title = 'Create social media content' AND project_id = (SELECT project_id FROM projects WHERE name = 'Marketing Campaign') LIMIT 1), (SELECT tag_id FROM tags WHERE name = 'enhancement'));

-- ============================================
-- COMMENTS
-- ============================================
INSERT INTO comments (comment_id, task_id, user_id, content, created_at) VALUES
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user1'), 'Looks great! Please make the header slightly larger.', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user2'), 'Updated the mockup based on feedback.', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Implement authentication' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user5'), 'Started working on OAuth integration.', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), (SELECT task_id FROM tasks WHERE title = 'Create social media content' AND project_id = (SELECT project_id FROM projects WHERE name = 'Marketing Campaign') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user7'), 'Content calendar is ready for review.', NOW() - INTERVAL '1 day');

-- ============================================
-- ACTIVITY LOGS
-- ============================================
INSERT INTO activity_logs (log_id, user_id, task_id, action, created_at) VALUES
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user1'), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), 'created task', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user2'), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), 'updated task status to in_progress', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user3'), (SELECT task_id FROM tasks WHERE title = 'Design homepage mockup' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), 'added comment', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user2'), (SELECT task_id FROM tasks WHERE title = 'Setup React Native project' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), 'created task', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user1'), (SELECT task_id FROM tasks WHERE title = 'Setup React Native project' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), 'completed task', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user6'), (SELECT task_id FROM tasks WHERE title = 'Define target audience' AND project_id = (SELECT project_id FROM projects WHERE name = 'Marketing Campaign') LIMIT 1), 'created task', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user7'), (SELECT task_id FROM tasks WHERE title = 'Create social media content' AND project_id = (SELECT project_id FROM projects WHERE name = 'Marketing Campaign') LIMIT 1), 'updated task', NOW() - INTERVAL '10 days');

-- ============================================
-- CHAT ROOMS
-- ============================================
INSERT INTO chat_rooms (room_id, name, is_group, created_by, last_message_at) VALUES
(gen_random_uuid(), 'Website Redesign Team', true, (SELECT user_id FROM users WHERE username = 'user1'), NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'Mobile App Dev', true, (SELECT user_id FROM users WHERE username = 'user2'), NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), 'Marketing Team', true, (SELECT user_id FROM users WHERE username = 'user3'), NOW() - INTERVAL '30 minutes'),
(gen_random_uuid(), 'General Discussion', true, (SELECT user_id FROM users WHERE username = 'user1'), NOW() - INTERVAL '10 minutes');

-- ============================================
-- CHAT ROOM MEMBERS
-- ============================================
INSERT INTO chat_room_members (room_id, user_id, role, joined_at, unread_count) VALUES
((SELECT room_id FROM chat_rooms WHERE name = 'Website Redesign Team'), (SELECT user_id FROM users WHERE username = 'user1'), 'admin', NOW(), 0),
((SELECT room_id FROM chat_rooms WHERE name = 'Website Redesign Team'), (SELECT user_id FROM users WHERE username = 'user2'), 'member', NOW(), 2),
((SELECT room_id FROM chat_rooms WHERE name = 'Website Redesign Team'), (SELECT user_id FROM users WHERE username = 'user3'), 'member', NOW(), 0),
((SELECT room_id FROM chat_rooms WHERE name = 'Mobile App Dev'), (SELECT user_id FROM users WHERE username = 'user2'), 'admin', NOW(), 1),
((SELECT room_id FROM chat_rooms WHERE name = 'Mobile App Dev'), (SELECT user_id FROM users WHERE username = 'user1'), 'member', NOW(), 3),
((SELECT room_id FROM chat_rooms WHERE name = 'Mobile App Dev'), (SELECT user_id FROM users WHERE username = 'user5'), 'member', NOW(), 0),
((SELECT room_id FROM chat_rooms WHERE name = 'Marketing Team'), (SELECT user_id FROM users WHERE username = 'user3'), 'admin', NOW(), 0),
((SELECT room_id FROM chat_rooms WHERE name = 'Marketing Team'), (SELECT user_id FROM users WHERE username = 'user6'), 'member', NOW(), 5),
((SELECT room_id FROM chat_rooms WHERE name = 'Marketing Team'), (SELECT user_id FROM users WHERE username = 'user7'), 'member', NOW(), 1),
((SELECT room_id FROM chat_rooms WHERE name = 'General Discussion'), (SELECT user_id FROM users WHERE username = 'user1'), 'admin', NOW(), 0),
((SELECT room_id FROM chat_rooms WHERE name = 'General Discussion'), (SELECT user_id FROM users WHERE username = 'user2'), 'member', NOW(), 0);

-- ============================================
-- MESSAGES
-- ============================================
INSERT INTO messages (message_id, room_id, sender_id, content, message_type, created_at) VALUES
(gen_random_uuid(), (SELECT room_id FROM chat_rooms WHERE name = 'Website Redesign Team'), (SELECT user_id FROM users WHERE username = 'user1'), 'Hey team, lets sync up on the homepage design', 'text', NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), (SELECT room_id FROM chat_rooms WHERE name = 'Website Redesign Team'), (SELECT user_id FROM users WHERE username = 'user2'), 'Sure, I will share the latest mockups', 'text', NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), (SELECT room_id FROM chat_rooms WHERE name = 'Mobile App Dev'), (SELECT user_id FROM users WHERE username = 'user2'), 'Authentication flow is complete', 'text', NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), (SELECT room_id FROM chat_rooms WHERE name = 'Marketing Team'), (SELECT user_id FROM users WHERE username = 'user7'), 'Content calendar ready for review!', 'text', NOW() - INTERVAL '30 minutes'),
(gen_random_uuid(), (SELECT room_id FROM chat_rooms WHERE name = 'General Discussion'), (SELECT user_id FROM users WHERE username = 'user1'), 'Welcome everyone!', 'text', NOW() - INTERVAL '10 minutes');

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO notifications (notification_id, user_id, type, message, is_read, created_at) VALUES
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user2'), 'task_assigned', 'You have been assigned to "Implement responsive header"', false, NOW() - INTERVAL '1 day'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user3'), 'task_assigned', 'You have been assigned to "Create contact form"', false, NOW() - INTERVAL '2 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user1'), 'comment', 'User2 commented on "Design homepage mockup"', true, NOW() - INTERVAL '3 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user5'), 'task_update', 'Task "Setup React Native project" status changed to done', false, NOW() - INTERVAL '5 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user7'), 'mention', 'You were mentioned in "Create social media content"', false, NOW() - INTERVAL '1 hour');

-- ============================================
-- EVENTS
-- ============================================
INSERT INTO events (event_id, user_id, title, description, start_time, end_time, created_at) VALUES
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user1'), 'Sprint Planning', 'Plan next sprint tasks', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '12 hours', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user2'), 'Design Review', 'Review homepage designs', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '15 hours', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user3'), 'Marketing Sync', 'Weekly marketing team sync', NOW() + INTERVAL '3 days' + INTERVAL '9 hours', NOW() + INTERVAL '3 days' + INTERVAL '10 hours', NOW()),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user1'), 'Client Call', 'Call with client about website', NOW() + INTERVAL '5 days' + INTERVAL '11 hours', NOW() + INTERVAL '5 days' + INTERVAL '12 hours', NOW() - INTERVAL '3 days');

-- ============================================
-- CHANNELS
-- ============================================
INSERT INTO channels (channel_id, name, project_id, is_public, description, created_by, created_at) VALUES
(gen_random_uuid(), 'general', (SELECT project_id FROM projects WHERE name = 'Website Redesign'), true, 'General project discussions', (SELECT user_id FROM users WHERE username = 'user1'), NOW()),
(gen_random_uuid(), 'design', (SELECT project_id FROM projects WHERE name = 'Website Redesign'), true, 'Design discussions and feedback', (SELECT user_id FROM users WHERE username = 'user1'), NOW()),
(gen_random_uuid(), 'general', (SELECT project_id FROM projects WHERE name = 'Mobile App'), true, 'General project discussions', (SELECT user_id FROM users WHERE username = 'user2'), NOW()),
(gen_random_uuid(), 'development', (SELECT project_id FROM projects WHERE name = 'Mobile App'), true, 'Development chat', (SELECT user_id FROM users WHERE username = 'user2'), NOW()),
(gen_random_uuid(), 'general', (SELECT project_id FROM projects WHERE name = 'Marketing Campaign'), true, 'General discussions', (SELECT user_id FROM users WHERE username = 'user3'), NOW()),
(gen_random_uuid(), 'general', (SELECT project_id FROM projects WHERE name = 'Internal Tools'), true, 'General discussions', (SELECT user_id FROM users WHERE username = 'user1'), NOW());

-- ============================================
-- CHANNEL MEMBERS
-- ============================================
INSERT INTO channel_members (channel_id, user_id, role) VALUES
((SELECT channel_id FROM channels WHERE name = 'general' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user1'), 'admin'),
((SELECT channel_id FROM channels WHERE name = 'general' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user2'), 'member'),
((SELECT channel_id FROM channels WHERE name = 'general' AND project_id = (SELECT project_id FROM projects WHERE name = 'Website Redesign') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user3'), 'member'),
((SELECT channel_id FROM channels WHERE name = 'general' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user2'), 'admin'),
((SELECT channel_id FROM channels WHERE name = 'general' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user1'), 'member'),
((SELECT channel_id FROM channels WHERE name = 'general' AND project_id = (SELECT project_id FROM projects WHERE name = 'Mobile App') LIMIT 1), (SELECT user_id FROM users WHERE username = 'user5'), 'member');

-- ============================================
-- TEAM MEMBERS
-- ============================================
INSERT INTO team_members (team_id, user_id) VALUES
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user1')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user2')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user3')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user4')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user5')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user6')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user7')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user8')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user9')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user10')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user11')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user12')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user13')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user14')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user15')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user16')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user17')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user18')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user19')),
(gen_random_uuid(), (SELECT user_id FROM users WHERE username = 'user20'));

COMMIT;
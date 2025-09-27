-- ==============================
-- 1. USERS
-- ==============================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user', -- admin, user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 2. TEAMS & MEMBERS
-- ==============================
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    team_id INT REFERENCES teams(team_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- owner, manager, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(team_id, user_id)
);

-- ==============================
-- 3. PROJECTS & MEMBERS
-- ==============================
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INT REFERENCES users(user_id),
    team_id INT REFERENCES teams(team_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'viewer', -- owner, editor, viewer
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(project_id, user_id)
);

-- ==============================
-- 4. TASKS & SUBTASKS
-- ==============================
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo', -- todo, in_progress, done
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    due_date TIMESTAMP,
    order_index INT DEFAULT 0, -- hỗ trợ drag & drop
    created_by INT REFERENCES users(user_id),
    assigned_to INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subtasks (
    subtask_id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(task_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 5. TAGS
-- ==============================
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT 'blue'
);

CREATE TABLE task_tags (
    task_id INT REFERENCES tasks(task_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY(task_id, tag_id)
);

-- ==============================
-- 6. COMMENTS (gắn vào Task)
-- ==============================
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(task_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 7. CHAT (rooms, members, messages)
-- ==============================
CREATE TABLE chat_rooms (
    room_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    is_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_room_members (
    room_id INT REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(room_id, user_id)
);

CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    room_id INT REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(user_id),
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 8. FILES
-- ==============================
CREATE TABLE files (
    file_id SERIAL PRIMARY KEY,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    uploaded_by INT REFERENCES users(user_id),
    task_id INT REFERENCES tasks(task_id) ON DELETE SET NULL,
    message_id INT REFERENCES messages(message_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 9. CALENDAR (events + reminders)
-- ==============================
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reminders (
    reminder_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    remind_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 10. NOTIFICATIONS
-- ==============================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    type VARCHAR(50), -- task, chat, event
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 11. ACTIVITY LOGS
-- ==============================
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    task_id INT REFERENCES tasks(task_id),
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

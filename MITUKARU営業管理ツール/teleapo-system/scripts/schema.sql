-- PostgreSQL Schema for Teleapo System (Neon)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'unreachable', 'recall', 'callback', 'appointed', 'ng')),
    assigned_to INTEGER REFERENCES users(id),
    next_action_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call logs table
CREATE TABLE IF NOT EXISTS call_logs (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    result TEXT NOT NULL CHECK (result IN ('new', 'unreachable', 'recall', 'callback', 'appointed', 'ng', 'other')),
    notes TEXT,
    next_action_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    target_calls INTEGER DEFAULT 0,
    target_appointments INTEGER DEFAULT 0,
    target_contracts INTEGER DEFAULT 0,
    fixed_cost REAL DEFAULT 0,
    cpa REAL DEFAULT 0,
    revenue_per_contract REAL DEFAULT 0,
    target_profit_rate REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);

-- KPI Settings table
CREATE TABLE IF NOT EXISTS kpi_settings (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    target_hires INTEGER DEFAULT 0,
    cr_ap_rate REAL DEFAULT 0,
    mtg_ap_rate REAL DEFAULT 0,
    contract_mtg_rate REAL DEFAULT 0,
    job_contract_rate REAL DEFAULT 0,
    hire_job_rate REAL DEFAULT 0,
    revenue_per_hire REAL DEFAULT 0,
    cost_per_call REAL DEFAULT 0,
    fixed_cost REAL DEFAULT 0,
    variable_cost REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);

-- Calendar Settings table
CREATE TABLE IF NOT EXISTS calendar_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    google_calendar_id TEXT DEFAULT 'primary',
    default_meeting_duration INTEGER DEFAULT 30,
    business_hours_start TEXT DEFAULT '09:00',
    business_hours_end TEXT DEFAULT '18:00',
    email_subject_template TEXT DEFAULT '{company_name}様とのWeb会議のご案内',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_next_action_date ON customers(next_action_date);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer_id ON call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);

-- Seed initial admin user (password: admin123)
-- You should change this password after first login
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@example.com', '$2a$10$rO0hQ.2Z8Q0XpCx6DQxQ5Oa4yQQFqQUJW0iSQ4I6nQz4x4JqQQ2Hy', '管理者', 'admin')
ON CONFLICT (email) DO NOTHING;

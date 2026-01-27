-- Migration: Create core tables for Workforce Management System
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entities table (ITS, IBCC, IITT)
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default entities
INSERT INTO entities (name) VALUES ('ITS'), ('IBCC'), ('IITT');

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  employment_type VARCHAR(20) CHECK (employment_type IN ('permanent', 'retainer')) DEFAULT 'permanent',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  performance_score DECIMAL(3,1) CHECK (performance_score >= 0 AND performance_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utilizations table
CREATE TABLE utilizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  utilization_percent INTEGER CHECK (utilization_percent > 0 AND utilization_percent <= 100),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, project_id, start_date)
);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Skills junction table
CREATE TABLE employee_skills (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency VARCHAR(20) CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (employee_id, skill_id)
);

-- Certifications table
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_employees_entity ON employees(entity_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_projects_entity ON projects(entity_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_allocations_employee ON allocations(employee_id);
CREATE INDEX idx_allocations_project ON allocations(project_id);
CREATE INDEX idx_allocations_dates ON allocations(start_date, end_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to employees and projects
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Public read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON employee_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON certifications FOR SELECT TO authenticated USING (true);

-- For development, also allow anon access (remove in production)
CREATE POLICY "Allow anon read access" ON entities FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON employees FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON allocations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON skills FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON employee_skills FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access" ON certifications FOR SELECT TO anon USING (true);

-- Allow all operations for authenticated users (adjust based on your needs)
CREATE POLICY "Allow all for authenticated" ON employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON employee_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON certifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

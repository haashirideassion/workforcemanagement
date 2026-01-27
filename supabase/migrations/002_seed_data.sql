-- Seed data for development and testing

-- Insert sample skills
INSERT INTO skills (name, category) VALUES
  ('React', 'Frontend'),
  ('TypeScript', 'Frontend'),
  ('Node.js', 'Backend'),
  ('Python', 'Backend'),
  ('PostgreSQL', 'Database'),
  ('AWS', 'Cloud'),
  ('Kubernetes', 'DevOps'),
  ('Machine Learning', 'AI/ML'),
  ('Docker', 'DevOps'),
  ('GraphQL', 'Backend');

-- Insert sample employees
INSERT INTO employees (name, email, entity_id, employment_type, performance_score) VALUES
  ('John Doe', 'john.doe@company.com', (SELECT id FROM entities WHERE name = 'ITS'), 'permanent', 8.5),
  ('Jane Smith', 'jane.smith@company.com', (SELECT id FROM entities WHERE name = 'IBCC'), 'permanent', 7.8),
  ('Mike Johnson', 'mike.johnson@company.com', (SELECT id FROM entities WHERE name = 'IITT'), 'retainer', 6.5),
  ('Sarah Williams', 'sarah.williams@company.com', (SELECT id FROM entities WHERE name = 'ITS'), 'permanent', 9.2),
  ('David Brown', 'david.brown@company.com', (SELECT id FROM entities WHERE name = 'IBCC'), 'retainer', 4.5),
  ('Emily Davis', 'emily.davis@company.com', (SELECT id FROM entities WHERE name = 'IITT'), 'permanent', 7.5),
  ('Chris Miller', 'chris.miller@company.com', (SELECT id FROM entities WHERE name = 'ITS'), 'permanent', 3.0),
  ('Lisa Wilson', 'lisa.wilson@company.com', (SELECT id FROM entities WHERE name = 'IBCC'), 'permanent', 8.9),
  ('Tom Anderson', 'tom.anderson@company.com', (SELECT id FROM entities WHERE name = 'IBCC'), 'retainer', 5.0),
  ('Amy Chen', 'amy.chen@company.com', (SELECT id FROM entities WHERE name = 'ITS'), 'permanent', 7.0);

-- Insert sample projects
INSERT INTO projects (name, entity_id, start_date, end_date, status) VALUES
  ('Project Alpha', (SELECT id FROM entities WHERE name = 'ITS'), '2025-10-01', '2026-03-31', 'active'),
  ('Project Beta', (SELECT id FROM entities WHERE name = 'IBCC'), '2025-11-15', '2026-02-28', 'active'),
  ('Project Gamma', (SELECT id FROM entities WHERE name = 'IITT'), '2025-09-01', '2026-04-30', 'on-hold'),
  ('Project Delta', (SELECT id FROM entities WHERE name = 'ITS'), '2025-06-01', '2025-12-31', 'completed'),
  ('Project Epsilon', (SELECT id FROM entities WHERE name = 'IBCC'), '2026-01-01', '2026-06-30', 'active');

-- Insert sample allocations
INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 50, '2025-10-01', '2026-03-31'
FROM employees e, projects p
WHERE e.name = 'John Doe' AND p.name = 'Project Alpha';

INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 35, '2025-11-01', '2026-02-28'
FROM employees e, projects p
WHERE e.name = 'John Doe' AND p.name = 'Project Beta';

INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 60, '2025-11-15', '2026-02-28'
FROM employees e, projects p
WHERE e.name = 'Jane Smith' AND p.name = 'Project Beta';

INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 45, '2025-09-01', NULL
FROM employees e, projects p
WHERE e.name = 'Mike Johnson' AND p.name = 'Project Gamma';

INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 100, '2025-10-01', '2026-03-31'
FROM employees e, projects p
WHERE e.name = 'Sarah Williams' AND p.name = 'Project Alpha';

INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 75, '2026-01-01', '2026-06-30'
FROM employees e, projects p
WHERE e.name = 'Emily Davis' AND p.name = 'Project Epsilon';

INSERT INTO allocations (employee_id, project_id, allocation_percent, start_date, end_date)
SELECT e.id, p.id, 90, '2025-11-15', '2026-02-28'
FROM employees e, projects p
WHERE e.name = 'Lisa Wilson' AND p.name = 'Project Beta';

-- Assign skills to employees
INSERT INTO employee_skills (employee_id, skill_id, proficiency, is_primary)
SELECT e.id, s.id, 'expert', true
FROM employees e, skills s
WHERE e.name = 'John Doe' AND s.name = 'React';

INSERT INTO employee_skills (employee_id, skill_id, proficiency, is_primary)
SELECT e.id, s.id, 'advanced', false
FROM employees e, skills s
WHERE e.name = 'John Doe' AND s.name = 'TypeScript';

INSERT INTO employee_skills (employee_id, skill_id, proficiency, is_primary)
SELECT e.id, s.id, 'expert', true
FROM employees e, skills s
WHERE e.name = 'Jane Smith' AND s.name = 'Node.js';

INSERT INTO employee_skills (employee_id, skill_id, proficiency, is_primary)
SELECT e.id, s.id, 'advanced', true
FROM employees e, skills s
WHERE e.name = 'Mike Johnson' AND s.name = 'Python';

INSERT INTO employee_skills (employee_id, skill_id, proficiency, is_primary)
SELECT e.id, s.id, 'intermediate', false
FROM employees e, skills s
WHERE e.name = 'Sarah Williams' AND s.name = 'AWS';

INSERT INTO employee_skills (employee_id, skill_id, proficiency, is_primary)
SELECT e.id, s.id, 'beginner', false
FROM employees e, skills s
WHERE e.name = 'David Brown' AND s.name = 'Kubernetes';

-- Insert sample certifications
INSERT INTO certifications (employee_id, name, issuer, valid_until)
SELECT id, 'AWS Solutions Architect', 'Amazon Web Services', '2027-06-15'
FROM employees WHERE name = 'Sarah Williams';

INSERT INTO certifications (employee_id, name, issuer, valid_until)
SELECT id, 'Google Cloud Professional', 'Google', '2026-12-01'
FROM employees WHERE name = 'John Doe';

INSERT INTO certifications (employee_id, name, issuer, valid_until)
SELECT id, 'Kubernetes Administrator (CKA)', 'CNCF', '2026-08-20'
FROM employees WHERE name = 'Emily Davis';

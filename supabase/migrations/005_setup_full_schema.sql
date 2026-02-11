-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to start fresh (optional, but good for robust setup)
DROP TABLE IF EXISTS public.allocations CASCADE;
DROP TABLE IF EXISTS public.employee_skills CASCADE;
DROP TABLE IF EXISTS public.certifications CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.entities CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;

-- 1. Entities
CREATE TABLE public.entities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT entities_pkey PRIMARY KEY (id)
);

-- Seed Entities
INSERT INTO public.entities (name) VALUES 
('ITS'), 
('IBCC'), 
('IITT');

-- 2. Accounts (New Table)
CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying,
  entity_id uuid REFERENCES public.entities(id),
  billing_type character varying, -- 'T&M', 'Fixed', 'Retainer'
  status character varying CHECK (status IN ('healthy', 'at-risk', 'critical', 'on-hold')),
  zone character varying, -- 'USA', 'Asia', 'EMEA', 'LatAm', 'APAC', 'Europe'
  start_date date,
  description text,
  website text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id)
);

-- Seed Accounts
DO $$
DECLARE
  v_its_id uuid;
  v_ibcc_id uuid;
  v_iitt_id uuid;
BEGIN
  SELECT id INTO v_its_id FROM public.entities WHERE name = 'ITS';
  SELECT id INTO v_ibcc_id FROM public.entities WHERE name = 'IBCC';
  SELECT id INTO v_iitt_id FROM public.entities WHERE name = 'IITT';

  INSERT INTO public.accounts (name, email, entity_id, billing_type, status, zone, start_date) VALUES
  ('Acme Corporation', 'contact@acme.com', v_its_id, 'Retainer', 'healthy', 'USA', '2024-01-15'),
  ('TechStart Inc', 'hello@techstart.io', v_ibcc_id, 'T&M', 'at-risk', 'Asia', '2024-03-01'),
  ('Global Finance Ltd', 'projects@globalfinance.com', v_iitt_id, 'Fixed', 'critical', 'EMEA', '2023-06-20'),
  ('HealthTech Solutions', 'info@healthtech.com', v_its_id, 'Retainer', 'on-hold', 'USA', '2024-02-10'),
  ('RetailMax', 'dev@retailmax.com', v_ibcc_id, 'T&M', 'healthy', 'LatAm', '2023-11-05'),
  ('EduLearn Platform', 'tech@edulearn.com', v_iitt_id, 'Fixed', 'at-risk', 'Europe', '2024-04-01'),
  ('CloudNine Systems', 'support@cloudnine.io', v_its_id, 'Retainer', 'healthy', 'USA', '2022-08-15'),
  ('DataDriven Analytics', 'hello@datadriven.com', v_ibcc_id, 'T&M', 'at-risk', 'APAC', '2024-05-20');
END $$;

-- 3. Projects
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  entity_id uuid REFERENCES public.entities(id),
  account_id uuid REFERENCES public.accounts(id), -- Added Link
  start_date date,
  end_date date,
  status character varying DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold', 'proposal')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- Seed Projects
DO $$
DECLARE
  v_acme_id uuid;
  v_tech_id uuid;
  v_gf_id uuid;
  v_cloud_id uuid;
  v_retail_id uuid;
  v_edu_id uuid;
  v_its_id uuid;
  v_ibcc_id uuid;
  v_iitt_id uuid;
BEGIN
  SELECT id INTO v_its_id FROM public.entities WHERE name = 'ITS';
  SELECT id INTO v_ibcc_id FROM public.entities WHERE name = 'IBCC';
  SELECT id INTO v_iitt_id FROM public.entities WHERE name = 'IITT';
  
  SELECT id INTO v_acme_id FROM public.accounts WHERE name = 'Acme Corporation';
  SELECT id INTO v_tech_id FROM public.accounts WHERE name = 'TechStart Inc';
  SELECT id INTO v_gf_id FROM public.accounts WHERE name = 'Global Finance Ltd';
  SELECT id INTO v_cloud_id FROM public.accounts WHERE name = 'CloudNine Systems';
  SELECT id INTO v_retail_id FROM public.accounts WHERE name = 'RetailMax';
  SELECT id INTO v_edu_id FROM public.accounts WHERE name = 'EduLearn Platform';

  INSERT INTO public.projects (name, entity_id, account_id, start_date, end_date, status) VALUES
  ('Project Alpha', v_its_id, v_acme_id, '2025-01-01', '2026-03-31', 'active'),
  ('Project Beta', v_ibcc_id, v_tech_id, '2025-02-01', '2026-02-28', 'active'),
  ('Project Gamma', v_iitt_id, v_gf_id, '2024-11-01', '2026-04-30', 'on-hold'),
  ('Project Delta', v_its_id, v_cloud_id, '2025-01-01', '2025-12-31', 'completed'),
  ('Project Epsilon', v_ibcc_id, v_retail_id, '2026-06-01', '2026-12-31', 'proposal'),
  ('Project Zeta', v_iitt_id, v_edu_id, '2025-03-01', '2026-06-30', 'active');
END $$;

-- 4. Employees
CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying UNIQUE,
  entity_id uuid REFERENCES public.entities(id),
  employment_type character varying DEFAULT 'permanent' CHECK (employment_type IN ('permanent', 'retainer', 'intern', 'contractor')),
  status character varying DEFAULT 'active' CHECK (status IN ('active', 'archived', 'on-hold')),
  performance_score numeric CHECK (performance_score >= 0 AND performance_score <= 10),
  employee_code character varying,
  role character varying,
  experience numeric,
  specialization character varying,
  primary_skills text,
  secondary_skills text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id)
);

-- Seed Employees
DO $$
DECLARE
  v_its_id uuid;
  v_ibcc_id uuid;
  v_iitt_id uuid;
BEGIN
  SELECT id INTO v_its_id FROM public.entities WHERE name = 'ITS';
  SELECT id INTO v_ibcc_id FROM public.entities WHERE name = 'IBCC';
  SELECT id INTO v_iitt_id FROM public.entities WHERE name = 'IITT';

  INSERT INTO public.employees (name, email, entity_id, employment_type, status, role, specialization) VALUES
  ('John Doe', 'john.doe@example.com', v_its_id, 'permanent', 'active', 'Senior Developer', 'Frontend'),
  ('Jane Smith', 'jane.smith@example.com', v_its_id, 'contractor', 'active', 'Backend Engineer', 'Node.js'),
  ('Alice Johnson', 'alice.j@example.com', v_ibcc_id, 'permanent', 'active', 'Tech Lead', 'Full Stack'),
  ('Bob Williams', 'bob.w@example.com', v_ibcc_id, 'permanent', 'active', 'UI Designer', 'Design Systems'),
  ('Charlie Brown', 'charlie.b@example.com', v_ibcc_id, 'contractor', 'active', 'DevOps Engineer', 'AWS'),
  ('Diana Prince', 'diana.p@example.com', v_iitt_id, 'permanent', 'active', 'Project Manager', 'Agile'),
  ('Evan Wright', 'evan.w@example.com', v_iitt_id, 'intern', 'active', 'Junior Developer', 'Python');
END $$;

-- 5. Skills (Schema only, seeding optional or minimal)
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  category character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);

INSERT INTO public.skills (name, category) VALUES
('React', 'Frontend'), ('Node.js', 'Backend'), ('Python', 'Backend'), ('AWS', 'DevOps'), ('Figma', 'Design');

-- 6. Employee Skills (Join table)
CREATE TABLE public.employee_skills (
  employee_id uuid NOT NULL REFERENCES public.employees(id),
  skill_id uuid NOT NULL REFERENCES public.skills(id),
  proficiency character varying DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_primary boolean DEFAULT false,
  CONSTRAINT employee_skills_pkey PRIMARY KEY (employee_id, skill_id)
);

-- 7. Allocations
CREATE TABLE public.allocations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES public.employees(id),
  project_id uuid REFERENCES public.projects(id),
  allocation_percent integer CHECK (allocation_percent > 0 AND allocation_percent <= 100),
  start_date date NOT NULL,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT allocations_pkey PRIMARY KEY (id)
);

-- Seed Allocations
DO $$
DECLARE
  v_p_alpha uuid;
  v_p_beta uuid;
  v_p_gamma uuid;
  v_p_zeta uuid;
  v_john uuid; v_jane uuid; v_alice uuid; v_bob uuid; v_charlie uuid; v_diana uuid; v_evan uuid;
BEGIN
  SELECT id INTO v_p_alpha FROM public.projects WHERE name = 'Project Alpha';
  SELECT id INTO v_p_beta FROM public.projects WHERE name = 'Project Beta';
  SELECT id INTO v_p_gamma FROM public.projects WHERE name = 'Project Gamma';
  SELECT id INTO v_p_zeta FROM public.projects WHERE name = 'Project Zeta';

  SELECT id INTO v_john FROM public.employees WHERE email = 'john.doe@example.com';
  SELECT id INTO v_jane FROM public.employees WHERE email = 'jane.smith@example.com';
  SELECT id INTO v_alice FROM public.employees WHERE email = 'alice.j@example.com';
  SELECT id INTO v_bob FROM public.employees WHERE email = 'bob.w@example.com';
  SELECT id INTO v_charlie FROM public.employees WHERE email = 'charlie.b@example.com';
  SELECT id INTO v_diana FROM public.employees WHERE email = 'diana.p@example.com';
  SELECT id INTO v_evan FROM public.employees WHERE email = 'evan.w@example.com';

  INSERT INTO public.allocations (employee_id, project_id, allocation_percent, start_date, end_date) VALUES
  (v_john, v_p_alpha, 50, '2025-01-10', NULL),
  (v_jane, v_p_alpha, 100, '2025-01-15', '2025-12-31'),
  (v_alice, v_p_beta, 100, '2025-02-01', NULL),
  (v_bob, v_p_beta, 50, '2025-02-15', '2025-08-30'),
  (v_charlie, v_p_beta, 75, '2025-03-01', NULL),
  (v_diana, v_p_gamma, 25, '2024-11-01', NULL),
  (v_evan, v_p_zeta, 50, '2025-03-01', NULL);
END $$;

-- 8. Certifications
CREATE TABLE public.certifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES public.employees(id),
  name character varying NOT NULL,
  issuer character varying,
  valid_until date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT certifications_pkey PRIMARY KEY (id)
);

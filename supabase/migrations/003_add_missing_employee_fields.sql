-- Migration: Add missing fields to employees table
-- These fields are required by the and UI and were previously missing in the schema

ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS experience DECIMAL(4,1);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS primary_skills TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS secondary_skills TEXT;

-- Update RLS if necessary (usually 'ALL for authenticated' covers this, but being explicit)
-- Assuming policies from 001_initial_schema.sql are active

// Entity types
export interface Entity {
    id: string;
    name: 'ITS' | 'IBCC' | 'IITT';
    created_at: string;
}

// Employment types
export type EmploymentType = 'permanent' | 'retainer' | 'intern' | 'contractor';
export type EmployeeStatus = 'active' | 'archived' | 'on-hold';
export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'proposal';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Account types
export interface Account {
    id: string;
    name: string;
    email: string;
    entity: 'ITS' | 'IBCC' | 'IITT';
    activeProjects: number;
    utilizedResources: number;
    utilization: number;
    billingType: 'T&M' | 'Fixed' | 'Retainer';
    status: 'healthy' | 'at-risk' | 'critical' | 'on-hold';
    zone: 'USA' | 'Asia' | 'EMEA' | 'LatAm' | 'APAC' | 'Europe';
    contractValue?: number;
    startDate: string;
    description?: string;
    website?: string;
    domain?: string;
}

// Employee types
export interface Employee {
    id: string;
    name: string;
    email: string | null;
    entity_id: string;
    employment_type: EmploymentType;
    status: EmployeeStatus;
    employee_code?: string;
    role?: string;
    specialization?: string;
    experience?: number;
    created_at: string;
    updated_at: string;
    // Computed fields
    entity?: Entity;
    skills?: EmployeeSkill[];
    utilization_data?: Utilization[];
    certifications?: Certification[];
    utilization?: number;
    primary_skills?: string;
    secondary_skills?: string;
}

// Project types
export interface Project {
    id: string;
    name: string;
    entity_id: string;
    start_date: string | null;
    end_date: string | null;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;
    description?: string;
    // Computed fields
    entity?: Entity;
    utilization?: Utilization[];
    account?: Account;
    account_id?: string;
}

// Utilization types
export interface Utilization {
    id: string;
    employee_id: string;
    project_id: string;
    utilization_percent: number;
    start_date: string;
    end_date: string | null;
    role?: string;
    type?: 'Billable' | 'Shared' | 'Shadow' | 'Training' | 'Non-Billable';
    created_at: string;
    // Computed fields
    employee?: Employee;
    project?: Project;
}

// Skill types
export interface Skill {
    id: string;
    name: string;
    category: string | null;
    created_at: string;
}

export interface EmployeeSkill {
    employee_id: string;
    skill_id: string;
    proficiency: SkillProficiency;
    is_primary: boolean;
    // Computed fields
    skill?: Skill;
    employee?: Employee;
}

// Certification types
export interface Certification {
    id: string;
    employee_id: string;
    name: string;
    issuer: string | null;
    valid_until: string | null;
}

// Utilization types (effort-based project utilization)
export type UtilizationCategory = 'fully-utilized' | 'partially-utilized' | 'available';

export interface UtilizationData {
    employee: Employee;
    utilization: number;
    category: UtilizationCategory;
}

// Dashboard KPI types
export interface DashboardKPIs {
    totalEmployees: number;
    benchPercentage: number;
    activeProjects: number;
    alertsCount: number;
}

// Filter types
export interface EmployeeFilters {
    entity?: string;
    employmentType?: EmploymentType;
    utilizationStatus?: UtilizationCategory;
    search?: string;
}

export interface ProjectFilters {
    entity?: string;
    status?: ProjectStatus;
    search?: string;
    accountId?: string;
}

// Risk tags for optimization
export type RiskTag = 'review-required' | 'at-risk' | 'layoff-consideration';

export interface OptimizationEmployee extends Employee {
    riskTag?: RiskTag;
}

// Entity types
export interface Entity {
    id: string;
    name: 'ITA' | 'IBCC' | 'IITT';
    created_at: string;
}

// Employment types
export type EmploymentType = 'permanent' | 'retainer';
export type EmployeeStatus = 'active' | 'archived';
export type ProjectStatus = 'active' | 'completed' | 'on-hold';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Employee types
export interface Employee {
    id: string;
    name: string;
    email: string | null;
    entity_id: string;
    employment_type: EmploymentType;
    status: EmployeeStatus;
    performance_score: number | null;
    created_at: string;
    updated_at: string;
    // Computed fields
    entity?: Entity;
    skills?: EmployeeSkill[];
    allocations?: Allocation[];
    certifications?: Certification[];
    utilization?: number;
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
    // Computed fields
    entity?: Entity;
    allocations?: Allocation[];
}

// Allocation types
export interface Allocation {
    id: string;
    employee_id: string;
    project_id: string;
    allocation_percent: number;
    start_date: string;
    end_date: string | null;
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
    created_at: string;
}

// Utilization types
export type UtilizationCategory = 'healthy' | 'watch' | 'risk';

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
}

// Risk tags for optimization
export type RiskTag = 'review-required' | 'at-risk' | 'layoff-consideration';

export interface OptimizationEmployee extends Employee {
    riskTag?: RiskTag;
}

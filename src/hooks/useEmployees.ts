import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Employee, EmployeeFilters } from '@/types';

// Mock Employees Data for consistent linking
// Mock Projects for utilization data
const mockProjects = {
    alpha: { id: 'p1', name: 'Website Redesign', entity_id: '1', status: 'active', created_at: '', updated_at: '', start_date: '2024-01-01', end_date: '2025-12-31' } as const,
    beta: { id: 'p2', name: 'Mobile App', entity_id: '1', status: 'active', created_at: '', updated_at: '', start_date: '2024-03-01', end_date: '2025-06-30' } as const,
    gamma: { id: 'p3', name: 'Cloud Migration', entity_id: '2', status: 'active', created_at: '', updated_at: '', start_date: '2024-02-15', end_date: '2024-11-30' } as const,
};

export const mockEmployees: (Employee & { utilization: number })[] = [
    {
        id: 'e1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        entity_id: '1',
        employment_type: 'permanent',
        status: 'active',
        employee_code: 'EMP001',
        role: 'Senior Developer',
        specialization: 'Frontend',
        experience: 5,
        performance_score: 4.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [
            { id: 'u1', employee_id: 'e1', project_id: 'p1', utilization_percent: 50, start_date: '2024-01-01', end_date: null, created_at: '', project: mockProjects.alpha as any }
        ],
        skills: [],
        certifications: [],
        utilization: 50
    },
    {
        id: 'e2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        entity_id: '1',
        employment_type: 'contractor',
        status: 'active',
        employee_code: 'EMP002',
        role: 'Backend Engineer',
        specialization: 'Node.js',
        experience: 3,
        performance_score: 4.3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [
            { id: 'u2', employee_id: 'e2', project_id: 'p1', utilization_percent: 100, start_date: '2024-01-01', end_date: null, created_at: '', project: mockProjects.alpha as any }
        ],
        skills: [],
        certifications: [],
        utilization: 100
    },
    {
        id: 'e3',
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        entity_id: '2',
        employment_type: 'permanent',
        status: 'active',
        employee_code: 'EMP003',
        role: 'Tech Lead',
        specialization: 'Full Stack',
        experience: 8,
        performance_score: 4.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        utilization_data: [
            { id: 'u3', employee_id: 'e3', project_id: 'p2', utilization_percent: 100, start_date: '2024-03-01', end_date: null, created_at: '', project: mockProjects.beta as any }
        ],
        skills: [],
        certifications: [],
        utilization: 100
    },
    {
        id: 'e6',
        name: 'Diana Prince',
        email: 'diana.p@example.com',
        entity_id: '3',
        employment_type: 'permanent',
        status: 'active',
        role: 'Project Manager',
        specialization: 'Agile',
        experience: 10,
        performance_score: 4.9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '3', name: 'IITT', created_at: '' },
        utilization_data: [
            { id: 'u6', employee_id: 'e6', project_id: 'p3', utilization_percent: 25, start_date: '2024-02-15', end_date: null, created_at: '', project: mockProjects.gamma as any }
        ],
        skills: [],
        certifications: [],
        utilization: 25
    },
    {
        id: 'e10',
        name: 'Sarah Connor',
        email: 'sarah.c@example.com',
        entity_id: '1',
        employment_type: 'permanent',
        status: 'active',
        role: 'Security Specialist',
        specialization: 'Cybersecurity',
        experience: 7,
        performance_score: 92,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [
            { id: 'u10', employee_id: 'e10', project_id: 'p1', utilization_percent: 100, start_date: '2024-01-01', end_date: null, created_at: '', project: mockProjects.alpha as any }
        ],
        skills: [],
        certifications: [],
        utilization: 100
    },
    {
        id: 'e11',
        name: 'John Wick',
        email: 'john.w@example.com',
        entity_id: '2',
        employment_type: 'contractor',
        status: 'active',
        role: 'QA Engineer',
        specialization: 'Automation',
        experience: 6,
        performance_score: 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        utilization_data: [
            { id: 'u11', employee_id: 'e11', project_id: 'p2', utilization_percent: 100, start_date: '2024-03-01', end_date: null, created_at: '', project: mockProjects.beta as any }
        ],
        skills: [],
        certifications: [],
        utilization: 100
    },
    {
        id: 'e12',
        name: 'Michael Scott',
        email: 'michael.s@example.com',
        entity_id: '1',
        employment_type: 'permanent',
        status: 'active',
        role: 'Product Manager',
        specialization: 'Agile',
        experience: 9,
        performance_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [],
        skills: [],
        certifications: [],
        utilization: 60
    },
    {
        id: 'e13',
        name: 'Pam Beesly',
        email: 'pam.b@example.com',
        entity_id: '1',
        employment_type: 'permanent',
        status: 'active',
        role: 'UX Designer',
        specialization: 'UI/UX',
        experience: 4,
        performance_score: 88,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [],
        skills: [],
        certifications: [],
        utilization: 30
    },
    {
        id: 'e14',
        name: 'Jim Halpert',
        email: 'jim.h@example.com',
        entity_id: '2',
        employment_type: 'permanent',
        status: 'active',
        role: 'Sales Engineer',
        specialization: 'Solutions',
        experience: 5,
        performance_score: 91,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        utilization_data: [
            { id: 'u14', employee_id: 'e14', project_id: 'p2', utilization_percent: 45, start_date: '2024-03-01', end_date: null, created_at: '', project: mockProjects.beta as any }
        ],
        skills: [],
        certifications: [],
        utilization: 45
    },
    {
        id: 'e15',
        name: 'Dwight Schrute',
        email: 'dwight.s@example.com',
        entity_id: '3',
        employment_type: 'permanent',
        status: 'active',
        role: 'Data Analyst',
        specialization: 'Analytics',
        experience: 6,
        performance_score: 94,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '3', name: 'IITT', created_at: '' },
        utilization_data: [
            { id: 'u15', employee_id: 'e15', project_id: 'p3', utilization_percent: 70, start_date: '2024-02-15', end_date: null, created_at: '', project: mockProjects.gamma as any }
        ],
        skills: [],
        certifications: [],
        utilization: 70
    },
    {
        id: 'e16',
        name: 'Angela Martin',
        email: 'angela.m@example.com',
        entity_id: '3',
        employment_type: 'permanent',
        status: 'active',
        role: 'Accountant',
        specialization: 'Finance',
        experience: 8,
        performance_score: 96,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '3', name: 'IITT', created_at: '' },
        utilization_data: [],
        skills: [],
        certifications: [],
        utilization: 0
    }
];

// Fetch all employees with optional filters
export function useEmployees(filters?: EmployeeFilters) {
    return useQuery({
        queryKey: ['employees', filters],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            let data = [...mockEmployees];

            if (filters?.entity) {
                data = data.filter(e => e.entity_id === filters.entity);
            }
            if (filters?.employmentType) {
                data = data.filter(e => e.employment_type === filters.employmentType);
            }
            if (filters?.search) {
                data = data.filter(e => e.name.toLowerCase().includes(filters.search!.toLowerCase()));
            }

            return data;
        },
    });
}

// Fetch single employee by ID
export function useEmployee(id: string) {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            const employee = mockEmployees.find(e => e.id === id);

            if (employee) {
                return employee;
            }

            const { data, error } = await supabase
                .from('employees')
                .select(`
          *,
          entity:entities(id, name),
          utilization_data:allocations(*, utilization_percent:allocation_percent, project:projects(*)),
          employee_skills(*, skill:skills(*)),
          certifications(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Employee;
        },
        enabled: !!id,
    });
}

// Create employee
export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('employees')
                .insert(employee)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

// Update employee
export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
            const { data, error } = await supabase
                .from('employees')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
        },
    });
}

// Archive employee (soft delete)
export function useArchiveEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('employees')
                .update({ status: 'archived' })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

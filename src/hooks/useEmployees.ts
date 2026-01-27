import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Employee, EmployeeFilters } from '@/types';

// Mock Employees Data for consistent linking
export const mockEmployees: (Employee & { utilization: number })[] = [
    {
        id: 'e1',
        name: 'John Doe', // Project Alpha
        email: 'john.doe@example.com',
        entity_id: '1',
        employment_type: 'permanent',
        status: 'active',
        role: 'Senior Developer',
        specialization: 'Frontend',
        experience: 5,
        performance_score: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [],
        employee_skills: [],
        certifications: [],
        utilization: 50
    },
    {
        id: 'e2',
        name: 'Jane Smith', // Project Alpha
        email: 'jane.smith@example.com',
        entity_id: '1',
        employment_type: 'contractor',
        status: 'active',
        role: 'Backend Engineer',
        specialization: 'Node.js',
        experience: 3,
        performance_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [],
        employee_skills: [],
        certifications: [],
        utilization: 100
    },
    {
        id: 'e3',
        name: 'Alice Johnson', // Project Beta
        email: 'alice.j@example.com',
        entity_id: '2',
        employment_type: 'permanent',
        status: 'active',
        role: 'Tech Lead',
        specialization: 'Full Stack',
        experience: 8,
        performance_score: 95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        utilization_data: [],
        employee_skills: [],
        certifications: [],
        utilization: 100
    },
    {
        id: 'e6',
        name: 'Diana Prince', // Project Gamma
        email: 'diana.p@example.com',
        entity_id: '3',
        employment_type: 'permanent',
        status: 'active',
        role: 'Project Manager',
        specialization: 'Agile',
        experience: 10,
        performance_score: 98,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '3', name: 'IITT', created_at: '' },
        utilization_data: [],
        employee_skills: [],
        certifications: [],
        utilization: 25
    },
    { // Sarah Connors equivalent
        id: 'e10',
        name: 'Sarah Connor',
        email: 'sarah.c@example.com',
        entity_id: '1',
        employment_type: 'permanent',
        status: 'active',
        role: 'Security Specialist',
        specialization: 'Cybersecurity',
        performance_score: 92,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        utilization_data: [],
        employee_skills: [],
        certifications: [],
        utilization: 100
    },
    { // John Wick equivalent
        id: 'e11',
        name: 'John Wick',
        email: 'john.w@example.com',
        entity_id: '2',
        employment_type: 'contractor',
        status: 'active',
        role: 'QA Engineer',
        specialization: 'Automation',
        performance_score: 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        utilization_data: [],
        employee_skills: [],
        certifications: [],
        utilization: 100
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

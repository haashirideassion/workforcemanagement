import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Employee, EmployeeFilters } from '@/types';

// Fetch all employees with optional filters
export function useEmployees(filters?: EmployeeFilters) {
    return useQuery({
        queryKey: ['employees', filters],
        queryFn: async () => {
            let query = supabase
                .from('employees')
                .select(`
          *,
          entity:entities(id, name),
          allocations(id, allocation_percent, start_date, end_date, project:projects(id, name))
        `)
                .eq('status', 'active')
                .order('name');

            if (filters?.entity) {
                query = query.eq('entity_id', filters.entity);
            }
            if (filters?.employmentType) {
                query = query.eq('employment_type', filters.employmentType);
            }
            if (filters?.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Calculate utilization for each employee
            return data.map((emp) => {
                const today = new Date().toISOString().split('T')[0];
                const activeAllocations = emp.allocations?.filter(
                    (a: { start_date: string; end_date: string | null }) =>
                        a.start_date <= today && (!a.end_date || a.end_date >= today)
                ) || [];
                const utilization = activeAllocations.reduce(
                    (sum: number, a: { allocation_percent: number }) => sum + a.allocation_percent,
                    0
                );
                return { ...emp, utilization: Math.min(utilization, 100) };
            }) as (Employee & { utilization: number })[];
        },
    });
}

// Fetch single employee by ID
export function useEmployee(id: string) {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employees')
                .select(`
          *,
          entity:entities(id, name),
          allocations(*, project:projects(*)),
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

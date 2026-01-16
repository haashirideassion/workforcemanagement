import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Allocation } from '@/types';

// Fetch allocations for an employee
export function useEmployeeAllocations(employeeId: string) {
    return useQuery({
        queryKey: ['allocations', 'employee', employeeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('allocations')
                .select(`
          *,
          project:projects(id, name, status, start_date, end_date)
        `)
                .eq('employee_id', employeeId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            return data as Allocation[];
        },
        enabled: !!employeeId,
    });
}

// Fetch allocations for a project
export function useProjectAllocations(projectId: string) {
    return useQuery({
        queryKey: ['allocations', 'project', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('allocations')
                .select(`
          *,
          employee:employees(id, name, email, entity:entities(name))
        `)
                .eq('project_id', projectId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            return data as Allocation[];
        },
        enabled: !!projectId,
    });
}

// Create allocation
export function useCreateAllocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (allocation: Omit<Allocation, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('allocations')
                .insert(allocation)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', variables.employee_id] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.project_id] });
        },
    });
}

// Update allocation
export function useUpdateAllocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Allocation> & { id: string }) => {
            const { data, error } = await supabase
                .from('allocations')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

// Delete allocation
export function useDeleteAllocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('allocations')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

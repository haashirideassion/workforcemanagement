import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Utilization } from '@/types';

// Fetch utilization for an employee
export function useEmployeeUtilization(employeeId: string) {
    return useQuery({
        queryKey: ['utilization', 'employee', employeeId],
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
            return data.map((d: any) => ({
                ...d,
                utilization_percent: d.allocation_percent
            })) as Utilization[];
        },
        enabled: !!employeeId,
    });
}

// Fetch utilization for a project
export function useProjectUtilization(projectId: string) {
    return useQuery({
        queryKey: ['utilization', 'project', projectId],
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
            return data.map((d: any) => ({
                ...d,
                utilization_percent: d.allocation_percent
            })) as Utilization[];
        },
        enabled: !!projectId,
    });
}

// Create utilization
export function useCreateUtilization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (utilization: Omit<Utilization, 'id' | 'created_at'>) => {
            // Map utilization_percent back to allocation_percent for DB
            const dbPayload = {
                ...utilization,
                allocation_percent: utilization.utilization_percent
            };
            // remove utilization_percent if it exists in payload
            if ('utilization_percent' in dbPayload) delete (dbPayload as any).utilization_percent;

            const { data, error } = await supabase
                .from('allocations')
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['utilization'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee', variables.employee_id] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.project_id] });
        },
    });
}

// Update utilization
export function useUpdateUtilization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Utilization> & { id: string }) => {
            const dbUpdates: any = { ...updates };
            if (updates.utilization_percent !== undefined) {
                dbUpdates.allocation_percent = updates.utilization_percent;
                delete dbUpdates.utilization_percent;
            }

            const { data, error } = await supabase
                .from('allocations')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['utilization'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

// Delete utilization
export function useDeleteUtilization() {
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
            queryClient.invalidateQueries({ queryKey: ['utilization'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

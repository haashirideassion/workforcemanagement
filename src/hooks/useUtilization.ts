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
            const dbPayload: any = {
                ...utilization,
                allocation_percent: utilization.utilization_percent
            };
            // remove utilization_percent if it exists in payload
            if ('utilization_percent' in dbPayload) delete dbPayload.utilization_percent;
            
            // Remove computed/UI-only fields that shouldn't be stored
            delete dbPayload.employee;
            delete dbPayload.project;
            delete dbPayload.type;
            delete dbPayload.utilization_percent;

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
            const dbUpdates: any = {};
            
            // Map utilization_percent to allocation_percent for DB
            if (updates.utilization_percent !== undefined) {
                dbUpdates.allocation_percent = updates.utilization_percent;
            }
            
            // Allow status and role to be updated
            if (updates.status !== undefined) {
                dbUpdates.status = updates.status;
            }
            if (updates.role !== undefined) {
                dbUpdates.role = updates.role;
            }
            
            // Remove computed/UI-only fields
            delete dbUpdates.type;
            delete dbUpdates.employee;
            delete dbUpdates.project;

            const { data, error } = await supabase
                .from('allocations')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            
            // Handle 204 No Content - return the ID so we know the update succeeded
            return data || { id };
        },
        onSuccess: (updatedData) => {
            queryClient.invalidateQueries({ queryKey: ['utilization'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            if (updatedData?.project_id) {
                queryClient.invalidateQueries({ queryKey: ['project', updatedData.project_id] });
            }
            if (updatedData?.employee_id) {
                queryClient.invalidateQueries({ queryKey: ['employee', updatedData.employee_id] });
            }
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
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['employee'] });
        },
    });
}

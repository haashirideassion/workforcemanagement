import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectFilters } from '@/types';

// Helper to transform DB result to Project type
const transformProject = (data: any): Project & { teamSize: number; progress: number } => {
    const allocations = data.allocations || [];
    const teamSize = new Set(allocations.map((a: any) => a.employee_id)).size;
    
    // Calculate progress or utilization
    // Mock had "progress" as a specific field, maybe it was manual?
    // Or derived from time elapsed? 
    // Let's derive it from time elapsed if end_date exists
    let progress = 0;
    if (data.start_date && data.end_date && data.status === 'active') {
        const start = new Date(data.start_date).getTime();
        const end = new Date(data.end_date).getTime();
        const now = new Date().getTime();
        const total = end - start;
        const elapsed = now - start;
        if (total > 0) {
            progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
        }
    } else if (data.status === 'completed') {
        progress = 100;
    }

    return {
        id: data.id,
        name: data.name,
        entity_id: data.entity_id,
        account_id: data.account_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        description: data.description, // Added description if it exists in DB
        // Computed/Joined fields
        entity: data.entity,
        account: data.account,
        utilization: allocations, // structure matches Utilization type roughly?
        teamSize,
        progress
    };
};

export function useProjects(filters?: ProjectFilters) {
    return useQuery({
        queryKey: ['projects', filters],
        queryFn: async () => {
            let query = supabase
                .from('projects')
                .select(`
                    *,
                    entity:entities(id, name),
                    account:accounts(id, name),
                    allocations(*, utilization_percent:allocation_percent, employee:employees(id, name, role, employment_type))
                `)
                .order('name');

            if (filters?.entity) {
                query = query.eq('entity_id', filters.entity);
            }
            if (filters?.accountId) {
                query = query.eq('account_id', filters.accountId);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return (data || []).map(transformProject);
        },
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    entity:entities(id, name),
                    account:accounts(id, name),
                    allocations(
                        *,
                        utilization_percent:allocation_percent,
                        employee:employees(*)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return transformProject(data);
        },
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
            // Remove computed fields before insert
            const { entity, account, utilization, teamSize, progress, ...dbPayload } = project as any;
            
            const { data, error } = await supabase
                .from('projects')
                .insert(dbPayload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
             // Remove computed fields before update
            const { entity, account, utilization, teamSize, progress, created_at, updated_at, ...dbPayload } = updates as any;

            const { data, error } = await supabase
                .from('projects')
                .update(dbPayload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (updatedProject) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
            
            // Invalidate employees as project status changes affect utilization
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employee'] });
        },
    });
}


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectFilters } from '@/types';

// Fetch all projects with optional filters
export function useProjects(filters?: ProjectFilters) {
    return useQuery({
        queryKey: ['projects', filters],
        queryFn: async () => {
            let query = supabase
                .from('projects')
                .select(`
          *,
          entity:entities(id, name),
          allocations(id, allocation_percent, employee:employees(id, name))
        `)
                .order('created_at', { ascending: false });

            if (filters?.entity) {
                query = query.eq('entity_id', filters.entity);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Calculate team size and progress for each project
            return data.map((project) => {
                const teamSize = project.allocations?.length || 0;
                let progress = 0;
                if (project.start_date && project.end_date) {
                    const start = new Date(project.start_date).getTime();
                    const end = new Date(project.end_date).getTime();
                    const now = Date.now();
                    progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
                }
                return { ...project, teamSize, progress };
            }) as (Project & { teamSize: number; progress: number })[];
        },
    });
}

// Fetch single project by ID
export function useProject(id: string) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          entity:entities(id, name),
          allocations(*, employee:employees(*))
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Project;
        },
        enabled: !!id,
    });
}

// Create project
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('projects')
                .insert(project)
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

// Update project
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
        },
    });
}

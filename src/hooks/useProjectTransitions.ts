import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProjectTransition } from '@/types';

// Fetch project history for an employee
export function useProjectHistory(employeeId: string) {
    return useQuery({
        queryKey: ['projectHistory', employeeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('project_transitions')
                .select(`
                    *,
                    project:projects(id, name, account_id),
                    comments:transition_comments(*)
                `)
                .eq('employee_id', employeeId)
                .order('end_date', { ascending: false, nullsFirst: false });

            if (error) throw error;
            return (data || []) as ProjectTransition[];
        },
        enabled: !!employeeId,
    });
}

// Create project transition (when removing from project)
export function useCreateProjectTransition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transition: Omit<ProjectTransition, 'id' | 'created_at' | 'updated_at'>) => {
            // Calculate duration if end_date provided
            let durationDays = transition.duration_days;
            if (transition.start_date && transition.end_date) {
                const start = new Date(transition.start_date);
                const end = new Date(transition.end_date);
                durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            }

            const { data, error } = await supabase
                .from('project_transitions')
                .insert({
                    ...transition,
                    duration_days: durationDays,
                    status: 'completed'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['projectHistory', data.employee_id] });
            queryClient.invalidateQueries({ queryKey: ['employee', data.employee_id] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

// Add comment to transition
export function useAddTransitionComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ transitionId, commentBy, commentText }: { transitionId: string; commentBy: string; commentText: string }) => {
            const { data, error } = await supabase
                .from('transition_comments')
                .insert({
                    transition_id: transitionId,
                    comment_by: commentBy,
                    comment_text: commentText
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Refetch the project history to get updated comments
            queryClient.invalidateQueries({ queryKey: ['projectHistory'] });
        },
    });
}

// Delete transition comment
export function useDeleteTransitionComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId: string) => {
            const { error } = await supabase
                .from('transition_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectHistory'] });
        },
    });
}

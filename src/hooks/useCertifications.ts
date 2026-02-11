import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Certification } from '@/types';

// Fetch certifications for an employee
// Note: Usually fetched via useEmployee but separate fetch can be useful
export function useCertifications(employeeId: string) {
    return useQuery({
        queryKey: ['certifications', employeeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('certifications')
                .select('*')
                .eq('employee_id', employeeId)
                .order('valid_until', { ascending: false });

            if (error) throw error;
            return data as Certification[];
        },
        enabled: !!employeeId,
    });
}

// Create certification
export function useCreateCertification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (certification: Omit<Certification, 'id'>) => {
            const { data, error } = await supabase
                .from('certifications')
                .insert(certification)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['certifications', variables.employee_id] });
            queryClient.invalidateQueries({ queryKey: ['employee', variables.employee_id] });
        },
    });
}

// Delete certification
export function useDeleteCertification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('certifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: (_id, _variables) => {
             // We don't have employee_id easily here without passing it or refetching all
             // Invalidating 'employee' might be tricky if we don't know the ID
             // But we can invalidate all 'employee' queries or just rely on 'certifications' if used
             queryClient.invalidateQueries({ queryKey: ['employee'] }); 
             // Ideally we pass employeeId in mutation context or variables
        },
    });
}

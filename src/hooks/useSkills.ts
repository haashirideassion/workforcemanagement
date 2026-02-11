import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Skill, EmployeeSkill } from '@/types';

// Fetch all skills with employee counts
export function useSkills() {
    return useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('skills')
                .select(`
          *,
          employee_skills(employee_id)
        `)
                .order('name');

            if (error) throw error;

            return data.map((skill) => ({
                ...skill,
                employeeCount: skill.employee_skills?.length || 0,
                gap: (skill.employee_skills?.length || 0) < 5, // Consider <5 employees as a gap
            })) as (Skill & { employeeCount: number; gap: boolean })[];
        },
    });
}

// Fetch skills for an employee
export function useEmployeeSkills(employeeId: string) {
    return useQuery({
        queryKey: ['skills', 'employee', employeeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employee_skills')
                .select(`
          *,
          skill:skills(id, name, category)
        `)
                .eq('employee_id', employeeId);

            if (error) throw error;
            return data as EmployeeSkill[];
        },
        enabled: !!employeeId,
    });
}

// Find employees by skill
export function useEmployeesBySkill(skillId: string) {
    return useQuery({
        queryKey: ['employees', 'skill', skillId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employee_skills')
                .select(`
          proficiency,
          is_primary,
          employee:employees(
            id, name, email, status,
            entity:entities(name),
            allocations(allocation_percent, start_date, end_date)
          )
        `)
                .eq('skill_id', skillId);

            if (error) throw error;

            // Calculate availability for each employee
            const today = new Date().toISOString().split('T')[0];
            return data.map((item) => {
                const empArray = item.employee as {
                    id: string;
                    name: string;
                    allocations?: { allocation_percent: number; start_date: string; end_date: string | null }[];
                }[] | null;
                const emp = empArray?.[0];
                if (!emp) return { ...item, employee: null };

                const activeAllocations = emp.allocations?.filter(
                    (a) => a.start_date <= today && (!a.end_date || a.end_date >= today)
                ) || [];
                const utilization = activeAllocations.reduce((sum, a) => sum + a.allocation_percent, 0);
                return {
                    ...item,
                    employee: { ...emp, utilization, available: utilization < 100 },
                };
            });
        },
        enabled: !!skillId,
    });
}

// Add skill to employee
export function useAddEmployeeSkill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<EmployeeSkill, 'skill' | 'employee'>) => {
            const { error } = await supabase
                .from('employee_skills')
                .insert(data);

            if (error) throw error;
            return data;
        },
        onSuccess: (newData) => {
            // Update the employee's skills list
            queryClient.setQueryData(['skills', 'employee', newData.employee_id], (old: any) => {
                if (!old) return [newData];
                return [...old, newData];
            });
            // Update individual employee cache if needed
            queryClient.invalidateQueries({ queryKey: ['employee', newData.employee_id] });
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
}

// Create skill
export function useCreateSkill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (skill: Omit<Skill, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('skills')
                .insert(skill)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (newSkill) => {
            queryClient.setQueryData(['skills'], (old: any) => {
                const formattedSkill = {
                    ...newSkill,
                    employeeCount: 0,
                    gap: true,
                };
                if (!old) return [formattedSkill];
                return [...old, formattedSkill];
            });
        },
    });
}

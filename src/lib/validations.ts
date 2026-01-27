import { z } from 'zod';

// Employee form schema
export const employeeFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    entity_id: z.string().min(1, 'Please select an entity'),
    employment_type: z.enum(['permanent', 'retainer']),
    performance_score: z.coerce
        .number()
        .min(0, 'Score must be at least 0')
        .max(10, 'Score must be at most 10')
        .optional()
        .nullable(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

// Project form schema
export const projectFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    entity_id: z.string().min(1, 'Please select an entity'),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    status: z.enum(['active', 'completed', 'on-hold']),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Utilization form schema
export const utilizationFormSchema = z.object({
    employee_id: z.string().min(1, 'Please select an employee'),
    project_id: z.string().min(1, 'Please select a project'),
    utilization_percent: z.coerce
        .number()
        .min(1, 'Utilization must be at least 1%')
        .max(100, 'Utilization cannot exceed 100%'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
});

export type UtilizationFormValues = z.infer<typeof utilizationFormSchema>;

// Skill form schema
export const skillFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category: z.string().optional(),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;

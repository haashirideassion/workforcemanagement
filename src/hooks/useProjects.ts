import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectFilters } from '@/types';

const mockProjects: (Project & { teamSize: number; progress: number })[] = [
    {
        id: '1',
        name: 'Project Alpha', // Active
        entity_id: '1',
        account_id: '1', // Acme Corporation
        start_date: '2025-01-01',
        end_date: '2026-03-31',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        teamSize: 2,
        progress: 65,
        utilization: [
            {
                id: 'u1',
                employee_id: 'e1',
                project_id: '1',
                utilization_percent: 50,
                start_date: '2025-01-10',
                end_date: null,
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e1',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    entity_id: '1',
                    employment_type: 'permanent',
                    status: 'active',
                    role: 'Senior Developer',
                    specialization: 'Frontend',
                    performance_score: 90,
                    created_at: '',
                    updated_at: ''
                }
            },
            {
                id: 'u2',
                employee_id: 'e2',
                project_id: '1',
                utilization_percent: 100,
                start_date: '2025-01-15',
                end_date: '2025-12-31',
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e2',
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    entity_id: '1',
                    employment_type: 'contractor',
                    status: 'active',
                    role: 'Backend Engineer',
                    specialization: 'Node.js',
                    performance_score: 85,
                    created_at: '',
                    updated_at: ''
                }
            }
        ]
    },
    {
        id: '2',
        name: 'Project Beta', // Active
        entity_id: '2',
        account_id: '2', // TechStart Inc
        start_date: '2025-02-01',
        end_date: '2026-02-28',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        teamSize: 3,
        progress: 70,
        utilization: [
            {
                id: 'u3',
                employee_id: 'e3',
                project_id: '2',
                utilization_percent: 100,
                start_date: '2025-02-01',
                end_date: null,
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e3',
                    name: 'Alice Johnson',
                    email: 'alice.j@example.com',
                    entity_id: '2',
                    employment_type: 'permanent',
                    status: 'active',
                    role: 'Tech Lead',
                    specialization: 'Full Stack',
                    performance_score: 95,
                    created_at: '',
                    updated_at: ''
                }
            },
            {
                id: 'u4',
                employee_id: 'e4',
                project_id: '2',
                utilization_percent: 50,
                start_date: '2025-02-15',
                end_date: '2025-08-30',
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e4',
                    name: 'Bob Williams',
                    email: 'bob.w@example.com',
                    entity_id: '2',
                    employment_type: 'permanent',
                    status: 'active',
                    role: 'UI Designer',
                    specialization: 'Design Systems',
                    performance_score: 88,
                    created_at: '',
                    updated_at: ''
                }
            },
            {
                id: 'u5',
                employee_id: 'e5',
                project_id: '2',
                utilization_percent: 75,
                start_date: '2025-03-01',
                end_date: null,
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e5',
                    name: 'Charlie Brown',
                    email: 'charlie.b@example.com',
                    entity_id: '2',
                    employment_type: 'contractor',
                    status: 'active',
                    role: 'DevOps Engineer',
                    specialization: 'AWS',
                    performance_score: 92,
                    created_at: '',
                    updated_at: ''
                }
            }
        ]
    },
    {
        id: '3',
        name: 'Project Gamma', // On Hold
        entity_id: '3',
        account_id: '3', // Global Finance Ltd
        start_date: '2024-11-01',
        end_date: '2026-04-30',
        status: 'on-hold',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '3', name: 'IITT', created_at: '' },
        teamSize: 1,
        progress: 61,
        utilization: [
            {
                id: 'u6',
                employee_id: 'e6',
                project_id: '3',
                utilization_percent: 25,
                start_date: '2024-11-01',
                end_date: null,
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e6',
                    name: 'Diana Prince',
                    email: 'diana.p@example.com',
                    entity_id: '3',
                    employment_type: 'permanent',
                    status: 'active',
                    role: 'Project Manager',
                    specialization: 'Agile',
                    performance_score: 98,
                    created_at: '',
                    updated_at: ''
                }
            }
        ]
    },
    {
        id: '4',
        name: 'Project Delta', // Completed
        entity_id: '1',
        account_id: '7', // CloudNine Systems
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '1', name: 'ITS', created_at: '' },
        teamSize: 0,
        progress: 100,
        utilization: []
    },
    {
        id: '5',
        name: 'Project Epsilon', // Proposal (Future)
        entity_id: '2',
        account_id: '5', // RetailMax
        start_date: '2026-06-01',
        end_date: '2026-12-31',
        status: 'proposal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '2', name: 'IBCC', created_at: '' },
        teamSize: 0,
        progress: 0,
        utilization: []
    },
    {
        id: '6',
        name: 'Project Zeta', // Active
        entity_id: '3',
        account_id: '6', // EduLearn Platform
        start_date: '2025-03-01',
        end_date: '2026-06-30',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entity: { id: '3', name: 'IITT', created_at: '' },
        teamSize: 1,
        progress: 14,
        utilization: [
            {
                id: 'u7',
                employee_id: 'e7',
                project_id: '6',
                utilization_percent: 50,
                start_date: '2025-03-01',
                end_date: null,
                created_at: new Date().toISOString(),
                employee: {
                    id: 'e7',
                    name: 'Evan Wright',
                    email: 'evan.w@example.com',
                    entity_id: '3',
                    employment_type: 'intern',
                    status: 'active',
                    role: 'Junior Developer',
                    specialization: 'Python',
                    performance_score: 80,
                    created_at: '',
                    updated_at: ''
                }
            }
        ]
    }
];

// Fetch all projects with optional filters
export function useProjects(filters?: ProjectFilters) {
    return useQuery({
        queryKey: ['projects', filters],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            let data = [...mockProjects];

            // Auto-update status based on date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            data = data.map(p => {
                if (p.status === 'proposal' && p.start_date) {
                    const startDate = new Date(p.start_date);
                    if (startDate <= today) {
                        return { ...p, status: 'active' };
                    }
                }
                return p;
            });

            if (filters?.entity) {
                data = data.filter(p => p.entity_id === filters.entity);
            }
            if (filters?.accountId) {
                data = data.filter(p => p.account_id === filters.accountId);
            }
            if (filters?.status) {
                data = data.filter(p => p.status === filters.status);
            }
            if (filters?.search) {
                data = data.filter(p => p.name.toLowerCase().includes(filters.search!.toLowerCase()));
            }

            return data;
        },
    });
}

// Fetch single project by ID
export function useProject(id: string) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            const project = mockProjects.find(p => p.id === id);

            if (!project) {
                // Try to fallback to Supabase if not found in mock (optional, but requested "refer original code", original used Supabase.
                // However, user said "fix it", implying make it work.
                // I will try to fetch from Supabase if not in mock, or just return mock result.
                // Since lists are purely mock, detail should be mock-first.

                // Let's return the mock project. If undefined, we can try supabase or throw.
                // Given the context is "mock list", likely the detail should be "mock detail".
            }

            if (project) {
                return project;
            }

            // Fallback to Supabase for real data if needed
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          entity:entities(id, name),
          utilization:allocations(*, utilization_percent:allocation_percent, employee:employees(*))
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

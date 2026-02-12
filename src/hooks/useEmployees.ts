import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Employee, EmployeeFilters } from '@/types';

// Helper to calculate bench duration and status
export function calculateBenchStatus(employee: any) {
    const utilization = employee.utilization || 0;
    
    // Use bench_start_date if available, otherwise use created_at
    const startDate = employee.bench_start_date 
        ? new Date(employee.bench_start_date) 
        : (employee.created_at ? new Date(employee.created_at) : new Date());
    
    const benchDays = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (utilization === 0) {
        if (benchDays > 30) {
            return {
                status: 'layoff-consideration',
                label: 'Layoff Consideration',
                benchDays,
                severity: 'critical'
            };
        }
        if (benchDays > 0) {
            return {
                status: 'at-risk',
                label: 'At Risk',
                benchDays,
                severity: 'warning'
            };
        }
    }

    if (utilization > 0 && utilization < 50 && benchDays === 0) {
        return {
            status: 'review-required',
            label: 'Review Required',
            benchDays,
            severity: 'info'
        };
    }

    return {
        status: 'healthy',
        label: 'Healthy',
        benchDays,
        severity: 'success'
    };
}

// Helper to calculate utilization from active allocations
export function calculateUtilization(allocations: any[] = [], referenceDate: Date = new Date()): number {
    if (!allocations || allocations.length === 0) return 0;
    
    const dayStr = referenceDate.toISOString().split('T')[0];
    
    const activeAllocations = allocations.filter(a => {
        // 1. Basic Date Check for the Allocation itself
        const startDate = a.start_date;
        const endDate = a.end_date;
        
        const isDateActive = startDate && startDate <= dayStr && (!endDate || endDate >= dayStr);
        if (!isDateActive) return false;

        // 2. Project Status Check
        const project = a.project;
        const projectStatus = typeof project === 'object' ? project?.status : project;
        
        const isProjectActive = projectStatus === 'active';
        const isProjectOnHold = projectStatus === 'on-hold';
        
        if (isProjectActive) return true;
        
        if (isProjectOnHold) {
            const updatedAt = project?.updated_at ? new Date(project.updated_at) : null;
            if (!updatedAt) return true; // fallback if no updated_at
            
            const diffDays = Math.ceil((referenceDate.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }
        
        return false;
    });

    const total = activeAllocations.reduce((sum, a) => sum + (Number(a.utilization_percent || a.allocation_percent) || 0), 0);
    return Math.min(100, Math.round(total));
}

// Fetch all employees with optional filters
export function useEmployees(filters?: EmployeeFilters) {
    return useQuery({
        queryKey: ['employees', filters],
        queryFn: async () => {
            let query = supabase
                .from('employees')
                .select(`
                    *,
                    entity:entities(id, name),
                    utilization_data:allocations(*, utilization_percent:allocation_percent, project:projects(*))
                `)
                .order('name');

            if (filters?.entity) {
                query = query.eq('entity_id', filters.entity);
            }
            if (filters?.employmentType) {
                query = query.eq('employment_type', filters.employmentType);
            }
            if (filters?.search) {
                query = query.ilike('name', `%${filters.search}%`);
            }
            if (filters?.utilizationStatus === 'available') {
                // In-memory filtering if needed or specialized handling
            }

            const { data, error } = await query;

            if (error) throw error;

            return (data as any[]).map(emp => {
                const utilization = calculateUtilization(emp.utilization_data);
                const benchStatus = calculateBenchStatus({ ...emp, utilization });
                return {
                    ...emp,
                    utilization,
                    bench_status: benchStatus.status
                };
            }) as Employee[];
        },
    });
}

// Fetch single employee by ID
export function useEmployee(id: string) {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            const { data, error } = await supabase
                .from('employees')
                .select(`
          *,
          entity:entities(id, name),
          utilization_data:allocations(*, utilization_percent:allocation_percent, project:projects(*)),
          employee_skills(*, skill:skills(*)),
          certifications(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            const emp = data as Employee;
            const utilization = calculateUtilization(emp.utilization_data);
            const benchStatus = calculateBenchStatus({ ...emp, utilization });
            return {
                ...emp,
                utilization,
                bench_status: benchStatus.status
            };
        },
        enabled: !!id,
    });
}

// Create employee
export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
            try {
                // Sanitize input: remove derived/computed fields
                const {
                    utilization,
                    utilization_data,
                    entity,
                    employee_skills,
                    certifications,
                    skills,
                    bench_status,
                    ...dbPayload
                } = employee as any;

                const { data, error } = await supabase
                    .from('employees')
                    .insert(dbPayload)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (err) {
                console.error('Supabase insert failed:', err);
                throw err;
            }
        },
        onSuccess: (newEmployee) => {
            // Update the employees list cache for all active filters
            queryClient.setQueriesData<Employee[]>({ queryKey: ['employees'] }, (old) => {
                if (!old) return [newEmployee];
                return [newEmployee, ...old];
            });
            // Optional: Also invalidate to be safe, but setQueriesData handles immediate UI update
            // queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

// Update employee
export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
            try {
                // Sanitize input: remove derived/computed fields
                const {
                    utilization,
                    utilization_data,
                    entity,
                    employee_skills,
                    certifications,
                    skills,
                    bench_status,
                    created_at,
                    updated_at,
                    ...dbPayload
                } = updates as any;

                const { data, error } = await supabase
                    .from('employees')
                    .update(dbPayload)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (err) {
                console.error('Supabase update failed:', err);
                throw err;
            }
        },
        onSuccess: (updatedEmployee) => {
            // Update list cache
            queryClient.setQueriesData<Employee[]>({ queryKey: ['employees'] }, (old) => {
                if (!old) return [];
                return old.map(emp => emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp);
            });
            // Update individual employee cache
            queryClient.setQueryData(['employee', updatedEmployee.id], updatedEmployee);
        },
    });
}

// Archive employee (soft delete)
export function useArchiveEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('employees')
                .update({ status: 'archived' })
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            // Update list cache by removing the archived employee or updating its status
            queryClient.setQueriesData<Employee[]>({ queryKey: ['employees'] }, (old) => {
                if (!old) return [];
                // If the UI filters out archived ones, we remove it. 
                // Currently fetching "active" usually.
                return old.filter(emp => emp.id !== id);
            });
            // Update individual cache
            queryClient.setQueryData(['employee', id], (old: any) => old ? { ...old, status: 'archived' } : old);
        },
    });
}
// Update employee allocations
export function useUpdateEmployeeAllocations() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ employeeId, allocations }: { employeeId: string, allocations: any[] }) => {
            // Transaction-like behavior: delete existing and insert new
            // Note: Since this is a simple app, we'll do them sequentially. 
            // Better would be a RPC call for atomic transaction.
            
            // 1. Delete existing allocations for this employee
            const { error: deleteError } = await supabase
                .from('allocations')
                .delete()
                .eq('employee_id', employeeId);
            
            if (deleteError) throw deleteError;

            // 2. Insert new allocations
            if (allocations.length > 0) {
                const insertPayload = allocations
                    .map(a => {
                        const percent = parseInt(a.utilization_percent?.toString() || '0', 10);
                        // Build payload with all valid allocation fields
                        const payload: any = {
                            employee_id: employeeId,
                            project_id: a.project_id || a.projectId,
                            allocation_percent: percent,
                            start_date: a.start_date || new Date().toISOString().split('T')[0],
                        };
                        
                        // Include optional fields if they exist
                        if (a.status) payload.status = a.status;
                        if (a.role) payload.role = a.role;
                        if (a.end_date) payload.end_date = a.end_date;
                        
                        return payload;
                    })
                    // Filter out allocations with allocation_percent < 0 or > 100
                    .filter(a => a.allocation_percent >= 0 && a.allocation_percent <= 100);

                if (insertPayload.length > 0) {
                    const { error: insertError } = await supabase
                        .from('allocations')
                        .insert(insertPayload);
                    
                    if (insertError) throw insertError;
                }
            }

            return { success: true };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
    });
}

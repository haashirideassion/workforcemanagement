import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Entity } from '@/types';

// Fetch all entities
export function useEntities() {
    return useQuery({
        queryKey: ['entities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('entities')
                .select('*')
                .order('name');

            if (error) throw error;
            return data as Entity[];
        },
    });
}

// Fetch dashboard KPIs
export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: async () => {
            // Get total employees count
            const { count: totalEmployees } = await supabase
                .from('employees')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Get active projects count
            const { count: activeProjects } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Get employees with their allocations to calculate bench
            const { data: employeesWithAllocations } = await supabase
                .from('employees')
                .select(`
          id,
          allocations(allocation_percent, start_date, end_date)
        `)
                .eq('status', 'active');

            const today = new Date().toISOString().split('T')[0];
            let benchCount = 0;

            employeesWithAllocations?.forEach((emp) => {
                const activeAllocations = emp.allocations?.filter(
                    (a: { start_date: string; end_date: string | null }) =>
                        a.start_date <= today && (!a.end_date || a.end_date >= today)
                ) || [];
                const utilization = activeAllocations.reduce(
                    (sum: number, a: { allocation_percent: number }) => sum + a.allocation_percent,
                    0
                );
                if (utilization < 50) benchCount++;
            });

            const benchPercentage = totalEmployees ? Math.round((benchCount / totalEmployees) * 100) : 0;

            // Calculate alerts (employees at risk)
            const alertsCount = benchCount;

            return {
                totalEmployees: totalEmployees || 0,
                benchPercentage,
                activeProjects: activeProjects || 0,
                alertsCount,
            };
        },
    });
}

// Fetch utilization by entity
export function useUtilizationByEntity() {
    return useQuery({
        queryKey: ['dashboard', 'utilization'],
        queryFn: async () => {
            const { data: employees } = await supabase
                .from('employees')
                .select(`
          id,
          entity:entities(name),
          allocations(allocation_percent, start_date, end_date)
        `)
                .eq('status', 'active');

            const today = new Date().toISOString().split('T')[0];
            const entityStats: Record<string, { healthy: number; watch: number; risk: number }> = {};

            employees?.forEach((emp) => {
                const entityData = emp.entity as { name: string }[] | null;
                const entityName = entityData?.[0]?.name || 'Unknown';
                if (!entityStats[entityName]) {
                    entityStats[entityName] = { healthy: 0, watch: 0, risk: 0 };
                }

                const activeAllocations = emp.allocations?.filter(
                    (a: { start_date: string; end_date: string | null }) =>
                        a.start_date <= today && (!a.end_date || a.end_date >= today)
                ) || [];
                const utilization = activeAllocations.reduce(
                    (sum: number, a: { allocation_percent: number }) => sum + a.allocation_percent,
                    0
                );

                if (utilization >= 80) entityStats[entityName].healthy++;
                else if (utilization >= 50) entityStats[entityName].watch++;
                else entityStats[entityName].risk++;
            });

            return Object.entries(entityStats).map(([entity, stats]) => ({
                entity,
                ...stats,
            }));
        },
    });
}

// Fetch upcoming releases (projects ending in next 14 days)
export function useUpcomingReleases() {
    return useQuery({
        queryKey: ['dashboard', 'releases'],
        queryFn: async () => {
            const today = new Date();
            const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

            const { data } = await supabase
                .from('allocations')
                .select(`
          end_date,
          employee:employees(name),
          project:projects(name)
        `)
                .gte('end_date', today.toISOString().split('T')[0])
                .lte('end_date', twoWeeksLater.toISOString().split('T')[0])
                .order('end_date');

            return data?.map((item) => {
                const empData = item.employee as { name: string }[] | null;
                const projData = item.project as { name: string }[] | null;
                return {
                    employee: empData?.[0]?.name || 'Unknown',
                    project: projData?.[0]?.name || 'Unknown',
                    endDate: item.end_date,
                };
            }) || [];
        },
    });
}

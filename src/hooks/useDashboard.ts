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
// Mock Account Metric Data
export interface AccountMetric {
    id: string;
    name: string;
    headcountChange: number; // positive = increase, negative = decrease
    totalCount: number;
}

const mockAccountMetrics: AccountMetric[] = [
    { id: '1', name: 'Acme Corp', headcountChange: 5, totalCount: 12 },
    { id: '2', name: 'TechStart', headcountChange: -2, totalCount: 8 },
    { id: '3', name: 'Global Finance', headcountChange: 3, totalCount: 15 },
    { id: '5', name: 'RetailMax', headcountChange: 0, totalCount: 6 },
    { id: '7', name: 'CloudNine', headcountChange: -1, totalCount: 10 },
];

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

            // Get employees with their utilization to calculate bench
            const { data: employeesWithUtilization } = await supabase
                .from('employees')
                .select(`
          id,
          utilization_data:allocations(utilization_percent:allocation_percent, start_date, end_date)
        `)
                .eq('status', 'active');

            const today = new Date().toISOString().split('T')[0];
            let benchCount = 0;

            employeesWithUtilization?.forEach((emp: any) => {
                const activeUtilizations = emp.utilization_data?.filter(
                    (a: { start_date: string; end_date: string | null }) =>
                        a.start_date <= today && (!a.end_date || a.end_date >= today)
                ) || [];
                const utilization = activeUtilizations.reduce(
                    (sum: number, a: { utilization_percent: number }) => sum + a.utilization_percent,
                    0
                );
                if (utilization < 50) benchCount++;
            });


            // Mock historical data generation (Last 3 months)
            // In a real app, this would come from a 'metrics_history' table
            const generateHistory = (baseValue: number, volatility: number) => {
                const history = [];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; // Example months
                const currentMonthIdx = new Date().getMonth();

                for (let i = 2; i >= 0; i--) {
                    // Random variation for mock history
                    const variation = (Math.random() - 0.5) * volatility;
                    const val = Math.round(baseValue * (1 + variation));
                    history.push({
                        date: months[(currentMonthIdx - i + 12) % 12],
                        value: val
                    });
                }
                // Ensure the last point matches current value roughly or exactly? 
                // Let's just append current value as the latest point
                // Actually sparkline usually shows history leading up to current.
                // Let's just use the last generated point as "previous" for trend calcs context
                return history;
            };

            // Total Employees History
            const safeTotalEmployees = totalEmployees || 0;
            const employeeHistory = generateHistory(safeTotalEmployees || 100, 0.05);
            employeeHistory[2].value = safeTotalEmployees; // Set last point to current
            const empPrev = employeeHistory[1].value;
            const empTrend = {
                value: Math.round(((safeTotalEmployees - empPrev) / empPrev) * 100) || 0,
                direction: (safeTotalEmployees >= empPrev ? 'up' : 'down') as 'up' | 'down',
                isPositive: true // More employees usually good? Or neutral. Let's say good.
            };

            // Bench % History
            const benchPercentage = safeTotalEmployees ? Math.round((benchCount / safeTotalEmployees) * 100) : 0;
            const benchHistory = generateHistory(benchPercentage || 10, 0.3);
            benchHistory[2].value = benchPercentage;
            const benchPrev = benchHistory[1].value;
            const benchTrendVal = benchPercentage - benchPrev; // Absolute point change for %
            const benchTrend = {
                value: Math.abs(benchTrendVal),
                direction: (benchTrendVal >= 0 ? 'up' : 'down') as 'up' | 'down',
                isPositive: benchTrendVal <= 0 // Lower bench is good (Positive)
            };

            // Active Projects History
            const safeActiveProjects = activeProjects || 0;
            const projectHistory = generateHistory(safeActiveProjects || 10, 0.1);
            projectHistory[2].value = safeActiveProjects;
            const projPrev = projectHistory[1].value;
            const projTrend = {
                value: Math.round(((safeActiveProjects - projPrev) / projPrev) * 100) || 0,
                direction: (safeActiveProjects >= projPrev ? 'up' : 'down') as 'up' | 'down',
                isPositive: safeActiveProjects >= projPrev // More projects is good
            };

            // Calculate alerts (employees at risk)
            const alertsCount = benchCount;

            return {
                totalEmployees: {
                    value: safeTotalEmployees,
                    trend: empTrend,
                    history: employeeHistory
                },
                bench: {
                    value: benchPercentage,
                    trend: benchTrend,
                    history: benchHistory,
                    count: benchCount
                },
                activeProjects: {
                    value: safeActiveProjects,
                    trend: projTrend,
                    history: projectHistory
                },
                alertsCount,
                accountMetrics: mockAccountMetrics,
            };
        },
    });
}

// Fetch resource distribution by entity
export function useResourceDistributionByEntity() {
    return useQuery({
        queryKey: ['dashboard', 'resourceDistribution'],
        queryFn: async () => {
            const { data: employees } = await supabase
                .from('employees')
                .select(`
          id,
          entity:entities(name),
          utilization_data:allocations(utilization_percent:allocation_percent, start_date, end_date)
        `)
                .eq('status', 'active');

            const today = new Date().toISOString().split('T')[0];
            const entityStats: Record<string, { fullyUtilized: number; partiallyUtilized: number; available: number }> = {};

            employees?.forEach((emp: any) => {
                const entityData = emp.entity as { name: string }[] | null;
                const entityName = entityData?.[0]?.name || 'Unknown';
                if (!entityStats[entityName]) {
                    entityStats[entityName] = { fullyUtilized: 0, partiallyUtilized: 0, available: 0 };
                }

                const activeUtilizations = emp.utilization_data?.filter(
                    (a: { start_date: string; end_date: string | null }) =>
                        a.start_date <= today && (!a.end_date || a.end_date >= today)
                ) || [];
                const utilization = activeUtilizations.reduce(
                    (sum: number, a: { utilization_percent: number }) => sum + a.utilization_percent,
                    0
                );

                if (utilization >= 80) entityStats[entityName].fullyUtilized++;
                else if (utilization >= 50) entityStats[entityName].partiallyUtilized++;
                else entityStats[entityName].available++;
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
            // Mock data for upcoming releases (using existing employees from useEmployees.ts)
            const today = new Date();
            const mockReleases = [
                { employee: 'Jane Smith', employeeId: 'e2', project: 'Project Alpha', endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
                { employee: 'Alice Johnson', employeeId: 'e3', project: 'Project Beta', endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
                { employee: 'John Doe', employeeId: 'e1', project: 'Project Alpha', endDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
                { employee: 'Diana Prince', employeeId: 'e6', project: 'Project Gamma', endDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            ];

            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            return mockReleases;
        },
    });
}

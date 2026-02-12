import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { calculateUtilization } from './useEmployees';



// Mock Account Metric Data -> replaced with derived data
export interface AccountMetric {
    id: string;
    name: string;
    headcountChange: number; // positive = increase, negative = decrease
    totalCount: number;
}

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: async () => {
             // 1. Fetch all required data to compute metrics
             // We prioritize fetching everything to compute trends client-side for accuracy without complex time-series DB logic.
            const [employeesRes, projectsRes, allocationsRes, accountsRes] = await Promise.all([
                supabase.from('employees').select('id, status, created_at'),
                supabase.from('projects').select('id, status, start_date, end_date, created_at'),
                supabase.from('allocations').select('employee_id, project_id, allocation_percent, start_date, end_date'),
                supabase.from('accounts').select('id, name, created_at, projects(id)')
            ]);

            if (employeesRes.error) throw employeesRes.error;
            if (projectsRes.error) throw projectsRes.error;
            if (allocationsRes.error) throw allocationsRes.error;
            if (accountsRes.error) throw accountsRes.error;

            const employees = employeesRes.data || [];
            const projects = projectsRes.data || [];
            const allocations = allocationsRes.data || [];
            const accounts = accountsRes.data || [];

            // Helper to get metrics for a specific date
            const getMetricsForDate = (date: Date) => {
                const dayStr = date.toISOString().split('T')[0];

                // Active Employees: Filter by status 'active'. 
                // For today's metrics, we don't need created_at filter.
                const activeEmployees = employees.filter(e => e.status === 'active');
                
                // Active Projects: Started before date, and (no end date OR end date > date)
                const activeProjs = projects.filter(p => 
                    p.start_date && p.start_date <= dayStr && 
                    (!p.end_date || p.end_date >= dayStr) &&
                    p.status !== 'proposal'
                );

                // Bench: Employees with 0 utilization on this date
                let benchCount = 0;
                activeEmployees.forEach(emp => {
                    const empAllocations = allocations.filter(a => a.employee_id === emp.id)
                        .map(a => ({
                            ...a,
                            project: projects.find(p => p.id === a.project_id)
                        }));
                    
                    const util = calculateUtilization(empAllocations, date);
                    if (util === 0) benchCount++;
                });

                return {
                    totalEmployees: activeEmployees.length,
                    activeProjects: activeProjs.length,
                    benchCount,
                    benchPercentage: activeEmployees.length > 0 ? Math.round((benchCount / activeEmployees.length) * 100) : 0
                };
            };

            // Generate history points (Current, 1 month ago, 2 months ago)
            const today = new Date();
            const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));
            const twoMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 2));

            const currentMetrics = getMetricsForDate(today);
            const prev1Metrics = getMetricsForDate(oneMonthAgo);
            const prev2Metrics = getMetricsForDate(twoMonthsAgo);

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Format history for charts
            const historyDates = [twoMonthsAgo, oneMonthAgo, today];
            
            const employeeHistory = historyDates.map((d, i) => ({
                date: months[d.getMonth()],
                value: [prev2Metrics, prev1Metrics, currentMetrics][i].totalEmployees
            }));

            const projectHistory = historyDates.map((d, i) => ({
                date: months[d.getMonth()],
                value: [prev2Metrics, prev1Metrics, currentMetrics][i].activeProjects
            }));

            const benchHistory = historyDates.map((d, i) => ({
                date: months[d.getMonth()],
                value: [prev2Metrics, prev1Metrics, currentMetrics][i].benchPercentage
            }));

            // Calculate trends
            const getTrend = (current: number, prev: number, isPositiveLower: boolean = false) => {
                const diff = current - prev;
                const percentage = prev === 0 ? (current > 0 ? 100 : 0) : Math.round((diff / prev) * 100);
                
                let isPositive = diff >= 0;
                if (isPositiveLower) isPositive = diff <= 0;

                return {
                    value: Math.abs(isPositiveLower ? diff : percentage), // Using percentage for general, abs diff for percentage metrics? Mock usage mixed.
                    // Mock used percent for employees, absolute diff for bench %. Let's stick to that.
                    direction: (diff >= 0 ? 'up' : 'down') as 'up' | 'down',
                    isPositive
                };
            };

            // Total Employees Trend
            const empTrend = getTrend(currentMetrics.totalEmployees, prev1Metrics.totalEmployees);
            
            // Bench Trend (Lower is better)
            // For bench percentage, we usually show absolute point change, not percentage of percentage
            const benchDiff = currentMetrics.benchPercentage - prev1Metrics.benchPercentage;
            const benchTrend = {
                value: Math.abs(benchDiff),
                direction: (benchDiff >= 0 ? 'up' : 'down') as 'up' | 'down',
                isPositive: benchDiff <= 0
            };

            // Projects Trend
            const projTrend = getTrend(currentMetrics.activeProjects, prev1Metrics.activeProjects);

            // Account Metrics - count current resources per account
            const accountMetrics: AccountMetric[] = accounts.map((acc: any) => {
                const accProjectIds = new Set(acc.projects?.map((p: any) => p.id));
                const currentResources = new Set(allocations
                    .filter((a: any) => accProjectIds.has(a.project_id) &&
                        (!a.end_date || a.end_date >= today.toISOString().split('T')[0]))
                    .map((a: any) => a.employee_id)
                ).size;

                return {
                    id: acc.id,
                    name: acc.name,
                    headcountChange: 0,
                    totalCount: currentResources
                };
            });

            return {
                totalEmployees: {
                    value: currentMetrics.totalEmployees,
                    trend: empTrend,
                    history: employeeHistory
                },
                bench: {
                    value: currentMetrics.benchPercentage,
                    trend: benchTrend,
                    history: benchHistory,
                    count: currentMetrics.benchCount
                },
                activeProjects: {
                    value: currentMetrics.activeProjects,
                    trend: projTrend,
                    history: projectHistory
                },
                alertsCount: currentMetrics.benchCount, // Alerts for bench
                accountMetrics: accountMetrics.slice(0, 5), // Top 5
            };
        },
    });
}

// Fetch resource distribution by entity
export function useResourceDistributionByEntity() {
    return useQuery({
        queryKey: ['dashboard', 'resourceDistribution'],
        queryFn: async () => {
             // Use supabase-js directly to avoid creating more hooks/complexity if simple enough
             // Original hook used query. Here we reuse the query but against DB.
             // We need employees with entity via FK.
            const { data: employees, error } = await supabase
                .from('employees')
                .select(`
          id,
          entity:entities(name),
          utilization_data:allocations(utilization_percent, start_date, end_date)
        `)
                .eq('status', 'active');
            
            if (error) throw error;

            const today = new Date().toISOString().split('T')[0];
            const entityStats: Record<string, { fullyUtilized: number; partiallyUtilized: number; available: number }> = {};

            // We need to initialize for all entities even if no employees? 
            // Better to let them appear as we iterate or ideally fetch entities list first.
            // For now, iterate employees.

            employees?.forEach((emp: any) => {
                const entityName = emp.entity?.name || 'Unknown';
                if (!entityStats[entityName]) {
                    entityStats[entityName] = { fullyUtilized: 0, partiallyUtilized: 0, available: 0 };
                }

                // Correctly map utilization_data
                // Note: The select alias `utilization_data` maps `allocations` rows.
                // The fields inside are `utilization_percent`, `start_date`, `end_date` as requested.
                // However, supabase return type might place them directly? 
                // Let's assume standard response: emp.utilization_data is Array of objects.
                
                const activeUtilizations = (emp.utilization_data || []).filter(
                    (a: any) => a.start_date <= today && (!a.end_date || a.end_date >= today)
                );
                
                const utilization = activeUtilizations.reduce(
                    (sum: number, a: any) => sum + (a.utilization_percent || 0),
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

// Fetch upcoming releases (allocations ending in next 14 days)
export function useUpcomingReleases() {
    return useQuery({
        queryKey: ['dashboard', 'releases'],
        queryFn: async () => {
            const today = new Date();
            const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
            
            const todayStr = today.toISOString().split('T')[0];
            const twoWeeksStr = twoWeeksLater.toISOString().split('T')[0];

            // Fetch allocations ending in range
            const { data, error } = await supabase
                .from('allocations')
                .select(`
                    id,
                    end_date,
                    employee:employees(id, name, entity:entities(name), primary_skills),
                    project:projects(id, name, account:accounts(name))
                `)
                .gte('end_date', todayStr)
                .lte('end_date', twoWeeksStr)
                .order('end_date');

            if (error) throw error;

            const releases = (data || []).map((a: any) => ({
                employee: a.employee?.name,
                employeeId: a.employee?.id,
                project: a.project?.name,
                account: a.project?.account?.name || 'Internal',
                skill: a.employee?.primary_skills || 'N/A',
                endDate: a.end_date
            }));

            return releases;
        },
    });
}

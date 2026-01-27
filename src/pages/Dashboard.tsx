import { Link, useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, ChartBar, Bell, Buildings,
    CaretUp,
    CaretDown,
    ArrowRight,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import { TrendCard } from '@/components/dashboard/TrendCard';
import { useDashboardKPIs } from '@/hooks/useDashboard';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';

// Helper to calculate resource distribution metrics
function calculateResourceDistribution(employees: any[]) {
    // Group by entity
    const stats: Record<string, { fullyUtilized: number; partiallyUtilized: number; available: number }> = {};

    employees.forEach((emp) => {
        const entityName = emp.entity?.name || 'Unknown';
        if (entityName === 'Unknown') return; // Skip unknown? or keep
        if (!stats[entityName]) {
            stats[entityName] = { fullyUtilized: 0, partiallyUtilized: 0, available: 0 };
        }

        if (emp.utilization >= 80) stats[entityName].fullyUtilized++;
        else if (emp.utilization >= 50) stats[entityName].partiallyUtilized++;
        else stats[entityName].available++;
    });

    return Object.entries(stats).map(([entity, counts]) => ({
        entity,
        ...counts
    }));
}

export function Dashboard() {
    const navigate = useNavigate(); // Added navigation logic
    const { data: employees = [] } = useEmployees();
    const { data: projects = [] } = useProjects();
    const { data: kpis } = useDashboardKPIs();

    const accountMetrics = kpis?.accountMetrics;

    const activeProjects = projects.filter((p) => p.status === 'active').length;
    // Bench is typically employees with 0 utilization or explicitly marked 'on_bench' (if field exists, otherwise use low util)
    const benchCount = employees.filter((e) => e.utilization < 10).length;


    const resourceDistribution = calculateResourceDistribution(employees);

    // Upcoming releases: Projects ending in next 14 days
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    const upcomingReleases = projects
        .filter(p => p.end_date && new Date(p.end_date) >= today && new Date(p.end_date) <= twoWeeksLater)
        .slice(0, 5); // Limit to 5

    // selectedMetric state removed

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Workforce overview and key metrics
                </p>
            </div>

            {/* KPI Cards - Replaced with TrendCard */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <TrendCard
                    title="Total Employees"
                    value={kpis?.totalEmployees.value || 0}
                    icon={<Users size={18} weight="fill" />}
                    iconBgColor="bg-green-100 text-green-700"
                    trend={kpis?.totalEmployees.trend || { value: 0, direction: 'neutral', isPositive: true }}
                    history={kpis?.totalEmployees.history || []}
                    onDetailClick={() => navigate('/employees')}
                />
                <TrendCard
                    title="Bench Count"
                    value={kpis?.bench.count || 0}
                    subValue={`${kpis?.bench.value || 0}% `}
                    icon={<ChartBar size={18} weight="fill" />}
                    iconBgColor="bg-blue-100 text-blue-700"
                    trend={kpis?.bench.trend || { value: 0, direction: 'neutral', isPositive: true }}
                    history={kpis?.bench.history || []}
                    onDetailClick={() => navigate('/employees?filter=benched')}
                />
                <TrendCard
                    title="Active Projects"
                    value={kpis?.activeProjects.value || 0}
                    icon={<Briefcase size={18} weight="fill" />}
                    iconBgColor="bg-purple-100 text-purple-700"
                    trend={activeProjects?.trend || { value: 0, direction: 'neutral', isPositive: true }}
                    history={activeProjects?.history || []}
                    onDetailClick={() => navigate('/projects')}
                />
                {/* Alerts Card - Keeping as simple card for now or should we use TrendCard too? 
                    Request said "All TOP tracking cards... Total Employees, Bench %, Active Projects" (3 cards).
                    Usually alerts is separate. I'll leave alerts as is or simplify it since I removed KPICard.
                    Actually I removed KPICard, so I need to replace Alerts too, or just manually render it.
                 */}
                {/* 
                <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Alerts
                        </CardTitle>
                        <div className="p-1.5 rounded-full bg-orange-100 text-orange-700">
                            <Bell size={18} weight="fill" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1">
                            <div className="text-2xl font-bold">{kpis?.alertsCount || 0}</div>
                            <div className="text-xs text-muted-foreground">
                                employees at risk or on bench
                            </div>
                        </div>
                    </CardContent>
                </Card> 
                */}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">


                {/* Entity-wise Resource Distribution */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Entity-wise Resource Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resourceDistribution.map((entity) => {
                            const total = entity.fullyUtilized + entity.partiallyUtilized + entity.available;
                            const utilizedPct = (entity.fullyUtilized / total) * 100;
                            return (
                                <div key={entity.entity} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{entity.entity}</span>
                                            <span className="text-muted-foreground text-xs">• Total: {total}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="green">
                                                {entity.fullyUtilized} Utilized
                                            </Badge>
                                            <Badge variant="yellow">
                                                {entity.partiallyUtilized} Partial
                                            </Badge>
                                            <Badge variant="blue">
                                                {entity.available} Available
                                            </Badge>
                                        </div>
                                    </div>
                                    <SegmentedProgress value={utilizedPct} size="sm" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Upcoming Virtual Pool (Projects ending soon) */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                    {/* Upcoming Virtual Pool (Existing) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Virtual Pool</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingReleases.length > 0 ? (
                                    upcomingReleases.map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{project.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {project.entity?.name}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">{project.end_date}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No upcoming availability</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accounts Metrics (New) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Accounts Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(accountMetrics || []).slice(0, 5).map((account) => ( // Data might be undefined initially
                                    <div key={account.id} className="flex items-center justify-between py-1">
                                        <span className="font-medium text-sm">{account.name}</span>
                                        <div className="flex items-center gap-1">
                                            {account.headcountChange !== 0 && (
                                                <span className={account.headcountChange > 0 ? "text-green-500" : "text-red-500"}>
                                                    {account.headcountChange > 0 ? <CaretUp weight="bold" size={12} /> : <CaretDown weight="bold" size={12} />}
                                                </span>
                                            )}
                                            <span className={`text - sm font - medium ${account.headcountChange > 0 ? "text-green-600" :
                                                    account.headcountChange < 0 ? "text-red-600" : "text-muted-foreground"
                                                } `}>
                                                {account.headcountChange > 0 ? `+ ${account.headcountChange} ` : account.headcountChange}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!accountMetrics || accountMetrics.length === 0) && (
                                    <p className="text-sm text-muted-foreground">No recent activity</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Available Talent & Ongoing Projects */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Available Talent */}
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle>Available Talents</CardTitle>
                        <Link
                            to="/employees"
                            className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                        >
                            View More <ArrowRight size={12} weight="bold" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {employees.filter(e => (e.utilization || 0) < 10).length > 0 ? (
                                employees
                                    .filter(e => (e.utilization || 0) < 10)
                                    .map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{employee.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {employee.role || 'Employee'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="green">
                                                Available
                                            </Badge>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No available talent found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Ongoing Projects */}
                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle>Projects Nearing Completion</CardTitle>
                        <Link
                            to="/projects"
                            className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                        >
                            View More <ArrowRight size={12} weight="bold" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {activeProjects > 0 ? (
                                projects.filter(p => p.status === 'active').map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{project.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {project.entity?.name}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {project.utilization?.length || 0} Members
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No active projects</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}

import { Users, Briefcase, ChartBar, Bell } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
}

function KPICard({ title, value, icon, trend }: KPICardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="text-brand-600">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}% from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';

// Helper to calculate utilization metrics
function calculateUtilizationStats(employees: any[]) {
    // Group by entity
    const stats: Record<string, { healthy: number; watch: number; risk: number }> = {};

    employees.forEach((emp) => {
        const entityName = emp.entity?.name || 'Unknown';
        if (!stats[entityName]) {
            stats[entityName] = { healthy: 0, watch: 0, risk: 0 };
        }

        if (emp.utilization >= 80) stats[entityName].healthy++;
        else if (emp.utilization >= 50) stats[entityName].watch++;
        else stats[entityName].risk++;
    });

    return Object.entries(stats).map(([entity, counts]) => ({
        entity,
        ...counts
    }));
}

export function Dashboard() {
    const { data: employees = [] } = useEmployees();
    const { data: projects = [] } = useProjects();

    const activeProjects = projects.filter((p) => p.status === 'active').length;
    // Bench is typically employees with 0 utilization or explicitly marked 'on_bench' (if field exists, otherwise use low util)
    const benchCount = employees.filter((e) => e.utilization < 10).length;
    const benchPct = employees.length > 0 ? Math.round((benchCount / employees.length) * 100) : 0;

    const utilizationData = calculateUtilizationStats(employees);

    // Upcoming releases: Projects ending in next 14 days
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    const upcomingReleases = projects
        .filter(p => p.end_date && new Date(p.end_date) >= today && new Date(p.end_date) <= twoWeeksLater)
        .slice(0, 5); // Limit to 5

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Workforce overview and key metrics
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Employees"
                    value={employees.length}
                    icon={<Users size={24} weight="duotone" />}
                    trend={{ value: 5, isPositive: true }} // TODO: Real trend needs history data
                />
                <KPICard
                    title="Bench %"
                    value={`${benchPct}%`}
                    icon={<ChartBar size={24} weight="duotone" />}
                // trend={{ value: 2, isPositive: false }}
                />
                <KPICard
                    title="Active Teams"
                    value={activeProjects}
                    icon={<Briefcase size={24} weight="duotone" />}
                // trend={{ value: 8, isPositive: true }}
                />
                <KPICard
                    title="Alerts"
                    value={3} // Placeholder for real alerts
                    icon={<Bell size={24} weight="duotone" />}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Utilization by Entity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Utilization by Entity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {utilizationData.map((entity) => {
                            const total = entity.healthy + entity.watch + entity.risk;
                            const healthyPct = (entity.healthy / total) * 100;
                            return (
                                <div key={entity.entity} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{entity.entity}</span>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {entity.healthy} Healthy
                                            </Badge>
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                {entity.watch} Watch
                                            </Badge>
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {entity.risk} Risk
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress value={healthyPct} className="h-2" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Upcoming Releases */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Releases (14 days)</CardTitle>
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
                                            <p className="font-medium">{project.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {project.entity?.name}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">{project.end_date}</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No projects ending soon</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

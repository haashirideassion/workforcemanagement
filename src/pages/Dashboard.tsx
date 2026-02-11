import { Link, useNavigate } from 'react-router-dom';
import {
    Users, ChartBar,
    // CaretUp,
    // CaretDown,
    ArrowRight,
    // Briefcase,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import { TrendCard } from '@/components/dashboard/TrendCard';
import { useDashboardKPIs, useUpcomingReleases } from '@/hooks/useDashboard';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { EntityResourceDialog } from '@/components/dashboard/EntityResourceDialog';
// import { ResourceChart } from '@/components/dashboard/ResourceChart';
import type { Employee } from "@/types";
import { useState, useMemo } from 'react';
import { useAccounts } from '@/hooks/useAccounts';

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

        const util = emp.utilization || 0;
        if (util >= 80) stats[entityName].fullyUtilized++;
        else if (util >= 50) stats[entityName].partiallyUtilized++;
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
    const { data: accounts = [] } = useAccounts();
    const { data: kpis } = useDashboardKPIs();

    // Account Metrics calculation
    const accountMetrics = useMemo(() => {
        return accounts.map(acc => {
            const accProjects = projects.filter(p => p.account_id === acc.id);
            return {
                id: acc.id,
                name: acc.name,
                totalCount: accProjects.length,
                activeCount: accProjects.filter(p => p.status === 'active').length
            };
        }).filter(m => m.totalCount > 0).sort((a, b) => b.totalCount - a.totalCount);
    }, [accounts, projects]);


    const resourceDistribution = calculateResourceDistribution(employees);

    const { data: upcomingReleases = [] } = useUpcomingReleases();

    // selectedMetric state removed

    const [resourceDialog, setResourceDialog] = useState<{ open: boolean; title: string; employees: Employee[] }>({
        open: false,
        title: '',
        employees: []
    });

    const handleResourceClick = (entityName: string, type: 'utilized' | 'partial' | 'available') => {
        const filtered = employees.filter(e => {
            const matchesEntity = e.entity?.name === entityName;
            if (!matchesEntity) return false;

            const util = e.utilization || 0;
            if (type === 'utilized') return util >= 80;
            if (type === 'partial') return util >= 50 && util < 80;
            return util < 50;
        });

        let title = `${entityName} - ${type === 'utilized' ? 'Fully Utilized' : type === 'partial' ? 'Partially Utilized' : 'Available'}`;

        setResourceDialog({
            open: true,
            title,
            employees: filtered
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Workforce Intelligence Summary</h1>
                <p className="text-muted-foreground">
                    Comprehensive insights into workforce health and resource distribution
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
                    title="Virtual Pool"
                    value={kpis?.totalEmployees.value ? employees.filter(e => (e.utilization || 0) > 0 && (e.utilization || 0) < 80).length : 0}
                    subValue={`${kpis?.totalEmployees.value ? Math.round((employees.filter(e => (e.utilization || 0) > 0 && (e.utilization || 0) < 80).length / kpis.totalEmployees.value) * 100) : 0}%`}
                    icon={<Users size={18} weight="fill" />}
                    iconBgColor="bg-purple-100 text-purple-700"
                    trend={{ value: 0, direction: 'neutral', isPositive: true }}
                    history={kpis?.totalEmployees.history || []}
                    onDetailClick={() => navigate('/employees?filter=virtual_pool')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Entity-wise Resource Distribution */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Entity-wise Resource Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {resourceDistribution.map((entity) => {
                            const total = entity.fullyUtilized + entity.partiallyUtilized + entity.available;
                            const utilizedPct = total > 0 ? (entity.fullyUtilized / total) * 100 : 0;
                            return (
                                <div key={entity.entity} className="space-y-3">
                                    <div className="flex flex-col gap-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-base">{entity.entity}</span>
                                            <span className="text-muted-foreground text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Total: {total}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            <Badge
                                                variant="green"
                                                className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-0.5 text-[10px]"
                                                onClick={() => handleResourceClick(entity.entity, 'utilized')}
                                            >
                                                {entity.fullyUtilized} Utilized
                                            </Badge>
                                            <Badge
                                                variant="yellow"
                                                className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-0.5 text-[10px]"
                                                onClick={() => handleResourceClick(entity.entity, 'partial')}
                                            >
                                                {entity.partiallyUtilized} Partial
                                            </Badge>
                                            <Badge
                                                variant="blue"
                                                className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-0.5 text-[10px]"
                                                onClick={() => handleResourceClick(entity.entity, 'available')}
                                            >
                                                {entity.available} Available
                                            </Badge>
                                        </div>
                                    </div>
                                    <SegmentedProgress value={utilizedPct} size="md" className="h-2" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Upcoming Virtual Pool */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Upcoming Virtual Pool</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {upcomingReleases.length > 0 ? (
                                upcomingReleases.map((item, index) => {
                                    const daysLeft = Math.ceil((new Date(item.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm transition-all"
                                        >
                                            <div
                                                className="cursor-pointer hover:bg-muted/50 transition-colors -m-2 p-2 rounded-md flex-1"
                                                onClick={() => navigate(`/employees/${item.employeeId}`)}
                                            >
                                                <p className="font-medium text-sm hover:text-brand-600 hover:underline">{item.employee}</p>
                                                <div className="flex flex-col gap-0.5 mt-0.5">
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                                        {item.project} • {item.account || 'N/A'}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-muted-foreground">{item.endDate}</p>
                                                        <Badge variant="blue" className="text-[8px] h-3 px-1">
                                                            {item.skill || 'Frontend'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${daysLeft <= 5 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {daysLeft} days left
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming availability</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Accounts Metrics */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Accounts Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {accountMetrics.slice(0, 5).map((account) => (
                                <div 
                                    key={account.id} 
                                    className="flex items-center justify-between py-2 border-b last:border-0 border-dashed border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded px-1 transition-colors"
                                    onClick={() => navigate(`/projects?accountId=${account.id}`)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{account.name}</span>
                                        <span className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                                            Projects: {account.totalCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant={account.activeCount > 0 ? "green" : "secondary"} className="text-[10px]">
                                            {account.activeCount} Active
                                        </Badge>
                                        <ArrowRight size={12} className="text-slate-300" />
                                    </div>
                                </div>
                            ))}
                            {accountMetrics.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No account data available</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Ongoing Projects & Nearing Completion */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Active Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle>Active Projects</CardTitle>
                        <Link to="/projects?status=active" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight size={12} />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {projects.filter(p => p.status === 'active').slice(0, 5).map((project) => (
                                <div key={project.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <p className="font-medium text-sm">{project.name}</p>
                                        <p className="text-xs text-muted-foreground">{project.entity?.name}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{project.utilization?.length || 0} Members</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Nearing Completion */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle>Active Projects Nearing Completion</CardTitle>
                        <Link to="/projects?status=active&nearing_completion=true" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                            View More <ArrowRight size={12} />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {projects.filter(p => {
                                if (p.status !== 'active' || !p.end_date) return false;
                                const daysLeft = Math.ceil((new Date(p.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return daysLeft > 0 && daysLeft <= 30; // Within 30 days
                            }).map((project) => {
                                const daysLeft = Math.ceil((new Date(project.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={project.id} className="flex items-center justify-between rounded-lg border p-3 border-amber-100 bg-amber-50/30">
                                        <div>
                                            <p className="font-medium text-sm">{project.name}</p>
                                            <p className="text-xs text-muted-foreground">{project.entity?.name}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                            {daysLeft} days left
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <EntityResourceDialog
                open={resourceDialog.open}
                onOpenChange={(open) => setResourceDialog(prev => ({ ...prev, open }))}
                title={resourceDialog.title}
                employees={resourceDialog.employees}
            />
        </div >
    );
}

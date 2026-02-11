import { useParams, useNavigate } from "react-router-dom";
import { useState } from 'react';
import {
    ArrowLeft,
    Users,
    Warning,
    DotsThree,
    PencilSimple,
    Archive,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountFormDialog } from '@/components/accounts/AccountFormDialog';
import type { Account, Project } from '@/types';
import { useAccount, useUpdateAccount } from '@/hooks/useAccounts';
import { useProjects } from '@/hooks/useProjects';

function getStatusBadge(status: string) {
    switch (status?.toLowerCase()) {
        case 'healthy':
        case 'active':
            return <Badge variant="green">{status}</Badge>;
        case 'at risk':
        case 'ending soon':
            return <Badge variant="yellow">{status}</Badge>;
        case 'critical':
        case 'ended':
            return <Badge variant="destructive">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

const getRisks = (projects: Project[]) => {
    const risks = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const endingSoon = projects.filter(p => p.end_date && new Date(p.end_date) <= thirtyDaysFromNow && new Date(p.end_date) >= today);
    if (endingSoon.length > 0) {
        risks.push({ id: 'r1', message: `${endingSoon.length} Project(s) ending within 30 days`, severity: 'medium' });
    }

    const lowUtilProjects = projects.filter(p => p.status === 'active' && (!p.utilization || p.utilization.length === 0));
    if (lowUtilProjects.length > 0) {
        risks.push({ id: 'r2', message: `${lowUtilProjects.length} Active project(s) have 0 resources allocated`, severity: 'high' });
    }

    return risks;
};

export function AccountDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: account, isLoading: accountLoading } = useAccount(id || '');
    const { data: projects = [], isLoading: projectsLoading } = useProjects({ accountId: id });
    const { mutate: updateAccount } = useUpdateAccount();

    const [formOpen, setFormOpen] = useState(false);

    const isLoading = accountLoading || projectsLoading;

    // Derived Data
    const workforce = projects.flatMap(p => 
        (p.utilization || []).map((u: any) => ({
            id: u.employee?.id,
            name: u.employee?.name || 'Unknown',
            role: u.role || u.employee?.role || 'Contributor',
            utilization: u.utilization_percent,
            type: u.employee?.employment_type || 'Unknown',
            endDate: u.end_date || p.end_date || 'Ongoing',
            status: u.end_date && new Date(u.end_date) < new Date() ? 'Ended' : 'Active', // Simple status
            avatar: u.employee?.name ? u.employee.name.split(' ').map((n: string) => n[0]).join('') : '?'
        }))
    ).filter(w => w.status === 'Active'); // Show only active workforce

    // Deduplicate workforce if employee is on multiple projects for same account?
    // Usually list them per allocation or unique people? Table header says "Employee", "Role".
    // If same person on 2 projects, they appear twice?
    // Let's keep all allocations as "Assigned Workforce" rows.

    const roleCounts = workforce.reduce((acc: Record<string, number>, curr) => {
        const role = curr.role || 'Other';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const roleBreakdown = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count,
        status: 'ok'
    }));

    const risks = getRisks(projects);

    if (isLoading) return <div className="p-8 text-center bg-transparent">Loading account details...</div>;
    if (!account) return <div className="p-8 text-center text-red-500">Account not found</div>;

    const handleEditSubmit = (data: Partial<Account>) => {
        updateAccount({ id: account.id, ...data });
        setFormOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/accounts')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {account.name}
                            <Badge variant="outline" className="text-sm font-normal">
                                {account.billingType}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">{account.description || 'Client account workforce overview'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <DotsThree size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFormOpen(true)}>
                                <PencilSimple size={16} className="mr-2" /> Edit Account
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                <Archive size={16} className="mr-2" /> Archive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-baseline gap-2">
                            {projects.filter(p => !p.end_date || new Date(p.end_date) > new Date()).length}
                            <span className="text-xs font-normal text-muted-foreground">Active</span>
                        </div>
                         {/* Optional subtext */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Utilized Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-baseline gap-2">
                            {new Set(workforce.map(w => w.id)).size}
                            <span className="text-xs font-normal text-muted-foreground">people</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-baseline gap-2">
                            {account.utilization}%
                            <Badge variant="green" className="ml-2 font-normal">
                                Avg
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Account Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(account.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">{account.zone} • {account.entity}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column (2/3 width) - Projects & Workforce */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Projects Section */}
                    <div className="space-y-6">
                        {/* Active Projects Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Ongoing Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Timeline</TableHead>
                                            <TableHead>Employees</TableHead>
                                            <TableHead>Utilization</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.filter(p => !p.end_date || new Date(p.end_date) > new Date()).map(project => (
                                            <TableRow key={project.id} className="cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {project.start_date || 'N/A'} - {project.end_date || 'Ongoing'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Users size={16} className="text-muted-foreground" />
                                                        <span>{project.utilization?.length || 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <SegmentedProgress 
                                                            value={Math.round((project.utilization?.reduce((sum, u) => sum + (u.utilization_percent || 0), 0) || 0) / (project.utilization?.length || 1))} 
                                                            size="sm" 
                                                            className="w-20" 
                                                        />
                                                        <span className="text-xs">
                                                            {Math.round((project.utilization?.reduce((sum, u) => sum + (u.utilization_percent || 0), 0) || 0) / (project.utilization?.length || 1))}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(project.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {projects.filter(p => !p.end_date || new Date(p.end_date) > new Date()).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No active projects found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Assigned Workforce Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Assigned Workforce</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Utilization</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workforce.map((emp, idx) => (
                                        <TableRow key={`${emp.id}-${idx}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                                                        {emp.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{emp.name}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{emp.role}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{emp.utilization}%</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{emp.type}</TableCell>
                                            <TableCell className="text-sm">{emp.endDate}</TableCell>
                                            <TableCell>{getStatusBadge(emp.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {workforce.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No workforce assigned
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (1/3 width) - Breakdown & Risks */}
                <div className="space-y-6">
                    {/* Resource Utilization Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Role Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {roleBreakdown.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                                        <span className="font-medium text-sm">{item.role}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-border mt-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Total Roles</span>
                                        <span>{roleBreakdown.length}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Risks & Alerts */}
                    <Card className="border-yellow-500/20 bg-yellow-500/5">
                        <CardHeader>
                            <CardTitle className="text-lg text-yellow-600 flex items-center gap-2">
                                <Warning size={18} /> Risks & Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {risks.map(risk => (
                                    <div key={risk.id} className="flex gap-3 items-start text-sm bg-background/50 p-2 rounded border border-yellow-500/10">
                                        <div className="mt-1 min-w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                        <span className="text-muted-foreground">{risk.message}</span>
                                    </div>
                                ))}
                                {risks.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No critical risks at the moment.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AccountFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                account={account as unknown as Account}
                onSubmit={handleEditSubmit}
            />
        </div>
    );
}

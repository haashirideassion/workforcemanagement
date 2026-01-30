import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    Users,
    ChartBar,
    Warning,
    CheckCircle,
    Clock,
    DotsThree,
    PencilSimple,
    Archive,
    TrendUp,
    WarningCircle,
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
import { useState } from 'react';
import type { Account } from '@/types';

// Mock Data
const mockAccount = {
    id: "1",
    name: "Acme Corporation",
    type: "Retainer",
    status: "healthy",
    healthReason: "All projects on track",
    activeProjects: 3,
    utilizedResources: 8,
    utilization: 85,
    utilizationTrend: 5,
};

const mockProjects = [
    { id: "p1", name: "E-commerce Platform", start: "Jan 2024", end: "Dec 2024", assigned: 4, required: 4, utilization: 90, status: "Active" },
    { id: "p2", name: "Mobile App Redesign", start: "Mar 2024", end: "Aug 2024", assigned: 3, required: 4, utilization: 75, status: "At Risk" },
    { id: "p3", name: "Internal Dashboard", start: "Feb 2024", end: "Jun 2024", assigned: 2, required: 2, utilization: 60, status: "Active" },
];

const mockWorkforce = [
    { id: "e1", name: "John Doe", role: "Senior Frontend", utilization: 100, type: "Billable", endDate: "Dec 2024", status: "Active" },
    { id: "e2", name: "Jane Smith", role: "Backend Lead", utilization: 100, type: "Billable", endDate: "Dec 2024", status: "Active" },
    { id: "e3", name: "Mike Johnson", role: "QA Engineer", utilization: 50, type: "Billable", endDate: "Aug 2024", status: "Ending Soon" },
    { id: "e4", name: "Sarah Williams", role: "Product Designer", utilization: 100, type: "Billable", endDate: "Jun 2024", status: "Active" },
    { id: "e5", name: "David Brown", role: "DevOps", utilization: 25, type: "Shared", endDate: "Dec 2024", status: "Active" },
];

const mockRoleBreakdown = [
    { role: "Frontend", count: 3, status: "ok" },
    { role: "Backend", count: 2, status: "ok" },
    { role: "Design", count: 1, status: "ok" },
    { role: "QA", count: 1, status: "gap" }, // Showing gap
    { role: "DevOps", count: 1, status: "ok" },
];

const mockRisks = [
    { id: "r1", message: "Mobile App Redesign has 0 active resources", severity: "high" },
    { id: "r2", message: "2 Employees rolling off to virtual pool in 10 days", severity: "medium" },
    { id: "r3", message: "Internal Dashboard utilization dropping below 50%", severity: "medium" },
];

function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
        case 'healthy':
        case 'active':
            return <Badge variant="green">{status}</Badge>;
        case 'at risk':
        case 'ending soon':
            return <Badge variant="yellow">{status}</Badge>;
        case 'critical':
            return <Badge variant="destructive">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function AccountDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    // In a real app, fetch data based on ID
    // In a real app, fetch data based on ID
    const account = mockAccount;
    const [formOpen, setFormOpen] = useState(false);

    const handleEditSubmit = (data: Partial<Account>) => {
        console.log('Updating account:', data);
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
                                {account.type}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">Client account workforce overview</p>
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
                            {account.activeProjects}
                            <span className="text-xs font-normal text-muted-foreground">+1 starting soon</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Utilized Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-baseline gap-2">
                            {account.utilizedResources}
                            <span className="text-xs font-normal text-muted-foreground">people</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">6 Full-time, 2 Partial</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-baseline gap-2">
                            {account.utilization}%
                            <span className="text-xs font-medium text-green-500 flex items-center">
                                <TrendUp size={12} className="mr-1" /> {account.utilizationTrend}%
                            </span>
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
                        <p className="text-xs text-muted-foreground">{account.healthReason}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column (2/3 width) - Projects & Workforce */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Projects Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Active Projects</CardTitle>
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
                                    {mockProjects.map(project => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{project.start} - {project.end}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} className="text-muted-foreground" />
                                                    <span>{project.assigned}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <SegmentedProgress value={project.utilization} size="sm" className="w-20" />
                                                    <span className="text-xs">{project.utilization}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

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
                                    {mockWorkforce.map(emp => (
                                        <TableRow key={emp.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                                                        {emp.name.split(' ').map(n => n[0]).join('')}
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
                                {mockRoleBreakdown.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                                        <span className="font-medium text-sm">{item.role}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{item.count}</span>
                                            {item.status === 'gap' && (
                                                <WarningCircle size={14} className="text-yellow-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-border mt-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Total Roles</span>
                                        <span>8</span>
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
                                {mockRisks.map(risk => (
                                    <div key={risk.id} className="flex gap-3 items-start text-sm bg-background/50 p-2 rounded border border-yellow-500/10">
                                        <div className="mt-1 min-w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                        <span className="text-muted-foreground">{risk.message}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="w-full mt-4 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10">
                                View All Risks
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Removed */}
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

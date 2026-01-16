import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Buildings, Plus, CalendarBlank, Users } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useProject } from '@/hooks/useProjects';

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-100 text-green-700">Active</Badge>;
        case 'on-hold':
            return <Badge className="bg-yellow-100 text-yellow-700">On Hold</Badge>;
        case 'completed':
            return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function TeamDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: project, isLoading, error } = useProject(id || '');

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Team not found</p>
                <Button variant="link" onClick={() => navigate('/teams')}>
                    Back to Teams
                </Button>
            </div>
        );
    }

    // Calculate progress
    let progress = 0;
    if (project.start_date && project.end_date) {
        const start = new Date(project.start_date).getTime();
        const end = new Date(project.end_date).getTime();
        const now = Date.now();
        progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    }
    if (project.status === 'completed') progress = 100;

    const totalAllocation = project.allocations?.reduce((sum, a) => sum + a.allocation_percent, 0) || 0;
    const teamSize = project.allocations?.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/teams')}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Buildings size={14} />
                            {project.entity?.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                            <CalendarBlank size={14} />
                            {project.start_date} - {project.end_date || 'Ongoing'}
                        </span>
                    </div>
                </div>
                {getStatusBadge(project.status)}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{teamSize}</p>
                                <p className="text-sm text-muted-foreground">Team Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-2xl font-bold">{totalAllocation}%</p>
                            <p className="text-sm text-muted-foreground">Total Allocation</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Team Members</CardTitle>
                    <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                        <Plus size={16} className="mr-2" />
                        Add Member
                    </Button>
                </CardHeader>
                <CardContent>
                    {project.allocations && project.allocations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Allocation</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {project.allocations.map((allocation) => (
                                    <TableRow
                                        key={allocation.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/employees/${allocation.employee_id}`)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{allocation.employee?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {allocation.employee?.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {allocation.employee?.entity?.name || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={allocation.allocation_percent} className="h-2 w-16" />
                                                <span>{allocation.allocation_percent}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{allocation.start_date}</TableCell>
                                        <TableCell>{allocation.end_date || 'Ongoing'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No team members assigned yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

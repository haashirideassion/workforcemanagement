import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Buildings, Plus, CalendarBlank, Users, Trash, Pencil } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useProject } from '@/hooks/useProjects';
import { useCreateUtilization, useDeleteUtilization, useUpdateUtilization } from '@/hooks/useUtilization';
import type { Utilization } from '@/types';
import { UtilizationDialog } from '@/components/projects/UtilizationDialog';
import type { UtilizationFormData } from '@/components/projects/UtilizationDialog';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return <Badge variant="green">Active</Badge>;
        case 'on-hold':
            return <Badge variant="yellow">On Hold</Badge>;
        case 'completed':
            return <Badge variant="blue">Completed</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [utilizationOpen, setUtilizationOpen] = useState(false);
    const [editingUtilization, setEditingUtilization] = useState<Utilization | null>(null);

    const { data: project, isLoading, error } = useProject(id || '');
    const createUtilization = useCreateUtilization();
    const updateUtilization = useUpdateUtilization();
    const deleteUtilization = useDeleteUtilization();

    const handleFormSubmit = (values: UtilizationFormData) => {
        if (editingUtilization) {
            updateUtilization.mutate({ id: editingUtilization.id, ...values }, {
                onSuccess: () => {
                    setUtilizationOpen(false);
                    setEditingUtilization(null);
                    toast.success('Utilization updated successfully');
                },
                onError: (error: any) => {
                    toast.error(`Failed to update utilization: ${error.message}`);
                }
            });
        } else {
            createUtilization.mutate(values, {
                onSuccess: () => {
                    setUtilizationOpen(false);
                    toast.success('Project member added successfully');
                },
                onError: (error: any) => {
                    toast.error(`Failed to add project member: ${error.message}`);
                }
            });
        }
    };

    const handleEditMember = (utilization: Utilization, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingUtilization(utilization);
        setUtilizationOpen(true);
    };

    const handleDeleteMember = (utilizationId: string, e: React.MouseEvent | React.SyntheticEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this member from the project?')) {
            deleteUtilization.mutate(utilizationId, {
                onSuccess: () => {
                    toast.success('Project member removed successfully');
                },
                onError: (error: any) => {
                    toast.error(`Failed to remove project member: ${error.message}`);
                }
            });
        }
    };

    if (isLoading) {
        return <Loading fullPage />;
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Project not found</p>
                <Button variant="link" onClick={() => navigate('/projects')}>
                    Back to Projects
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

    const totalUtilization = project.utilization?.reduce((sum, a) => sum + a.utilization_percent, 0) || 0;
    const teamSize = project.utilization?.length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
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
                                <p className="text-sm text-muted-foreground">Project Members</p>
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
                            <SegmentedProgress value={progress} size="md" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div>
                            <p className="text-2xl font-bold">{totalUtilization}%</p>
                            <p className="text-sm text-muted-foreground">Total Utilization</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Project Members</CardTitle>
                    <Button
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                        onClick={() => {
                            setEditingUtilization(null);
                            setUtilizationOpen(true);
                        }}
                    >
                        <Plus size={16} className="mr-2" />
                        Add Member
                    </Button>
                </CardHeader>
                <CardContent>
                    {project.utilization && project.utilization.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Utilization</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {project.utilization.map((utilization) => (
                                    <TableRow
                                        key={utilization.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/employees/${utilization.employee_id}`)}
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{utilization.employee?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {utilization.employee?.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {utilization.employee?.role || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {utilization.employee?.specialization || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <SegmentedProgress value={utilization.utilization_percent} size="sm" className="w-16" />
                                                <span>{utilization.utilization_percent}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{utilization.start_date}</TableCell>
                                        <TableCell>{utilization.end_date || 'Ongoing'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-brand-600"
                                                    onClick={(e) => handleEditMember(utilization, e)}
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDeleteMember(utilization.id, e)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
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

            <UtilizationDialog
                open={utilizationOpen}
                onOpenChange={setUtilizationOpen}
                preSelectedProjectId={id}
                utilization={editingUtilization ? {
                    id: editingUtilization.id,
                    employee_id: editingUtilization.employee_id,
                    project_id: editingUtilization.project_id,
                    utilization_percent: editingUtilization.utilization_percent,
                    start_date: editingUtilization.start_date,
                    end_date: editingUtilization.end_date || '',
                } : undefined}
                onSubmit={handleFormSubmit}
                isLoading={createUtilization.isPending || updateUtilization.isPending}
            />
        </div>
    );
}

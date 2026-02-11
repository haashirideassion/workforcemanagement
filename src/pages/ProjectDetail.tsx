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
import { useEmployees } from '@/hooks/useEmployees';
import { useCreateUtilization, useDeleteUtilization, useUpdateUtilization } from '@/hooks/useUtilization';
import type { Utilization } from '@/types';
import { UtilizationDialog } from '@/components/projects/UtilizationDialog';
import type { UtilizationFormData } from '@/components/projects/UtilizationDialog';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import { useUpdateProject } from '@/hooks/useProjects';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return <Badge variant="green">Active</Badge>;
        case 'on-hold':
            return <Badge variant="yellow">On Hold</Badge>;
        case 'completed':
            return <Badge variant="blue">Completed</Badge>;
        case 'proposal':
            return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Proposal</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [utilizationOpen, setUtilizationOpen] = useState(false);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [editingUtilization, setEditingUtilization] = useState<Utilization | null>(null);

    const { data: project, isLoading, error } = useProject(id || '');
    const { data: allEmployees = [] } = useEmployees();
    const updateProject = useUpdateProject();
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

    const handleProjectUpdate = (values: any) => {
        updateProject.mutate({ id: project?.id || '', ...values }, {
            onSuccess: () => {
                setProjectDialogOpen(false);
                toast.success('Project updated successfully');
            },
            onError: (error: any) => {
                toast.error(`Failed to update project: ${error.message}`);
            }
        });
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

    const totalUtilizationSum = project.utilization?.reduce((sum, a) => sum + a.utilization_percent, 0) || 0;
    const teamSize = project.utilization?.length || 0;
    const averageUtilization = teamSize > 0 ? Math.round(totalUtilizationSum / teamSize) : 0;

    // Get available employees from the same entity who are not fully utilized
    const assignedEmployeeIds = new Set(project.utilization?.map(u => u.employee_id) || []);
    const availableEmployees = allEmployees.filter(emp =>
        emp.entity_id === project.entity_id &&
        !assignedEmployeeIds.has(emp.id) &&
        (emp.utilization || 0) < 100
    );


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-brand-600"
                            onClick={() => setProjectDialogOpen(true)}
                        >
                            <Pencil size={18} />
                        </Button>
                    </div>
                    {project.description && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
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
                            <p className="text-2xl font-bold">{averageUtilization}%</p>
                            <p className="text-sm text-muted-foreground">Avg. Utilization</p>
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
                                    <TableHead>Utilization</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
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
                                                    {utilization.employee?.role || 'N/A'} • {utilization.employee?.experience || 0} YOE
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {utilization.role || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <SegmentedProgress value={utilization.utilization_percent} size="sm" className="w-16" />
                                                <span>{utilization.utilization_percent}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {utilization.type || 'Billable'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{utilization.end_date || 'Dec 2024'}</TableCell>
                                        <TableCell>
                                            <Badge variant="green">Active</Badge>
                                        </TableCell>
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

            {/* Available Employees */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Employees</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Employees from {project.entity?.name} who can be assigned to this project
                    </p>
                </CardHeader>
                <CardContent>
                    {availableEmployees.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {availableEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/employees/${employee.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{employee.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {employee.role || 'Employee'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant={
                                            (employee.utilization || 0) >= 80 ? 'yellow' :
                                                (employee.utilization || 0) >= 50 ? 'blue' : 'green'
                                        }>
                                            {employee.utilization || 0}% Utilized
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No available employees from {project.entity?.name}
                        </p>
                    )}
                </CardContent>
            </Card>

            <UtilizationDialog
                open={utilizationOpen}
                onOpenChange={setUtilizationOpen}
                preSelectedProjectId={id}
                employees={allEmployees}
                utilization={editingUtilization ? {
                    id: editingUtilization.id,
                    employee_id: editingUtilization.employee_id,
                    project_id: editingUtilization.project_id,
                    utilization_percent: editingUtilization.utilization_percent,
                    start_date: editingUtilization.start_date,
                    end_date: editingUtilization.end_date || '',
                    role: editingUtilization.role || '',
                    type: editingUtilization.type || 'Billable',
                } : undefined}
                onSubmit={handleFormSubmit}
                isLoading={createUtilization.isPending || updateUtilization.isPending}
            />

            <ProjectFormDialog
                open={projectDialogOpen}
                onOpenChange={setProjectDialogOpen}
                project={project}
                entities={[project.entity!]} // Simplified for now, in real app pass all entities
                accounts={[]} // Simplified for now
                onSubmit={handleProjectUpdate}
                isLoading={updateProject.isPending}
            />
        </div>
    );
}

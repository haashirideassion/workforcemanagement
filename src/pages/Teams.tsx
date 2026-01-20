import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import type { ProjectFormData } from '@/components/projects/ProjectFormDialog';

import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project } from '@/types';
import { useEntities } from '@/hooks/useEntities';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';





function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
        case 'on-hold':
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">On Hold</Badge>;
        case 'completed':
            return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Completed</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function Teams() {
    const navigate = useNavigate();
    const [formOpen, setFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const { data: projects = [], isLoading } = useProjects({ search: '' });
    const { data: entities = [] } = useEntities();

    const createProject = useCreateProject();
    const updateProject = useUpdateProject();

    const handleFormSubmit = (values: ProjectFormData) => {
        if (editingProject) {
            updateProject.mutate(
                { id: editingProject.id, ...values },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        setEditingProject(null);
                        toast.success('Team updated successfully');
                    },
                    onError: (error: any) => {
                        toast.error(`Failed to update team: ${error.message}`);
                    }
                }
            );
        } else {
            createProject.mutate(
                { ...values, status: 'active' },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        toast.success('Team created successfully');
                    },
                    onError: (error: any) => {
                        toast.error(`Failed to create team: ${error.message}`);
                    }
                }
            );
        }
    };

    const handleEditClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProject(project);
        setFormOpen(true);
    };

    if (isLoading) return <Loading fullPage />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Teams</h1>
                    <p className="text-muted-foreground">
                        Manage your delivery teams and engagement units
                    </p>
                </div>
                <Button
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                    onClick={() => {
                        setEditingProject(null);
                        setFormOpen(true);
                    }}
                >
                    <Plus size={16} className="mr-2" />
                    Add Team
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                    const teamSize = project.allocations?.length || 0;

                    // Calculate progress
                    let progress = 0;
                    if (project.start_date && project.end_date) {
                        const start = new Date(project.start_date).getTime();
                        const end = new Date(project.end_date).getTime();
                        const now = Date.now();
                        progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
                    }
                    if (project.status === 'completed') progress = 100;

                    return (
                        <Card
                            key={project.id}
                            className="cursor-pointer transition-shadow hover:shadow-md"
                            onClick={() => navigate(`/teams/${project.id}`)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{project.entity?.name}</Badge>
                                    {getStatusBadge(project.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(project, e)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Team Size</p>
                                        <p className="font-medium">{teamSize} members</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-muted-foreground">End Date</p>
                                        <p className="font-medium">{project.end_date || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Project Form Dialog */}
            <ProjectFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                entities={entities}
                project={editingProject || undefined}
                onSubmit={handleFormSubmit}
                isLoading={createProject.isPending || updateProject.isPending}
            />
        </div>
    );
}

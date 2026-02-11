import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Funnel, MagnifyingGlass } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectSeparator,
    SelectLabel,
    SelectGroup,
} from "@/components/ui/select";
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import type { ProjectFormData } from '@/components/projects/ProjectFormDialog';

import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project } from '@/types';
import { useEntities } from '@/hooks/useEntities';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import { useAccounts } from '@/hooks/useAccounts';
import { shouldUpdateProjectStatus } from '@/lib/projectStatusUtils';

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return <Badge variant="green">Active</Badge>;
        case 'on-hold':
            return (
                <div className="flex flex-col items-end gap-1">
                    <Badge variant="yellow">On Hold</Badge>
                    <span className="text-[10px] text-muted-foreground italic">Auto-bench after 7 days</span>
                </div>
            );
        case 'completed':
            return <Badge variant="blue">Completed</Badge>;
        case 'proposal':
            return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Proposal</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export function Projects() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(() => {
        if (searchParams.get('nearing_completion') === 'true') return 'near-completion';
        return searchParams.get('status') || 'all';
    });
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [accountFilter, setAccountFilter] = useState<string>(searchParams.get('accountId') || 'all');
    const [fromDate, setFromDate] = useState(''); // YYYY-MM-DD
    const [toDate, setToDate] = useState(''); // YYYY-MM-DD

    const isSpecialStatus = ['near-completion', 'overdue', 'not-started'].includes(statusFilter);

    // Fetch all projects without server-side filtering for client-side performance
    const { data: projects = [], isLoading } = useProjects();

    const { data: entities = [] } = useEntities();
    const { data: accounts = [] } = useAccounts();

    const createProject = useCreateProject();
    const updateProject = useUpdateProject();

    // Automatic status management: Check and update proposal projects
    useEffect(() => {
        if (projects.length > 0) {
            projects.forEach(project => {
                const { shouldUpdate, newStatus } = shouldUpdateProjectStatus(project);
                if (shouldUpdate && newStatus) {
                    // Silently update the project status
                    updateProject.mutate(
                        { id: project.id, status: newStatus },
                        {
                            onSuccess: () => {
                                console.log(`Project "${project.name}" automatically updated to ${newStatus}`);
                            }
                        }
                    );
                }
            });
        }
    }, [projects.length]); // Only run when projects are loaded


    // Client-side filtering for better performance
    const filteredProjects = projects.filter(project => {
        // Search filter
        if (search && !project.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }

        // Entity filter
        if (entityFilter !== 'all' && project.entity_id !== entityFilter) {
            return false;
        }

        // Account filter
        if (accountFilter !== 'all' && project.account_id !== accountFilter) {
            return false;
        }

        // Status filter (basic)
        if (statusFilter !== 'all' && !isSpecialStatus && project.status !== statusFilter) {
            return false;
        }

        // Status Filtering (Special Cases)
        if (statusFilter === 'near-completion') {
            let progress = 0;
            if (project.start_date && project.end_date) {
                const start = new Date(project.start_date).getTime();
                const end = new Date(project.end_date).getTime();
                const now = Date.now();
                progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
            }
            if (project.status === 'completed') progress = 100;
            if (project.status === 'proposal') progress = 0;

            if (progress < 80 || project.status === 'completed') return false;
        }

        if (statusFilter === 'overdue') {
            if (project.status === 'completed') return false;
            // Assumes overdue if end date passed
            if (!project.end_date) return false;
            return project.end_date < new Date().toISOString().split('T')[0];
        }

        if (statusFilter === 'not-started') {
            // Assumes not started if start date is in future
            if (!project.start_date) return false;
            const today = new Date().toISOString().split('T')[0];
            return project.start_date > today;
        }

        // Date range filter
        if (fromDate || toDate) {
            if (project.start_date && project.end_date) {
                const projStart = project.start_date;
                const projEnd = project.end_date;

                // Check if project overlaps with the selected range
                // If only From Date is selected: Show projects ending after filtered From Date
                if (fromDate && !toDate) {
                    return projEnd >= fromDate;
                }
                // If only To Date is selected: Show projects starting before filtered To Date
                if (!fromDate && toDate) {
                    return projStart <= toDate;
                }
                // If both selected: Show overlap
                if (fromDate && toDate) {
                    return projStart <= toDate && projEnd >= fromDate;
                }
            } else {
                return false;
            }
        }

        return true;
    });

    const handleFormSubmit = (values: ProjectFormData) => {
        if (editingProject) {
            updateProject.mutate(
                { id: editingProject.id, ...values },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        setEditingProject(null);
                        toast.success('Project updated successfully');
                    },
                    onError: (error: any) => {
                        toast.error(`Failed to update project: ${error.message}`);
                    }
                }
            );
        } else {
            createProject.mutate(
                { ...values, status: 'active' },
                {
                    onSuccess: () => {
                        setFormOpen(false);
                        toast.success('Project created successfully');
                    },
                    onError: (error: any) => {
                        toast.error(`Failed to create project: ${error.message}`);
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
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage your delivery projects and engagement units
                    </p>
                </div>
                <Button
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                    onClick={() => {
                        setEditingProject(null);
                        setFormOpen(true);
                    }}
                    data-testid="add-project-button"
                >
                    <Plus size={16} className="mr-2" />
                    Add Project
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1">
                            <MagnifyingGlass
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                size={16}
                            />
                            <Input
                                placeholder="Search projects..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Entities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Entities</SelectItem>
                                    {entities.map((entity) => (
                                        <SelectItem key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={accountFilter} onValueChange={setAccountFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Accounts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectSeparator />
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="proposal">Proposal</SelectItem>
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Insights</SelectLabel>
                                    <SelectItem value="near-completion">Near Completion (≥80%)</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="not-started">Not Started</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">From:</span>
                            <Input
                                type="date"
                                placeholder="From Date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-[140px]"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
                            <Input
                                type="date"
                                placeholder="To Date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-[140px]"
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Funnel size={16} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => {
                    const teamSize = project.utilization?.length || (project as any).teamSize || 0;
                    const accountName = accounts.find(acc => acc.id === project.account_id)?.name || 'N/A';

                    // Calculate progress
                    let progress = 0;
                    if (project.start_date && project.end_date) {
                        const start = new Date(project.start_date).getTime();
                        const end = new Date(project.end_date).getTime();
                        const now = Date.now();
                        progress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
                    }
                    if (project.status === 'completed') progress = 100;
                    if (project.status === 'proposal') progress = 0;

                    return (
                        <Card
                            key={project.id}
                            className="cursor-pointer transition-all hover:shadow-md"
                            onClick={() => navigate(`/projects/${project.id}`)}
                            data-testid={`project-card-${project.id}`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline">{project.entity?.name}</Badge>
                                        <span className="text-xs text-muted-foreground">{accountName}</span>
                                    </div>
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
                                    <SegmentedProgress value={progress} size="sm" />
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
                accounts={accounts}
                project={editingProject || undefined}
                onSubmit={handleFormSubmit}
                isLoading={createProject.isPending || updateProject.isPending}
            />
        </div>
    );
}

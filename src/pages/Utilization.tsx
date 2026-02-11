import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useEmployees } from '@/hooks/useEmployees';

function getUtilizationCategory(utilization: number) {
    if (utilization >= 80) return { label: 'Fully Utilized', variant: 'green' as const };
    if (utilization > 50) return { label: 'Partially Utilized', variant: 'yellow' as const };
    return { label: 'Available', variant: 'destructive' as const };
}

export function Utilization() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: employees = [], isLoading } = useEmployees();

    const filteredData = employees.filter((item) => {
        // Entity Filter
        const matchesEntity = entityFilter === 'all' || item.entity?.name === entityFilter;

        // Search Filter (Name or Project)
        // Check active projects in utilization_data
        const activeProjects = item.utilization_data?.filter(u => 
            (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0])
        ) || [];

        const matchesSearch = search === '' ||
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            activeProjects.some(p => p.project?.name.toLowerCase().includes(search.toLowerCase()));

        // Status Filter
        const utilization = item.utilization || 0;
        let matchesStatus = true;
        if (statusFilter === 'fully') matchesStatus = utilization >= 80;
        else if (statusFilter === 'partial') matchesStatus = utilization > 50 && utilization < 80;
        else if (statusFilter === 'available') matchesStatus = utilization <= 50;

        return matchesEntity && matchesSearch && matchesStatus;
    });

    const fullyUtilizedCount = filteredData.filter(e => (e.utilization || 0) >= 80).length;
    const partiallyUtilizedCount = filteredData.filter(e => (e.utilization || 0) > 50 && (e.utilization || 0) < 80).length;
    const availableCount = filteredData.filter(e => (e.utilization || 0) <= 50).length;

    if (isLoading) return <div className="p-8 text-center">Loading utilization metrics...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Resource Utilization</h1>
                    <p className="text-muted-foreground">
                        Track resource utilization across projects
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <MagnifyingGlass
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                size={16}
                            />
                            <Input
                                placeholder="Search employees or projects..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={entityFilter} onValueChange={setEntityFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Entity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entities</SelectItem>
                                <SelectItem value="ITS">ITS</SelectItem>
                                <SelectItem value="IBCC">IBCC</SelectItem>
                                <SelectItem value="IITT">IITT</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Utilization Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="fully">Fully Utilized (≥80%)</SelectItem>
                                <SelectItem value="partial">Partially Utilized (51-79%)</SelectItem>
                                <SelectItem value="available">Available (≤50%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Fully Utilized (≥80%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600" data-testid="utilization-fully-count">{fullyUtilizedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Partially Utilized (51-79%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600" data-testid="utilization-partial-count">{partiallyUtilizedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available (&le;50%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600" data-testid="utilization-available-count">{availableCount}</div>
                    </CardContent>
                </Card>
            </div>
            {/* Utilization Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Employee</TableHead>
                                <TableHead>Projects</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((employee) => {
                                    const category = getUtilizationCategory(employee.utilization || 0);
                                    const activeProjects = employee.utilization_data?.filter(u => 
                                        (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0])
                                    ) || [];

                                    return (
                                        <TableRow key={employee.id} data-testid="utilization-row">
                                            <TableCell className="pl-6 font-medium" data-testid="utilization-employee-name">{employee.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-2 max-w-[300px]">
                                                    {activeProjects.length > 0 ? (
                                                        activeProjects.map((alloc, index) => (
                                                            <Badge
                                                                key={`${alloc.id}-${index}`}
                                                                variant="secondary"
                                                                className="cursor-pointer hover:bg-slate-200 transition-colors font-normal text-xs"
                                                                onClick={() => {
                                                                    if (alloc.project?.id) navigate(`/projects/${alloc.project.id}`);
                                                                }}
                                                            >
                                                                {alloc.project?.name || 'Unknown Project'}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <SegmentedProgress value={employee.utilization || 0} size="sm" className="w-24" />
                                                    <span className="text-sm">{employee.utilization || 0}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={category.variant}>
                                                    {category.label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

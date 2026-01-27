import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mock data - utilization represents % effort utilized to projects
const mockUtilizationData = [
    { id: '1', name: 'John Doe', entity: 'ITS', utilization: 85, projectCount: 2 },
    { id: '2', name: 'Jane Smith', entity: 'IBCC', utilization: 60, projectCount: 1 },
    { id: '3', name: 'Mike Johnson', entity: 'IITT', utilization: 45, projectCount: 1 },
    { id: '4', name: 'Sarah Williams', entity: 'ITS', utilization: 100, projectCount: 3 },
    { id: '5', name: 'David Brown', entity: 'IBCC', utilization: 20, projectCount: 0 },
    { id: '6', name: 'Emily Davis', entity: 'IITT', utilization: 75, projectCount: 2 },
    { id: '7', name: 'Chris Miller', entity: 'ITS', utilization: 0, projectCount: 0 },
    { id: '8', name: 'Lisa Wilson', entity: 'IBCC', utilization: 90, projectCount: 2 },
];

function getUtilizationCategory(utilization: number) {
    if (utilization >= 80) return { label: 'Fully Utilized', variant: 'green' as const };
    if (utilization > 50) return { label: 'Partially Utilized', variant: 'yellow' as const };
    return { label: 'Available', variant: 'blue' as const };
}

export function Utilization() {
    const fullyUtilizedCount = mockUtilizationData.filter(e => e.utilization >= 80).length;
    const partiallyUtilizedCount = mockUtilizationData.filter(e => e.utilization > 50 && e.utilization < 80).length;
    const availableCount = mockUtilizationData.filter(e => e.utilization <= 50).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Resource Utilization</h1>
                <p className="text-muted-foreground">
                    Track resource utilization across projects
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Fully Utilized (≥80%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{fullyUtilizedCount}</div>
                        <p className="text-sm text-muted-foreground">employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Partially Utilized (51-79%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{partiallyUtilizedCount}</div>
                        <p className="text-sm text-muted-foreground">employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available (&le;50%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{availableCount}</div>
                        <p className="text-sm text-muted-foreground">employees</p>
                    </CardContent>
                </Card>
            </div>
            {/* Utilization Table */}
            <Card>
                <CardHeader>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All ({mockUtilizationData.length})</TabsTrigger>
                            <TabsTrigger value="fully">Fully Utilized ({fullyUtilizedCount})</TabsTrigger>
                            <TabsTrigger value="partial">Partial ({partiallyUtilizedCount})</TabsTrigger>
                            <TabsTrigger value="available">Available ({availableCount})</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Projects</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUtilizationData.map((employee) => {
                                const category = getUtilizationCategory(employee.utilization);
                                return (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{employee.entity}</Badge>
                                        </TableCell>
                                        <TableCell>{employee.projectCount}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <SegmentedProgress value={employee.utilization} segments={20} size="sm" className="w-24" />
                                                <span className="text-sm">{employee.utilization}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={category.variant}>
                                                {category.label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

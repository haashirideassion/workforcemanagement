import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mock data
const mockUtilizationData = [
    { id: '1', name: 'John Doe', entity: 'ITA', utilization: 85, allocations: 2 },
    { id: '2', name: 'Jane Smith', entity: 'IBCC', utilization: 60, allocations: 1 },
    { id: '3', name: 'Mike Johnson', entity: 'IITT', utilization: 45, allocations: 1 },
    { id: '4', name: 'Sarah Williams', entity: 'ITA', utilization: 100, allocations: 3 },
    { id: '5', name: 'David Brown', entity: 'IBCC', utilization: 20, allocations: 0 },
    { id: '6', name: 'Emily Davis', entity: 'IITT', utilization: 75, allocations: 2 },
    { id: '7', name: 'Chris Miller', entity: 'ITA', utilization: 0, allocations: 0 },
    { id: '8', name: 'Lisa Wilson', entity: 'IBCC', utilization: 90, allocations: 2 },
];

function getUtilizationCategory(utilization: number) {
    if (utilization >= 80) return { label: 'Healthy', color: 'bg-green-100 text-green-700' };
    if (utilization >= 50) return { label: 'Watch', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Risk', color: 'bg-red-100 text-red-700' };
}

export function Utilization() {
    const healthyCount = mockUtilizationData.filter(e => e.utilization >= 80).length;
    const watchCount = mockUtilizationData.filter(e => e.utilization >= 50 && e.utilization < 80).length;
    const riskCount = mockUtilizationData.filter(e => e.utilization < 50).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Utilization</h1>
                <p className="text-muted-foreground">
                    Track employee utilization across projects
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Healthy (≥80%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{healthyCount}</div>
                        <p className="text-sm text-muted-foreground">employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Watch (50-79%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{watchCount}</div>
                        <p className="text-sm text-muted-foreground">employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Risk (&lt;50%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{riskCount}</div>
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
                            <TabsTrigger value="healthy">Healthy ({healthyCount})</TabsTrigger>
                            <TabsTrigger value="watch">Watch ({watchCount})</TabsTrigger>
                            <TabsTrigger value="risk">Risk ({riskCount})</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Allocations</TableHead>
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
                                        <TableCell>{employee.allocations} projects</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={employee.utilization} className="h-2 w-24" />
                                                <span className="text-sm">{employee.utilization}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${category.color} hover:${category.color}`}>
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

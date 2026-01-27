import { useState } from 'react';
import { DownloadSimple, Funnel, Tag } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { RiskTag } from '@/types';

// Mock data - utilization represents % effort, performance is out of 5
const mockOptimizationData = [
    { id: '1', name: 'David Brown', entity: 'IBCC', utilization: 20, performance: 2.25, riskTag: 'at-risk' as RiskTag },
    { id: '2', name: 'Chris Miller', entity: 'ITS', utilization: 0, performance: 1.5, riskTag: 'layoff-consideration' as RiskTag },
    { id: '3', name: 'Mike Johnson', entity: 'IITT', utilization: 45, performance: 3.25, riskTag: 'review-required' as RiskTag },
    { id: '4', name: 'Tom Anderson', entity: 'IBCC', utilization: 30, performance: 2.5, riskTag: undefined },
    { id: '5', name: 'Amy Chen', entity: 'ITS', utilization: 15, performance: 3.5, riskTag: 'review-required' as RiskTag },
];

function getRiskTagBadge(tag?: RiskTag) {
    switch (tag) {
        case 'review-required':
            return <Badge variant="yellow">Review Required</Badge>;
        case 'at-risk':
            return <Badge variant="orange">At Risk</Badge>;
        case 'layoff-consideration':
            return <Badge variant="destructive">Layoff Consideration</Badge>;
        default:
            return <Badge variant="outline">Untagged</Badge>;
    }
}

export function Optimization() {
    const [entityFilter, setEntityFilter] = useState('all');
    const [utilizationFilter, setUtilizationFilter] = useState('all');

    const filteredData = mockOptimizationData.filter((emp) => {
        const matchesEntity = entityFilter === 'all' || emp.entity === entityFilter;
        const matchesUtilization =
            utilizationFilter === 'all' ||
            (utilizationFilter === 'low' && emp.utilization < 50) ||
            (utilizationFilter === 'medium' && emp.utilization >= 50 && emp.utilization < 80) ||
            (utilizationFilter === 'high' && emp.utilization >= 80);
        return matchesEntity && matchesUtilization;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Optimization & Crisis Planning</h1>
                    <p className="text-muted-foreground">
                        Advanced workforce optimization and risk management
                    </p>
                </div>
                <Button variant="outline">
                    <DownloadSimple size={16} className="mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Funnel size={18} />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
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
                        <Select value={utilizationFilter} onValueChange={setUtilizationFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Utilization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Utilization</SelectItem>
                                <SelectItem value="low">Low (&lt;50%)</SelectItem>
                                <SelectItem value="medium">Medium (50-79%)</SelectItem>
                                <SelectItem value="high">High (≥80%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Risk Groups */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag size={20} className="text-brand-600" />
                        Risk Analysis ({filteredData.length} employees)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Performance</TableHead>
                                <TableHead>Risk Tag</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{employee.entity}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <SegmentedProgress value={employee.utilization} size="sm" className="w-16" />
                                            <span className="text-sm">{employee.utilization}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={employee.performance >= 3 ? 'text-green-600' : employee.performance >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                                            {employee.performance.toFixed(1)}/5
                                        </span>
                                    </TableCell>
                                    <TableCell>{getRiskTagBadge(employee.riskTag)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">
                                            <Tag size={16} className="mr-1" />
                                            Tag
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

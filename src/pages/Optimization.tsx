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
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee } from '@/types';

const TODAY = new Date(); // Current system date

function getRiskStatus(employee: Employee) {
    const utilization = employee.utilization || 0;
    
    // Calculate bench duration using native Date arithmetic
    const createdAt = employee.created_at ? new Date(employee.created_at) : TODAY;
    const benchDays = Math.floor((TODAY.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (utilization === 0) {
        if (benchDays > 45) {
            return { label: 'Crisis: >45d Bench', variant: 'destructive' as const, icon: <Warning size={14} className="mr-1" /> };
        }
        if (benchDays > 30) {
            return { label: 'Layoff Recommended', variant: 'orange' as const, icon: <WarningCircle size={14} className="mr-1" /> };
        }
        return { label: 'At Risk', variant: 'yellow' as const, icon: <Info size={14} className="mr-1" /> };
    }
    
    if (utilization < 50) {
        return { label: 'Underutilized', variant: 'secondary' as const, icon: <Info size={14} className="mr-1" /> };
    }

    return { label: 'Optimal', variant: 'outline' as const, icon: null };
}

import { Warning, WarningCircle, Info } from '@phosphor-icons/react';

export function Optimization() {
    const [entityFilter, setEntityFilter] = useState('all');
    const [utilizationFilter, setUtilizationFilter] = useState('all');
    const [benchStatusFilter, setBenchStatusFilter] = useState('all');
    const { data: employees = [], isLoading } = useEmployees();

    const filteredData = employees.filter((emp) => {
        const matchesEntity = entityFilter === 'all' || emp.entity?.name === entityFilter;
        const utilization = emp.utilization || 0;
        const matchesUtilization =
            utilizationFilter === 'all' ||
            (utilizationFilter === 'low' && utilization < 50) ||
            (utilizationFilter === 'medium' && utilization >= 50 && utilization < 80) ||
            (utilizationFilter === 'high' && utilization >= 80);
        
        const matchesBenchStatus =
            benchStatusFilter === 'all' ||
            (benchStatusFilter === 'layoff' && emp.bench_status === 'layoff-consideration') ||
            (benchStatusFilter === 'at-risk' && emp.bench_status === 'at-risk') ||
            (benchStatusFilter === 'review' && emp.bench_status === 'review-required');
        
        return matchesEntity && matchesUtilization && matchesBenchStatus;
    });

    if (isLoading) return <div className="p-8 text-center italic">Analyzing workforce metrics...</div>;

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
                        <Select value={benchStatusFilter} onValueChange={setBenchStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Bench Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="layoff">Layoff Consideration</SelectItem>
                                <SelectItem value="at-risk">At Risk</SelectItem>
                                <SelectItem value="review">Review Required</SelectItem>
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
                                <TableHead>Specialization</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Status / Risk</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                                {filteredData.map((employee) => {
                                    const risk = getRiskStatus(employee);
                                    return (
                                        <TableRow key={employee.id} data-testid={`emp-row-${employee.id}`}>
                                            <TableCell>
                                                <div className="font-medium">{employee.name}</div>
                                                <div className="text-xs text-muted-foreground">{employee.role}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal" data-testid="emp-specialization">
                                                    {employee.specialization || 'Generalist'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{employee.entity?.name || 'N/A'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <SegmentedProgress value={employee.utilization || 0} size="sm" className="w-16" />
                                                    <span className="text-sm" data-testid="emp-utilization">{employee.utilization || 0}%</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant={risk.variant} className="flex items-center w-fit" data-testid="emp-risk-badge">
                                                    {risk.icon}
                                                    {risk.label}
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

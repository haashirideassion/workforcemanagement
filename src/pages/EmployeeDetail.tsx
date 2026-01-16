import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, EnvelopeSimple, Buildings, Briefcase, Star, Certificate } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useEmployee } from '@/hooks/useEmployees';

function getUtilizationCategory(utilization: number) {
    if (utilization >= 80) return { label: 'Healthy', color: 'bg-green-100 text-green-700' };
    if (utilization >= 50) return { label: 'Watch', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Risk', color: 'bg-red-100 text-red-700' };
}

function getProficiencyColor(proficiency: string) {
    switch (proficiency) {
        case 'expert': return 'bg-purple-100 text-purple-700';
        case 'advanced': return 'bg-blue-100 text-blue-700';
        case 'intermediate': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

export function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: employee, isLoading, error } = useEmployee(id || '');

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Employee not found</p>
                <Button variant="link" onClick={() => navigate('/employees')}>
                    Back to Employees
                </Button>
            </div>
        );
    }

    // Calculate utilization from allocations
    const today = new Date().toISOString().split('T')[0];
    const activeAllocations = employee.allocations?.filter(
        (a) => a.start_date <= today && (!a.end_date || a.end_date >= today)
    ) || [];
    const utilization = Math.min(
        100,
        activeAllocations.reduce((sum, a) => sum + a.allocation_percent, 0)
    );
    const category = getUtilizationCategory(utilization);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{employee.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <EnvelopeSimple size={14} />
                            {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                            <Buildings size={14} />
                            {employee.entity?.name || 'N/A'}
                        </span>
                    </div>
                </div>
                <Badge className={category.color}>{category.label}</Badge>
                <Badge variant="outline" className="capitalize">{employee.employment_type}</Badge>
            </div>

            {/* Utilization Overview */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Current Utilization</span>
                        <span className="text-2xl font-bold">{utilization}%</span>
                    </div>
                    <Progress value={utilization} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                        {activeAllocations.length} active allocation(s)
                    </p>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="allocations">
                <TabsList>
                    <TabsTrigger value="allocations">
                        <Briefcase size={16} className="mr-2" />
                        Projects & Allocations
                    </TabsTrigger>
                    <TabsTrigger value="skills">
                        <Star size={16} className="mr-2" />
                        Skills & Certifications
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        Performance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="allocations" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Allocations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employee.allocations && employee.allocations.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Allocation</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employee.allocations.map((allocation) => {
                                            const isActive = allocation.start_date <= today &&
                                                (!allocation.end_date || allocation.end_date >= today);
                                            return (
                                                <TableRow key={allocation.id}>
                                                    <TableCell className="font-medium">
                                                        {allocation.project?.name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>{allocation.allocation_percent}%</TableCell>
                                                    <TableCell>{allocation.start_date}</TableCell>
                                                    <TableCell>{allocation.end_date || 'Ongoing'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={isActive ? 'default' : 'secondary'}>
                                                            {isActive ? 'Active' : 'Ended'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    No allocations found
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="skills" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star size={20} className="text-brand-600" />
                                Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employee.skills && employee.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {employee.skills.map((es) => (
                                        <Badge
                                            key={es.skill_id}
                                            className={`${getProficiencyColor(es.proficiency)} ${es.is_primary ? 'ring-2 ring-brand-500' : ''}`}
                                        >
                                            {es.skill?.name} • {es.proficiency}
                                            {es.is_primary && ' ★'}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    No skills assigned
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Certificate size={20} className="text-brand-600" />
                                Certifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employee.certifications && employee.certifications.length > 0 ? (
                                <div className="space-y-3">
                                    {employee.certifications.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{cert.name}</p>
                                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                            </div>
                                            {cert.valid_until && (
                                                <Badge variant="outline">
                                                    Valid until {cert.valid_until}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    No certifications found
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="text-5xl font-bold text-brand-600">
                                    {employee.performance_score?.toFixed(1) || 'N/A'}
                                </div>
                                <div>
                                    <p className="text-muted-foreground">out of 10</p>
                                    <Progress
                                        value={(employee.performance_score || 0) * 10}
                                        className="h-2 w-32 mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

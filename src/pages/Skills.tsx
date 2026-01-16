import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mock data
const mockSkills = [
    { id: '1', name: 'React', category: 'Frontend', employeeCount: 25, gap: false },
    { id: '2', name: 'Node.js', category: 'Backend', employeeCount: 18, gap: false },
    { id: '3', name: 'Python', category: 'Backend', employeeCount: 12, gap: false },
    { id: '4', name: 'TypeScript', category: 'Frontend', employeeCount: 22, gap: false },
    { id: '5', name: 'AWS', category: 'Cloud', employeeCount: 8, gap: true },
    { id: '6', name: 'Kubernetes', category: 'DevOps', employeeCount: 4, gap: true },
    { id: '7', name: 'Machine Learning', category: 'AI/ML', employeeCount: 3, gap: true },
    { id: '8', name: 'PostgreSQL', category: 'Database', employeeCount: 15, gap: false },
];

export function Skills() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Skills Directory</h1>
                    <p className="text-muted-foreground">
                        Manage skills and identify gaps in your workforce
                    </p>
                </div>
                <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                    <Plus size={16} className="mr-2" />
                    Add Skill
                </Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold">{mockSkills.length}</div>
                        <p className="text-sm text-muted-foreground">Total Skills</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-brand-600">
                            {mockSkills.filter(s => !s.gap).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Well-covered Skills</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-red-600">
                            {mockSkills.filter(s => s.gap).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Skill Gaps</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative max-w-md">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input placeholder="Search skills..." className="pl-9" />
                    </div>
                </CardContent>
            </Card>

            {/* Skills Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Skill</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Employees</TableHead>
                                <TableHead>Coverage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockSkills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell className="font-medium">{skill.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{skill.category}</Badge>
                                    </TableCell>
                                    <TableCell>{skill.employeeCount} employees</TableCell>
                                    <TableCell>
                                        {skill.gap ? (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                Gap Identified
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                Well Covered
                                            </Badge>
                                        )}
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

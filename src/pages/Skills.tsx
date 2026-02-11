import { useState } from 'react';
import { MagnifyingGlass, Plus, ChartBar, CheckCircle } from '@phosphor-icons/react';
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
import { SkillFormDialog } from '@/components/skills/SkillFormDialog';
import { useSkills, useCreateSkill } from '@/hooks/useSkills';
import { toast } from 'sonner';

export function Skills() {
    const [search, setSearch] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { data: skills = [], isLoading } = useSkills();
    const createSkill = useCreateSkill();

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground italic">Crunching skills data...</div>;
    }

    const filteredSkills = skills.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.category?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const wellCoveredCount = skills.filter(s => !s.gap).length;


    const handleAddSkill = (values: { name: string; category: string }) => {
        createSkill.mutate(values, {
            onSuccess: () => {
                toast.success(`Skill "${values.name}" added successfully`);
                setIsAddDialogOpen(false);
            },
            onError: (error: any) => {
                toast.error(`Failed to add skill: ${error.message}`);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Skills Directory</h1>
                    <p className="text-muted-foreground mt-1">
                        Map your organizational expertise and identify strategic gaps
                    </p>
                </div>
                <Button 
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsAddDialogOpen(true)}
                >
                    <Plus size={16} className="mr-2" weight="bold" />
                    Add Skill
                </Button>
            </div>

            {/* Summary Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-50 rounded-xl">
                                <ChartBar size={24} className="text-brand-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{skills.length}</div>
                                <p className="text-sm text-muted-foreground font-medium">Total Skills</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {wellCoveredCount}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Well-covered</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Content Card */}
            <Card className="border-none shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-xl">All Knowledge Areas</CardTitle>
                        <div className="relative w-full md:w-72">
                            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input 
                                placeholder="Filter by name or category..." 
                                className="pl-9 h-10" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold">Skill</TableHead>
                                    <TableHead className="font-semibold">Category</TableHead>
                                    <TableHead className="font-semibold">Employees</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSkills.length > 0 ? filteredSkills.map((skill) => (
                                    <TableRow key={skill.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">{skill.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal capitalize">
                                                {skill.category || 'General'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{skill.employeeCount}</span>
                                                <span className="text-muted-foreground text-xs uppercase letter-spacing-wide">members</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {skill.gap ? (
                                                <Badge variant="destructive" className="font-normal">
                                                    Gap Identified
                                                </Badge>
                                            ) : (
                                                <Badge variant="green" className="font-normal">
                                                    Well Covered
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                            No skills match your search criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <SkillFormDialog 
                open={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen} 
                onSubmit={handleAddSkill}
                isLoading={createSkill.isPending}
            />
        </div>
    );
}

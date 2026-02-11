import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MagnifyingGlass,
    Funnel,
    DotsThree,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmployees } from "@/hooks/useEmployees";
import { BenchStatusBadge } from "@/components/BenchStatusBadge";

function getUtilizationBadge(utilization: number) {
    if (utilization >= 80) {
        return <Badge variant="green">Fully Utilized</Badge>;
    } else if (utilization >= 50) {
        return <Badge variant="yellow">Partially Utilized</Badge>;
    } else {
        return <Badge variant="blue">Available</Badge>;
    }
}

export function Bench() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const { data: employees = [], isLoading } = useEmployees();

    // Bench definition: utilization < 10 (or 0, generally bench implies available/0)
    // Dashboard uses < 10 for bench count, so we stick to that consistent logic.
    const benchedEmployees = employees.filter(e => (e.utilization || 0) < 10);

    const filteredEmployees = benchedEmployees.filter((emp) => {
        const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
        const matchesEntity = entityFilter === "all" || emp.entity?.name === entityFilter;
        const matchesType = typeFilter === "all" || emp.employment_type === typeFilter;

        return matchesSearch && matchesEntity && matchesType;
    });

    if (isLoading) return <Loading fullPage />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Bench</h1>
                    <p className="text-muted-foreground mt-1">
                        Employees currently on bench (Utilization &lt; 10%)
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
                                placeholder="Search bench employees..."
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
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="permanent">Permanent</SelectItem>
                                <SelectItem value="retainer">Retainer</SelectItem>
                                <SelectItem value="intern">Intern</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                            <Funnel size={16} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bench Table */}
            <Card>
                <CardContent>
                    <div className="p-4 text-sm text-muted-foreground">
                        Showing {filteredEmployees.length} employees on bench
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Utilization</TableHead>
                                <TableHead>Utilization Status</TableHead>
                                <TableHead>Bench Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/employees/${employee.id}`)}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{employee.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {employee.email}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{employee.entity?.name}</Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {employee.employment_type}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <SegmentedProgress value={employee.utilization || 0} size="sm" className="w-20" />
                                            <span className="text-sm text-muted-foreground">
                                                {employee.utilization || 0}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getUtilizationBadge(employee.utilization || 0)}
                                    </TableCell>
                                    <TableCell>
                                        <BenchStatusBadge 
                                            status={employee.bench_status} 
                                            utilization={employee.utilization}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <DotsThree size={20} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                                                    View Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No employees found on bench matching criteria.
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

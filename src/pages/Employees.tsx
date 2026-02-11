import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlass,
  Plus,
  Funnel,
  DotsThree,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { EmployeeFilterSheet } from "@/components/employees/EmployeeFilterSheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";
import type { EmployeeFormData, ExtendedEmployeeInfo } from "@/components/employees/EmployeeFormDialog";
import type { Employee } from "@/types";
import { Loading } from "@/components/ui/loading";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  useEmployees,
  useCreateEmployee,
  useArchiveEmployee,
  useUpdateEmployee,
} from "@/hooks/useEmployees";
import { useEntities } from "@/hooks/useEntities";

function getUtilizationBadge(utilization: number) {
  if (utilization >= 80) {
    return (
      <Badge variant="green">
        Fully Utilized
      </Badge>
    );
  } else if (utilization >= 50) {
    return (
      <Badge variant="orange">
        Partially Utilized
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive">
        Available
      </Badge>
    );
  }
}

import { useSearchParams } from "react-router-dom";

export function Employees() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as 'all' | 'assigned' | 'virtual_pool' | 'benched' | 'bench_extended' | 'on-hold' || "all";

  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter Logic Mapping
  const getFilterConfig = (filter: string): { range: [number, number], statuses: string[] } => {
    switch (filter) {
      case 'assigned': return { range: [80, 100], statuses: ['fully'] };
      case 'virtual_pool': return { range: [1, 79], statuses: ['partial'] };
      case 'benched': return { range: [0, 0], statuses: ['available'] };
      case 'bench_extended': return { range: [0, 39], statuses: ['available', 'partial'] };
      case 'all':
      default: return { range: [0, 100], statuses: [] };
    }
  };

  const [utilizationRange, setUtilizationRange] = useState<[number, number]>(() => getFilterConfig(initialFilter).range);
  const [statusFilters, setStatusFilters] = useState<string[]>(() => getFilterConfig(initialFilter).statuses);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Tabs "value" derived from range (for UI highlight)
  const getTabValue = () => {
    const [min, max] = utilizationRange;
    if (min === 0 && max === 100) return 'all';
    if (min === 80 && max === 100) return 'assigned';
    if (min === 1 && max === 79) return 'virtual_pool';
    if (min === 0 && max === 0) return 'benched';
    if (min === 0 && max === 39) return 'bench_extended';
    return 'custom';
  };
  const currentTab = getTabValue();

  // Handle Tab Change (Shortcuts)
  const handleTabChange = (value: string) => {
    if (value === 'map') {
      navigate('/utilization-board');
      return;
    }
    const config = getFilterConfig(value);
    setUtilizationRange(config.range);
    setStatusFilters(config.statuses);

    // Update URL without reloading
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') newParams.delete('filter');
    else newParams.set('filter', value);
    navigate({ search: newParams.toString() }, { replace: true });
  };

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useEmployees();
  const { data: entities = [] } = useEntities();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const archiveEmployee = useArchiveEmployee();

  // Counts for tabs (calculated from full dataset)
  const activeEmployees = employees.filter(e => e.status === 'active');
  const counts = {
    all: activeEmployees.length,
    assigned: activeEmployees.filter(e => (e.utilization || 0) >= 80).length,
    virtual_pool: activeEmployees.filter(e => (e.utilization || 0) > 0 && (e.utilization || 0) < 80).length,
    benched: activeEmployees.filter(e => (e.utilization || 0) === 0).length,
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === "all" || emp.entity?.name === entityFilter;
    const matchesType = typeFilter === "all" || emp.employment_type === typeFilter;

    // Use Advanced Range Logic
    const ut = emp.utilization || 0;
    const matchesUtilization = ut >= utilizationRange[0] && ut <= utilizationRange[1];

    // For specific utilization tabs, only show active employees to match counts and dashboard
    if (currentTab !== 'all' && emp.status !== 'active') return false;

    return matchesSearch && matchesEntity && matchesType && matchesUtilization;
  });

  if (isLoading) return <Loading fullPage />;

  const EMPLOYEE_INFO_KEY = 'employee_extended_info';

  const handleFormSubmit = (values: EmployeeFormData, extendedInfo?: ExtendedEmployeeInfo) => {
    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee.id, ...values } as Partial<Employee> & { id: string },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingEmployee(null);
            toast.success("Employee updated successfully");
          },
          onError: (error: any) => {
            toast.error(`Failed to update employee: ${error.message}`);
          },
        }
      );
    } else {
      createEmployee.mutate(
        { ...values, status: values.status || "active" } as any,
        {
          onSuccess: (newEmployee) => {
            // Save extended info to localStorage if provided
            if (extendedInfo && newEmployee?.id) {
              const hasExtendedData = extendedInfo.phoneNumber ||
                extendedInfo.dateOfJoining ||
                extendedInfo.pastExperience ||
                extendedInfo.designation ||
                extendedInfo.pastCompanies?.length > 0;
              if (hasExtendedData) {
                localStorage.setItem(
                  `${EMPLOYEE_INFO_KEY}_${newEmployee.id}`,
                  JSON.stringify(extendedInfo)
                );
              }
            }
            setFormOpen(false);
            toast.success("Employee added successfully");
          },
          onError: (error: any) => {
            toast.error(`Failed to add employee: ${error.message}`);
          },
        }
      );
    }
  };

  const handleEditClick = (employee: Employee, e: any) => {
    e.stopPropagation();
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleDeactivate = (
    id: string,
    e: any
  ) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to deactivate this employee?")) {
      archiveEmployee.mutate(id, {
        onSuccess: () => {
          toast.success("Employee deactivated successfully");
        },
        onError: (error: any) => {
          toast.error(`Failed to deactivate employee: ${error.message}`);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workforce directory and utilization
          </p>
        </div>
        <Button
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => {
            setEditingEmployee(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          Add Employee
        </Button>
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
                placeholder="Search employees..."
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
            <Button variant="outline" size="icon" onClick={() => setFilterSheetOpen(true)}>
              <Funnel size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent>
          <Tabs value={currentTab} onValueChange={(v) => handleTabChange(v)} className="px-6 pt-4 mb-2">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="assigned" data-testid="tab-utilized">Utilized ({counts.assigned})</TabsTrigger>
              <TabsTrigger value="virtual_pool" data-testid="tab-virtual-pool">Virtual Pool ({counts.virtual_pool})</TabsTrigger>
              <TabsTrigger value="benched" data-testid="tab-benched">Benched ({counts.benched})</TabsTrigger>
              <TabsTrigger value="map" data-testid="tab-map">Map</TabsTrigger>
            </TabsList>
          </Tabs>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <ContextMenu key={employee.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      data-testid={`employee-row-${employee.id}`}
                    >
                      <TableCell>
                        <span className="text-sm font-medium text-muted-foreground">
                          {employee.employee_code || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.role || '-'} • {employee.experience || 0} YOE
                          </p>
                        </div>

                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {employee.entity?.name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {employee.employment_type}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {(() => {
                            const activeProjects = employee.utilization_data?.filter(u =>
                              (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0]) &&
                              u.start_date <= new Date().toISOString().split('T')[0]
                            ) || [];

                            if (activeProjects.length === 0) return <span className="text-muted-foreground">-</span>;

                            return activeProjects.map((u) => (
                              <Badge
                                key={u.id}
                                variant="secondary"
                                className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-normal text-xs px-2 py-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (u.project?.id) navigate(`/projects/${u.project.id}`);
                                }}
                              >
                                {u.project?.name}
                              </Badge>
                            ));
                          })()}
                        </div>
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
                            <DropdownMenuItem 
                              disabled={employee.status !== 'active'}
                              onClick={() => navigate(`/employees/${employee.id}`)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={employee.status !== 'active'}
                              onClick={(e) => handleEditClick(employee as any, e)}
                            >
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={employee.status !== 'active'}
                              className="text-red-600"
                              onClick={(e) => handleDeactivate(employee.id, e)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      disabled={employee.status !== 'active'}
                      onSelect={() => navigate(`/employees/${employee.id}`)}
                    >
                      View Details
                    </ContextMenuItem>
                    <ContextMenuItem 
                      disabled={employee.status !== 'active'}
                      onSelect={(e) => handleEditClick(employee as any, e as any)}
                    >
                      Edit Employee
                    </ContextMenuItem>
                    <ContextMenuItem disabled={employee.status !== 'active'}>Assign to Project</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      disabled={employee.status !== 'active'}
                      className="text-red-500"
                      onSelect={(e) => handleDeactivate(employee.id, e)}
                    >
                      Deactivate
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entities={entities}
        employee={editingEmployee || undefined}
        onSubmit={handleFormSubmit}
        isLoading={createEmployee.isPending || updateEmployee.isPending}
      />

      <EmployeeFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        initialFilters={{
          minUtilization: utilizationRange[0],
          maxUtilization: utilizationRange[1],
          statuses: statusFilters
        }}
        onApply={(filters) => {
          setUtilizationRange([filters.minUtilization, filters.maxUtilization]);
          setStatusFilters(filters.statuses);
        }}
        onClear={() => {
          setUtilizationRange([0, 100]);
          setStatusFilters([]);
        }}
        count={filteredEmployees.length}
      />
    </div>
  );
}

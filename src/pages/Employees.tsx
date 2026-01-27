import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlass,
  Plus,
  Funnel,
  DotsThree,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { EmployeeFilterSheet, type FilterState } from "@/components/employees/EmployeeFilterSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Badge variant="yellow">
        Partially Utilized
      </Badge>
    );
  } else {
    return (
      <Badge variant="blue">
        Available
      </Badge>
    );
  }
}

import { useSearchParams } from "react-router-dom";

export function Employees() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') as 'all' | 'assigned' | 'virtual_pool' | 'benched' || "all";

  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Advanced Filters State
  const [utilizationRange, setUtilizationRange] = useState<[number, number]>([0, 100]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Tabs "value" derived from range (for UI highlight)
  const getTabValue = () => {
    const [min, max] = utilizationRange;
    if (min === 0 && max === 100) return 'all';
    if (min === 80 && max === 100) return 'assigned';
    if (min === 1 && max === 79) return 'virtual_pool'; // Approx? Logic below uses >0 && <80
    if (min === 0 && max === 0) return 'benched';
    return 'custom';
  };
  const currentTab = getTabValue();

  // Handle Tab Change (Shortcuts)
  const handleTabChange = (value: string) => {
    if (value === 'all') {
      setUtilizationRange([0, 100]);
      setStatusFilters([]);
    } else if (value === 'assigned') {
      setUtilizationRange([80, 100]);
      setStatusFilters(['fully']);
    } else if (value === 'virtual_pool') {
      setUtilizationRange([1, 79]);
      setStatusFilters(['partial']); // Approx
    } else if (value === 'benched') {
      setUtilizationRange([0, 0]);
      setStatusFilters(['available']); // "Available" usually means <=50, but "Benched" is 0.
    }
  };

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useEmployees();
  const { data: entities = [] } = useEntities();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const archiveEmployee = useArchiveEmployee();

  // Counts for tabs (calculated from full dataset)
  const counts = {
    all: employees.length,
    assigned: employees.filter(e => (e.utilization || 0) >= 80).length,
    virtual_pool: employees.filter(e => (e.utilization || 0) > 0 && (e.utilization || 0) < 80).length,
    benched: employees.filter(e => (e.utilization || 0) === 0).length,
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === "all" || emp.entity?.name === entityFilter;
    const matchesType = typeFilter === "all" || emp.employment_type === typeFilter;

    // Use Advanced Range Logic
    const ut = emp.utilization || 0;
    const matchesUtilization = ut >= utilizationRange[0] && ut <= utilizationRange[1];

    return matchesSearch && matchesEntity && matchesType && matchesUtilization;
  });

  if (isLoading) return <Loading fullPage />;

  const EMPLOYEE_INFO_KEY = 'employee_extended_info';

  const handleFormSubmit = (values: EmployeeFormData, extendedInfo?: ExtendedEmployeeInfo) => {
    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee.id, ...values },
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
        { ...values, status: "active" },
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
            Manage your workforce directory and utilizations
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
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="assigned">Utilized ({counts.assigned})</TabsTrigger>
              <TabsTrigger value="virtual_pool">Virtual Pool ({counts.virtual_pool})</TabsTrigger>
              <TabsTrigger value="benched">Benched ({counts.benched})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Project</TableHead>
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
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>

                      </TableCell>
                      <TableCell className="capitalize">
                        {employee.employment_type}
                      </TableCell>
                      <TableCell>
                        {employee.role || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {(() => {
                            const activeProjects = employee.utilization_data?.filter(u =>
                              (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0]) &&
                              u.start_date <= new Date().toISOString().split('T')[0]
                            ) || [];

                            if (activeProjects.length === 0) return '-';

                            return activeProjects.map((u, i) => (
                              <span key={u.id}>
                                <span
                                  className="hover:underline cursor-pointer text-brand-600 dark:text-brand-400 font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (u.project?.id) navigate(`/projects/${u.project.id}`);
                                  }}
                                >
                                  {u.project?.name}
                                </span>
                                {i < activeProjects.length - 1 && ", "}
                              </span>
                            ));
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SegmentedProgress value={employee.utilization} size="sm" className="w-20" />
                          <span className="text-sm text-muted-foreground">
                            {employee.utilization}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getUtilizationBadge(employee.utilization)}
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
                            <DropdownMenuItem onClick={(e) => handleEditClick(employee as any, e)}>
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem
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
                      onSelect={() => navigate(`/employees/${employee.id}`)}
                    >
                      View Details
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={(e) => handleEditClick(employee as any, e as any)}>
                      Edit Employee
                    </ContextMenuItem>
                    <ContextMenuItem>Assign to Project</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
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

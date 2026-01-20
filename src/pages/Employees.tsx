import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlass,
  Plus,
  Funnel,
  DotsThree,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import type { EmployeeFormData } from "@/components/employees/EmployeeFormDialog";
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
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        Healthy
      </Badge>
    );
  } else if (utilization >= 50) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        Watch
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Risk</Badge>
    );
  }
}

export function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { data: employees = [], isLoading } = useEmployees();
  const { data: entities = [] } = useEntities();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const archiveEmployee = useArchiveEmployee();

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const matchesEntity =
      entityFilter === "all" || emp.entity?.name === entityFilter;
    // Note: Check actual database field values for employment_type or correct mapping
    const matchesType =
      typeFilter === "all" || emp.employment_type === typeFilter;
    return matchesSearch && matchesEntity && matchesType;
  });

  if (isLoading) return <Loading fullPage />;

  const handleFormSubmit = (values: EmployeeFormData) => {
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
          onSuccess: () => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your workforce across all entities
          </p>
        </div>
        <Button
          className="bg-brand-600 hover:bg-brand-700 text-white"
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
        <CardContent className="pt-6">
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
                <SelectItem value="ITA">ITA</SelectItem>
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
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Funnel size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Type</TableHead>
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
                      <TableCell>
                        <Badge variant="outline">{employee.entity?.name}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {employee.employment_type}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={employee.utilization}
                            className="h-2 w-20"
                          />
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
    </div>
  );
}

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/types";


// Duplicating for independence to avoid circular imports or messy exports if not shared well
function getStatusBadge(utilization: number) {
    if (utilization >= 80) return <Badge variant="green">Fully Utilized</Badge>;
    if (utilization >= 50) return <Badge variant="yellow">Partially Utilized</Badge>;
    return <Badge variant="blue">Available</Badge>;
}

interface EntityResourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    employees: Employee[];
}

export function EntityResourceDialog({
    open,
    onOpenChange,
    title,
    employees,
}: EntityResourceDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <div className="p-6 space-y-4">
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">{employee.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {employee.role || "No Designation"}
                                        </p>
                                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                            {employee.utilization_data?.some(u => u.start_date <= new Date().toISOString().split('T')[0] && (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0]))
                                                ? employee.utilization_data?.filter(u => u.start_date <= new Date().toISOString().split('T')[0] && (!u.end_date || u.end_date >= new Date().toISOString().split('T')[0])).map(u => u.project?.name).join(", ")
                                                : "No Active Project"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(employee.utilization || 0)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No employees found for this category.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

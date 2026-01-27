import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export interface FilterState {
    minUtilization: number;
    maxUtilization: number;
    statuses: string[];
}

interface EmployeeFilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (filters: FilterState) => void;
    onClear: () => void;
    initialFilters: FilterState;
    count: number;
    trigger?: React.ReactNode;
}

export function EmployeeFilterSheet({
    open,
    onOpenChange,
    onApply,
    onClear,
    initialFilters,
    count,
    trigger,
}: EmployeeFilterSheetProps) {
    const [minUtilization, setMinUtilization] = useState(initialFilters.minUtilization);
    const [maxUtilization, setMaxUtilization] = useState(initialFilters.maxUtilization);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters.statuses);

    // Sync state when sheet opens
    useEffect(() => {
        if (open) {
            setMinUtilization(initialFilters.minUtilization);
            setMaxUtilization(initialFilters.maxUtilization);
            setSelectedStatuses(initialFilters.statuses);
        }
    }, [open, initialFilters]);

    // Handle Status Checkbox Changes
    const handleStatusChange = (status: string, checked: boolean) => {
        let newStatuses = [...selectedStatuses];
        if (checked) {
            newStatuses.push(status);
        } else {
            newStatuses = newStatuses.filter((s) => s !== status);
        }
        setSelectedStatuses(newStatuses);

        // Map checkboxes to range logic (Union of ranges)
        if (newStatuses.length > 0) {
            let min = 100;
            let max = 0;

            if (newStatuses.includes("available")) {
                min = Math.min(min, 0);
                max = Math.max(max, 50);
            }
            if (newStatuses.includes("partial")) {
                min = Math.min(min, 51);
                max = Math.max(max, 79);
            }
            if (newStatuses.includes("fully")) {
                min = Math.min(min, 80);
                max = Math.max(max, 100);
            }

            setMinUtilization(min);
            setMaxUtilization(max);
        } else {
            // If all unchecked, reset to full range? Or keep as is?
            // User requirements: "If no filters are applied, show all employees"
            // But simply unchecking boxes shouldn't necessarily reset the manual inputs unless intended.
            // Let's reset to full range for better UX if they uncheck everything.
            setMinUtilization(0);
            setMaxUtilization(100);
        }
    };

    const handleApply = () => {
        onApply({
            minUtilization: Number(minUtilization),
            maxUtilization: Number(maxUtilization),
            statuses: selectedStatuses,
        });
        onOpenChange(false);
    };

    const handleClear = () => {
        onClear();
        setMinUtilization(0);
        setMaxUtilization(100);
        setSelectedStatuses([]);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filter Employees</SheetTitle>
                    <SheetDescription>
                        Filter employees by utilization & status
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-8 py-6 px-4">


                    {/* Utilization Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium leading-none">Utilization Status</h3>
                        <div className="grid gap-4">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="status-available"
                                    checked={selectedStatuses.includes("available")}
                                    onChange={(e) => handleStatusChange("available", e.target.checked)}
                                />
                                <Label htmlFor="status-available" className="flex items-center gap-3 font-normal cursor-pointer">
                                    Available
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-secondary/50">≤ 50%</Badge>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="status-partial"
                                    checked={selectedStatuses.includes("partial")}
                                    onChange={(e) => handleStatusChange("partial", e.target.checked)}
                                />
                                <Label htmlFor="status-partial" className="flex items-center gap-3 font-normal cursor-pointer">
                                    Partially Utilized
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-secondary/50">51-79%</Badge>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="status-fully"
                                    checked={selectedStatuses.includes("fully")}
                                    onChange={(e) => handleStatusChange("fully", e.target.checked)}
                                />
                                <Label htmlFor="status-fully" className="flex items-center gap-3 font-normal cursor-pointer">
                                    Fully Utilized
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-secondary/50">≥ 80%</Badge>
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={handleClear}>Clear All</Button>
                    <Button onClick={handleApply}>
                        Apply Filters {count !== undefined && `(${count} matches)`}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

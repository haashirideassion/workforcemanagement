import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Employee, Project } from '@/types';

export interface AllocationFormData {
    id?: string;
    employee_id: string;
    project_id: string;
    allocation_percent: number;
    start_date: string;
    end_date: string;
}

interface AllocationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employees?: Employee[];
    projects?: Project[];
    preSelectedEmployeeId?: string;
    preSelectedProjectId?: string;
    allocation?: AllocationFormData;
    onSubmit: (values: AllocationFormData) => void;
    isLoading?: boolean;
}

export function AllocationDialog({
    open,
    onOpenChange,
    employees = [],
    projects = [],
    preSelectedEmployeeId,
    preSelectedProjectId,
    allocation,
    onSubmit,
    isLoading,
}: AllocationDialogProps) {
    const [form, setForm] = useState<AllocationFormData>({
        employee_id: '',
        project_id: '',
        allocation_percent: 50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            if (allocation) {
                setForm({
                    id: allocation.id,
                    employee_id: allocation.employee_id,
                    project_id: allocation.project_id,
                    allocation_percent: allocation.allocation_percent,
                    start_date: allocation.start_date,
                    end_date: allocation.end_date || '',
                });
            } else {
                setForm({
                    employee_id: preSelectedEmployeeId || '',
                    project_id: preSelectedProjectId || '',
                    allocation_percent: 50,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: '',
                });
            }
            setErrors({});
        }
    }, [open, preSelectedEmployeeId, preSelectedProjectId, allocation]);

    const handleFieldChange = (field: keyof AllocationFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.employee_id && !preSelectedEmployeeId) {
            newErrors.employee_id = 'Please select an employee';
        }
        if (!form.project_id && !preSelectedProjectId) {
            newErrors.project_id = 'Please select a project';
        }
        if (!form.allocation_percent || form.allocation_percent < 1 || form.allocation_percent > 100) {
            newErrors.allocation_percent = 'Allocation must be between 1% and 100%';
        }
        if (!form.start_date) {
            newErrors.start_date = 'Start date is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...form,
                employee_id: form.employee_id || preSelectedEmployeeId || '',
                project_id: form.project_id || preSelectedProjectId || '',
            });
            setForm({
                employee_id: preSelectedEmployeeId || '',
                project_id: preSelectedProjectId || '',
                allocation_percent: 50,
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
            });
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{allocation ? 'Edit Allocation' : 'Add Allocation'}</DialogTitle>
                    <DialogDescription>
                        {allocation 
                            ? 'Update the allocation details for this team member.' 
                            : 'Allocate an employee to a project with a percentage of their time.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!preSelectedEmployeeId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employee</label>
                            <Select
                                value={form.employee_id}
                                onValueChange={(val) => handleFieldChange('employee_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employee_id && (
                                <p className="text-sm text-red-500">{errors.employee_id}</p>
                            )}
                        </div>
                    )}

                    {!preSelectedProjectId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project</label>
                            <Select
                                value={form.project_id}
                                onValueChange={(val) => handleFieldChange('project_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((proj) => (
                                        <SelectItem key={proj.id} value={proj.id}>
                                            {proj.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.project_id && (
                                <p className="text-sm text-red-500">{errors.project_id}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="allocation_percent" className="text-sm font-medium">
                            Allocation Percentage
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="allocation_percent"
                                type="number"
                                min="1"
                                max="100"
                                value={form.allocation_percent}
                                onChange={(e) => handleFieldChange('allocation_percent', parseInt(e.target.value) || 0)}
                            />
                            <span className="text-muted-foreground">%</span>
                        </div>
                        {errors.allocation_percent && (
                            <p className="text-sm text-red-500">{errors.allocation_percent}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="start_date" className="text-sm font-medium">
                                Start Date
                            </label>
                            <Input
                                id="start_date"
                                type="date"
                                value={form.start_date}
                                onChange={(e) => handleFieldChange('start_date', e.target.value)}
                            />
                            {errors.start_date && (
                                <p className="text-sm text-red-500">{errors.start_date}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="end_date" className="text-sm font-medium">
                                End Date (Optional)
                            </label>
                            <Input
                                id="end_date"
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-brand-600 hover:bg-brand-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading 
                                ? (allocation ? 'Updating...' : 'Adding...') 
                                : (allocation ? 'Update Allocation' : 'Add Allocation')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

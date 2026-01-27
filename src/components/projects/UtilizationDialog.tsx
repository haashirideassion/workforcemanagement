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

export interface UtilizationFormData {
    id?: string;
    employee_id: string;
    project_id: string;
    utilization_percent: number;
    start_date: string;
    end_date: string;
}

interface UtilizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employees?: Employee[];
    projects?: Project[];
    preSelectedEmployeeId?: string;
    preSelectedProjectId?: string;
    utilization?: UtilizationFormData;
    onSubmit: (values: UtilizationFormData) => void;
    isLoading?: boolean;
}

export function UtilizationDialog({
    open,
    onOpenChange,
    employees = [],
    projects = [],
    preSelectedEmployeeId,
    preSelectedProjectId,
    utilization,
    onSubmit,
    isLoading,
}: UtilizationDialogProps) {
    const [form, setForm] = useState<UtilizationFormData>({
        employee_id: '',
        project_id: '',
        utilization_percent: 50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            if (utilization) {
                setForm({
                    id: utilization.id,
                    employee_id: utilization.employee_id,
                    project_id: utilization.project_id,
                    utilization_percent: utilization.utilization_percent,
                    start_date: utilization.start_date,
                    end_date: utilization.end_date || '',
                });
            } else {
                setForm({
                    employee_id: preSelectedEmployeeId || '',
                    project_id: preSelectedProjectId || '',
                    utilization_percent: 50,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: '',
                });
            }
            setErrors({});
        }
    }, [open, preSelectedEmployeeId, preSelectedProjectId, utilization]);

    const handleFieldChange = (field: keyof UtilizationFormData, value: any) => {
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
        if (!form.utilization_percent || form.utilization_percent < 1 || form.utilization_percent > 100) {
            newErrors.utilization_percent = 'Utilization must be between 1% and 100%';
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
                utilization_percent: 50,
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
                    <DialogTitle>{utilization ? 'Edit Utilization' : 'Add Utilization'}</DialogTitle>
                    <DialogDescription>
                        {utilization
                            ? 'Update the utilization details for this team member.'
                            : 'Associate an employee to a project with a percentage of their time.'}
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
                        <label htmlFor="utilization_percent" className="text-sm font-medium">
                            Utilization Percentage
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="utilization_percent"
                                type="number"
                                min="1"
                                max="100"
                                value={form.utilization_percent}
                                onChange={(e) => handleFieldChange('utilization_percent', parseInt(e.target.value) || 0)}
                            />
                            <span className="text-muted-foreground">%</span>
                        </div>
                        {errors.utilization_percent && (
                            <p className="text-sm text-red-500">{errors.utilization_percent}</p>
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
                                ? (utilization ? 'Updating...' : 'Adding...')
                                : (utilization ? 'Update Utilization' : 'Add Utilization')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

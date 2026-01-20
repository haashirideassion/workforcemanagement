import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Employee, Entity } from '@/types';

export interface EmployeeFormData {
    name: string;
    email: string;
    entity_id: string;
    employment_type: 'permanent' | 'retainer';
    performance_score: number | null;
}

interface EmployeeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: Employee | null;
    entities: Entity[];
    onSubmit: (values: EmployeeFormData) => void;
    isLoading?: boolean;
}

export function EmployeeFormDialog({
    open,
    onOpenChange,
    employee,
    entities,
    onSubmit,
    isLoading,
}: EmployeeFormDialogProps) {
    const isEditing = !!employee;
    const [form, setForm] = useState<EmployeeFormData>({
        name: '',
        email: '',
        entity_id: '',
        employment_type: 'permanent',
        performance_score: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setForm({
                name: employee?.name || '',
                email: employee?.email || '',
                entity_id: employee?.entity_id || '',
                employment_type: employee?.employment_type || 'permanent',
                performance_score: employee?.performance_score || null,
            });
            setErrors({});
        }
    }, [open, employee]);

    const handleFieldChange = (field: keyof EmployeeFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear error as soon as user starts typing/selecting
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
        if (!form.name || form.name.trim().length === 0) {
            newErrors.name = 'Name is required';
        }
        if (!form.email || !form.email.includes('@')) {
            newErrors.email = 'Invalid email address';
        }
        if (!form.entity_id) {
            newErrors.entity_id = 'Please select an entity';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(form);
            setForm({
                name: '',
                email: '',
                entity_id: '',
                employment_type: 'permanent',
                performance_score: null,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Employee' : 'Add New Employee'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            placeholder="john@company.com"
                            type="email"
                            value={form.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entity</label>
                            <Select
                                value={form.entity_id}
                                onValueChange={(val) => handleFieldChange('entity_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select entity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {entities.map((entity) => (
                                        <SelectItem key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.entity_id && (
                                <p className="text-sm text-red-500">{errors.entity_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employment Type</label>
                            <Select
                                value={form.employment_type}
                                onValueChange={(val) => setForm({ ...form, employment_type: val as 'permanent' | 'retainer' })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="permanent">Permanent</SelectItem>
                                    <SelectItem value="retainer">Retainer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="performance_score" className="text-sm font-medium">
                            Performance Score (0-10)
                        </label>
                        <Input
                            id="performance_score"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="7.5"
                            value={form.performance_score ?? ''}
                            onChange={(e) => setForm({
                                ...form,
                                performance_score: e.target.value ? parseFloat(e.target.value) : null
                            })}
                        />
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
                            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Employee'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

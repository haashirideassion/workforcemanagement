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
import type { Project, Entity, Account } from '@/types';

export interface ProjectFormData {
    name: string;
    entity_id: string;
    account_id?: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'on-hold' | 'proposal';
    description?: string;
}

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project | null;
    entities: Entity[];
    accounts: Account[];
    onSubmit: (values: ProjectFormData) => void;
    isLoading?: boolean;
}

export function ProjectFormDialog({
    open,
    onOpenChange,
    project,
    entities,
    accounts,
    onSubmit,
    isLoading,
}: ProjectFormDialogProps) {
    const isEditing = !!project;
    const [form, setForm] = useState<ProjectFormData>({
        name: '',
        entity_id: '',
        account_id: '',
        start_date: '',
        end_date: '',
        status: 'active',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setForm({
                name: project?.name || '',
                entity_id: project?.entity_id || '',
                account_id: project?.account_id || '',
                start_date: project?.start_date || '',
                end_date: project?.end_date || '',
                status: project?.status || 'active',
                description: project?.description || '',
            });
            setErrors({});
        }
    }, [open, project]);

    const handleFieldChange = (field: keyof ProjectFormData, value: any) => {
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
        if (!form.name || form.name.trim().length === 0) {
            newErrors.name = 'Name is required';
        }
        if (!form.entity_id) {
            newErrors.entity_id = 'Please select an entity';
        }

        if (form.status === 'proposal') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (form.start_date) {
                const startDate = new Date(form.start_date);
                if (startDate <= today) {
                    newErrors.start_date = 'Start Date must be in the future for Proposal status';
                }
            }
            if (form.end_date) {
                const endDate = new Date(form.end_date);
                if (endDate <= today) {
                    newErrors.end_date = 'End Date must be in the future for Proposal status';
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            if (form.status === 'on-hold' && project?.status !== 'on-hold') {
                if (!confirm('Are you sure you want to put this project on hold? It will impact the utilization of all the allocated resources')) {
                    return;
                }
            }
            onSubmit(form);
            setForm({
                name: '',
                entity_id: '',
                account_id: '',
                start_date: '',
                end_date: '',
                status: 'active',
                description: '',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Project' : 'Add New Project'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Project Name
                        </label>
                        <Input
                            id="name"
                            placeholder="Project Alpha"
                            value={form.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
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
                            <label className="text-sm font-medium">Account</label>
                            <Select
                                value={form.account_id}
                                onValueChange={(val) => handleFieldChange('account_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={form.status}
                            onValueChange={(val) => setForm({ ...form, status: val as 'active' | 'completed' | 'on-hold' | 'proposal' })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description
                        </label>
                        <Input
                            id="description"
                            placeholder="Brief project description..."
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
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
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            />
                            {errors.start_date && (
                                <p className="text-sm text-red-500">{errors.start_date}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="end_date" className="text-sm font-medium">
                                End Date
                            </label>
                            <Input
                                id="end_date"
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                            {errors.end_date && (
                                <p className="text-sm text-red-500">{errors.end_date}</p>
                            )}
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
                            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Project'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

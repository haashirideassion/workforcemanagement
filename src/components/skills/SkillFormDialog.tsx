import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export interface SkillFormData {
    name: string;
    category: string;
}

interface SkillFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: SkillFormData) => void;
    isLoading?: boolean;
}

export function SkillFormDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading,
}: SkillFormDialogProps) {
    const [form, setForm] = useState<SkillFormData>({
        name: '',
        category: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name || form.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(form);
            setForm({ name: '', category: '' });
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="skill-name" className="text-sm font-medium">
                            Skill Name
                        </label>
                        <Input
                            id="skill-name"
                            placeholder="e.g., React, Python, AWS"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="skill-category" className="text-sm font-medium">
                            Category (Optional)
                        </label>
                        <Input
                            id="skill-category"
                            placeholder="e.g., Frontend, Backend, Cloud"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                            {isLoading ? 'Adding...' : 'Add Skill'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

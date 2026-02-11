import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCreateProjectTransition } from '@/hooks/useProjectTransitions';
import type { Project } from '@/types';

interface ProjectTransitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: { id: string; name: string };
    project: Project;
    startDate: string;
    onSuccess?: () => void;
}

export function ProjectTransitionDialog({
    open,
    onOpenChange,
    employee,
    project,
    startDate,
    onSuccess
}: ProjectTransitionDialogProps) {
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');
    const createTransition = useCreateProjectTransition();

    const handleCreateTransition = async () => {
        if (!endDate) {
            toast.error('Please select an end date');
            return;
        }

        createTransition.mutate({
            employee_id: employee.id,
            project_id: project.id,
            start_date: startDate,
            end_date: endDate,
            remarks: remarks || undefined,
            status: 'completed'
        }, {
            onSuccess: () => {
                toast.success(`${employee.name} transitioned out of ${project.name}`);
                setRemarks('');
                setEndDate(new Date().toISOString().split('T')[0]);
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (error: any) => {
                toast.error(`Failed to create transition: ${error.message}`);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Project Transition Record</DialogTitle>
                    <DialogDescription>
                        Record {employee.name}'s transition from {project.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                            type="date"
                            value={startDate}
                            disabled
                            className="mt-1 bg-muted"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Remarks (Optional)</label>
                        <Textarea
                            placeholder="Add any remarks about this assignment, achievements, challenges, or recommendations for future projects..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-1"
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            These remarks will be visible to managers and can help in project assignments.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateTransition}
                        disabled={createTransition.isPending}
                    >
                        {createTransition.isPending ? 'Recording...' : 'Record Transition'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

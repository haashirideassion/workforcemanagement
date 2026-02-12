import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees, useEmployee, calculateBenchStatus } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import { useEntities } from '@/hooks/useEntities';
import { useCreateUtilization, useDeleteUtilization } from '@/hooks/useUtilization';
import { useCreateProjectTransition } from '@/hooks/useProjectTransitions';
import { toast } from 'sonner';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { SegmentedProgress } from '@/components/ui/segmented-progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    User,
    Briefcase,
    Star,
    EnvelopeSimple,
    Buildings,
    Certificate,
    MagnifyingGlass,
    Warning,
    X,
    CalendarBlank,
    UserPlus,
    Funnel,
    Tray,
    ArrowsLeftRight,
} from '@phosphor-icons/react';
import type { Employee } from '@/types';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TalentMapSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-300">
            {/* Stats bar skeleton */}
            <div className="flex gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border bg-card px-4 py-3 flex-1">
                        <Skeleton className="h-2.5 w-2.5 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-8" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-4 flex-1">
                {/* Sidebar skeleton */}
                <div className="w-80 flex-shrink-0 space-y-3">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-9 w-full" />
                    <div className="grid grid-cols-2 gap-1.5">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                        ))}
                    </div>
                    <div className="space-y-2 pt-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg border">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Board skeleton */}
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-2 w-full" />
                                <div className="space-y-1.5">
                                    {[...Array(2)].map((_, j) => (
                                        <div key={j} className="flex items-center gap-2 p-2 rounded border">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <Skeleton className="h-4 w-20 flex-1" />
                                            <Skeleton className="h-4 w-10" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Summary Stats Bar ────────────────────────────────────────────────────────

function SummaryStatsBar({ employees }: { employees: Employee[] }) {
    const stats = useMemo(() => {
        const total = employees.length;
        const available = employees.filter(e => (e.utilization ?? 0) === 0).length;
        const partial = employees.filter(e => {
            const u = e.utilization ?? 0;
            return u > 0 && u < 80;
        }).length;
        const full = employees.filter(e => {
            const u = e.utilization ?? 0;
            return u >= 80 && u <= 100;
        }).length;
        const over = employees.filter(e => (e.utilization ?? 0) > 100).length;
        return { total, available, partial, full, over };
    }, [employees]);

    const items = [
        { label: 'Total', value: stats.total, dot: 'bg-sky-400', text: 'text-sky-400', bg: 'bg-sky-500/5 border-sky-500/20' },
        { label: 'Available', value: stats.available, dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
        { label: 'Partial', value: stats.partial, dot: 'bg-violet-400', text: 'text-violet-400', bg: 'bg-violet-500/5 border-violet-500/20' },
        { label: 'Fully Utilized', value: stats.full, dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
        { label: 'Overallocated', value: stats.over, dot: 'bg-rose-400', text: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/20' },
    ];

    return (
        <div className="flex gap-3 px-4 pt-4 pb-1">
            {items.map(item => (
                <div key={item.label} className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 flex-1 transition-colors ${item.bg}`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                    <div>
                        <div className={`text-xl font-bold ${item.text}`}>{item.value}</div>
                        <div className="text-[11px] text-muted-foreground leading-tight">{item.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Draggable Employee Card ──────────────────────────────────────────────────

function DraggableEmployee({ employee, onClick }: { employee: Employee; onClick: (emp: Employee) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: employee.id,
        data: { type: 'employee', employee },
    });

    const pointerStart = useRef<{ x: number; y: number } | null>(null);
    const didDrag = useRef(false);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    useEffect(() => {
        if (isDragging) didDrag.current = true;
    }, [isDragging]);

    const handlePointerDown = (e: React.PointerEvent) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
        didDrag.current = false;
        listeners?.onPointerDown?.(e as any);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (pointerStart.current && !didDrag.current) {
            const dx = Math.abs(e.clientX - pointerStart.current.x);
            const dy = Math.abs(e.clientY - pointerStart.current.y);
            if (dx < 5 && dy < 5) onClick(employee);
        }
        pointerStart.current = null;
    };

    const utilization = employee.utilization ?? 0;
    const availability = Math.max(0, 100 - utilization);
    const benchStatus = calculateBenchStatus({ ...employee, utilization });

    // Left border color
    const borderColor = utilization > 100
        ? 'border-l-red-600'
        : utilization >= 80
            ? 'border-l-green-500'
            : utilization > 0
                ? 'border-l-orange-500'
                : 'border-l-red-400';

    const skillTags = (employee.primary_skills || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 2);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className={`flex flex-col gap-1.5 p-3 mb-2 rounded-lg border border-l-4 ${borderColor} bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing shadow-sm transition-all duration-150 ${isDragging ? 'opacity-50 scale-[0.98]' : ''}`}
        >
            <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">{employee.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{employee.role || employee.employment_type}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-xs font-semibold">{utilization}%</span>
                    <SegmentedProgress value={utilization} size="sm" className="w-14" />
                </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
                {employee.entity?.name && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{employee.entity.name}</Badge>
                )}
                {benchStatus.status !== 'healthy' && (
                    <Badge
                        variant={benchStatus.severity === 'critical' ? 'destructive' : benchStatus.severity === 'warning' ? 'orange' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 h-4"
                    >
                        {benchStatus.label}
                    </Badge>
                )}
                {utilization > 100 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 animate-pulse">
                        Overallocated
                    </Badge>
                )}
                {availability > 0 && utilization > 0 && utilization <= 100 && (
                    <span className="text-[10px] text-green-600 font-medium">{availability}% free</span>
                )}
                {skillTags.map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{s}</Badge>
                ))}
            </div>
        </div>
    );
}

// ─── Employee Quick-View Modal ────────────────────────────────────────────────

function EmployeeQuickViewModal({ employeeId, open, onClose }: { employeeId: string | null; open: boolean; onClose: () => void }) {
    const navigate = useNavigate();
    const { data: employee, isLoading } = useEmployee(employeeId || '');

    if (!open || !employeeId) return null;

    const utilization = employee?.utilization ?? 0;
    const utilizationLabel = utilization >= 80 ? 'Fully Utilized' : utilization >= 50 ? 'Partially Utilized' : 'Available';
    const utilizationVariant = utilization >= 80 ? 'default' : utilization >= 50 ? 'secondary' : 'destructive';

    const activeAllocations = (employee?.utilization_data || []).filter((a: any) => {
        const today = new Date().toISOString().split('T')[0];
        return a.start_date && a.start_date <= today && (!a.end_date || a.end_date >= today);
    });

    const employeeSkills = (employee as any)?.employee_skills || employee?.skills || [];
    const primarySkills = employeeSkills.filter((s: any) => s.is_primary);
    const secondarySkills = employeeSkills.filter((s: any) => !s.is_primary);
    const certifications = employee?.certifications || [];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-lg">{employee?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-lg">{employee?.name || 'Loading...'}</div>
                            {employee?.role && (
                                <p className="text-sm font-normal text-muted-foreground">{employee.role}</p>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading employee details...</div>
                ) : employee ? (
                    <div className="space-y-5 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            {employee.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <EnvelopeSimple size={16} className="text-muted-foreground" />
                                    <span className="truncate">{employee.email}</span>
                                </div>
                            )}
                            {employee.entity?.name && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Buildings size={16} className="text-muted-foreground" />
                                    <span>{employee.entity.name}</span>
                                </div>
                            )}
                            {employee.employment_type && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User size={16} className="text-muted-foreground" />
                                    <span className="capitalize">{employee.employment_type}</span>
                                </div>
                            )}
                            {employee.specialization && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase size={16} className="text-muted-foreground" />
                                    <span>{employee.specialization}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Utilization</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold">{utilization}%</span>
                                    <Badge variant={utilizationVariant as any}>{utilizationLabel}</Badge>
                                </div>
                            </div>
                            <SegmentedProgress value={utilization} size="sm" />
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Briefcase size={14} />
                                Active Projects ({activeAllocations.length})
                            </h4>
                            {activeAllocations.length > 0 ? (
                                <div className="space-y-2">
                                    {activeAllocations.map((alloc: any) => (
                                        <div key={alloc.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                                            <span className="font-medium">{alloc.project?.name || 'Unknown'}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {alloc.utilization_percent || alloc.allocation_percent || 0}%
                                                </Badge>
                                                {alloc.role && (
                                                    <span className="text-xs text-muted-foreground">{alloc.role}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No active projects</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Star size={14} />
                                Skills
                            </h4>
                            {primarySkills.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Primary</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {primarySkills.map((es: any) => (
                                            <Badge key={es.skill_id} variant="default" className="text-xs">
                                                {es.skill?.name || 'Unknown'} &bull; {es.proficiency}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {secondarySkills.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Secondary</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {secondarySkills.map((es: any) => (
                                            <Badge key={es.skill_id} variant="secondary" className="text-xs">
                                                {es.skill?.name || 'Unknown'} &bull; {es.proficiency}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {primarySkills.length === 0 && secondarySkills.length === 0 && (
                                <p className="text-sm text-muted-foreground">No skills assigned</p>
                            )}
                        </div>

                        {certifications.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Certificate size={14} />
                                    Certifications ({certifications.length})
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {certifications.map((cert: any) => (
                                        <Badge key={cert.id} variant="outline" className="text-xs">
                                            {cert.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={() => {
                                onClose();
                                navigate(`/employees/${employeeId}`);
                            }}
                        >
                            View Full Profile
                        </Button>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">Employee not found</div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Assignment Dialog ────────────────────────────────────────────────────────

interface AssignmentData {
    employee: Employee;
    project: any;
}

function AssignmentDialog({
    data,
    open,
    onClose,
}: {
    data: AssignmentData | null;
    open: boolean;
    onClose: () => void;
}) {
    const createUtilization = useCreateUtilization();
    const [allocationPercent, setAllocationPercent] = useState(50);
    const [role, setRole] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    // Reset form when dialog opens with new data
    useEffect(() => {
        if (open && data) {
            setAllocationPercent(50);
            setRole('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
            setError('');
        }
    }, [open, data]);

    if (!data || !open) return null;

    const currentUtilization = data.employee.utilization ?? 0;
    const totalAfterAssignment = currentUtilization + allocationPercent;
    const isOverallocated = totalAfterAssignment > 100;

    // Check duplicate
    const existingAllocation = data.project.utilization?.find(
        (a: any) => a.employee?.id === data.employee.id || a.employee_id === data.employee.id
    );

    const handleAssign = async () => {
        if (existingAllocation) {
            setError(`${data.employee.name} is already assigned to ${data.project.name}`);
            return;
        }
        if (allocationPercent < 1 || allocationPercent > 100) {
            setError('Allocation must be between 1% and 100%');
            return;
        }

        try {
            await createUtilization.mutateAsync({
                employee_id: data.employee.id,
                project_id: data.project.id,
                utilization_percent: allocationPercent,
                start_date: startDate,
                end_date: endDate || null,
                role: role || undefined,
                status: 'active',
            } as any);
            toast.success(`${data.employee.name} assigned to ${data.project.name} at ${allocationPercent}%`);
            onClose();
        } catch (err: any) {
            const msg = err.message || 'Failed to create allocation';
            setError(msg);
            toast.error(msg);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus size={20} />
                        Assign to Project
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Employee & Project info */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                        <div>
                            <p className="text-sm font-medium">{data.employee.name}</p>
                            <p className="text-xs text-muted-foreground">Current: {currentUtilization}% utilized</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium">{data.project.name}</p>
                            <Badge variant={data.project.status === 'active' ? 'green' : 'secondary'} className="text-[10px]">
                                {data.project.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Duplicate warning */}
                    {existingAllocation && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
                            <Warning size={16} weight="fill" />
                            This employee is already assigned to this project.
                        </div>
                    )}

                    {/* Overallocation warning */}
                    {isOverallocated && !existingAllocation && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400">
                            <Warning size={16} weight="fill" />
                            This will bring {data.employee.name}'s total utilization to {totalAfterAssignment}%. They will be overallocated.
                        </div>
                    )}

                    {/* Allocation % */}
                    <div className="space-y-1.5">
                        <Label htmlFor="alloc-percent">Allocation %</Label>
                        <Input
                            id="alloc-percent"
                            type="number"
                            min={1}
                            max={100}
                            value={allocationPercent}
                            onChange={(e) => setAllocationPercent(parseInt(e.target.value) || 0)}
                        />
                        <div className="flex items-center gap-2">
                            <SegmentedProgress value={totalAfterAssignment} size="sm" className="flex-1" />
                            <span className="text-xs text-muted-foreground">{totalAfterAssignment}% total</span>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label htmlFor="alloc-role">Role (optional)</Label>
                        <Input
                            id="alloc-role"
                            placeholder="e.g., Frontend Developer, QA Lead"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-start">Start Date</Label>
                            <Input
                                id="alloc-start"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="alloc-end">End Date (optional)</Label>
                            <Input
                                id="alloc-end"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleAssign}
                        disabled={createUtilization.isPending || !!existingAllocation}
                    >
                        {createUtilization.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Droppable Project Board ──────────────────────────────────────────────────

// ─── Draggable chip for employees already assigned to a project ───────────────

function DraggableProjectEmployee({
    alloc,
    project,
    allEmployees,
    onRemoveAllocation,
    onEmployeeClick,
    isRemoving,
}: {
    alloc: any;
    project: any;
    allEmployees: Employee[];
    onRemoveAllocation: (allocationId: string, empName: string, projName: string, employeeId: string, projectId: string) => void;
    onEmployeeClick: (empId: string) => void;
    isRemoving: boolean;
}) {
    const empName = alloc.employee?.name || 'Unknown';
    const empId = alloc.employee?.id || alloc.employee_id;
    const allocPercent = alloc.utilization_percent || alloc.allocation_percent || 0;
    const emp = allEmployees.find(e => e.id === empId);
    const empTotalUtil = emp?.utilization ?? 0;
    const isEmpOverallocated = empTotalUtil > 100;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `project-emp-${alloc.id}`,
        data: {
            type: 'project-employee',
            employee: emp || alloc.employee,
            sourceProjectId: project.id,
            sourceProjectName: project.name,
            allocationId: alloc.id,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center gap-2 text-sm p-2 bg-background rounded border group cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''}`}
        >
            <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className="text-[10px]">{empName.charAt(0)}</AvatarFallback>
            </Avatar>
            <button
                className="truncate text-left hover:underline cursor-pointer flex-1 min-w-0"
                onClick={(e) => { e.stopPropagation(); onEmployeeClick(empId); }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                {empName}
            </button>
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {alloc.role && (
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{alloc.role}</span>
                )}
                <Badge variant="outline" className="text-[10px] px-1.5">{allocPercent}%</Badge>
                {isEmpOverallocated && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Warning size={14} className="text-red-500" weight="fill" />
                            </TooltipTrigger>
                            <TooltipContent>
                                {empName} is overallocated at {empTotalUtil}% across all projects
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                    onClick={(e) => { e.stopPropagation(); onRemoveAllocation(alloc.id, empName, project.name, empId, project.id); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    disabled={isRemoving}
                    title="Remove from project"
                >
                    <X size={14} className="text-muted-foreground hover:text-red-500" />
                </button>
            </div>
        </div>
    );
}

function DroppableProject({
    project,
    allEmployees,
    onRemoveAllocation,
    onEmployeeClick,
    isRemoving,
}: {
    project: any;
    allEmployees: Employee[];
    onRemoveAllocation: (allocationId: string, empName: string, projName: string, employeeId: string, projectId: string) => void;
    onEmployeeClick: (empId: string) => void;
    isRemoving: boolean;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: project.id,
        data: { type: 'project', project },
    });

    const allocations: any[] = project.utilization || [];
    const teamSize = allocations.length;
    const totalAllocationSum = allocations.reduce((sum: number, a: any) => sum + (a.utilization_percent || a.allocation_percent || 0), 0);
    const avgUtilization = teamSize > 0 ? Math.round(totalAllocationSum / teamSize) : 0;

    return (
        <Card
            ref={setNodeRef}
            className={`h-full transition-all duration-200 ${isOver ? 'ring-2 ring-primary bg-accent/20 shadow-lg scale-[1.01]' : ''}`}
        >
            <CardHeader className="pb-2">
                <CardTitle className="text-base space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 truncate">
                            <Briefcase size={16} />
                            {project.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {project.entity?.name && (
                                <Badge variant="outline" className="text-[10px]">{project.entity.name}</Badge>
                            )}
                            <Badge variant={project.status === 'active' ? 'green' : 'secondary'} className="text-[10px]">
                                {project.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-normal">
                        <span>{teamSize} member{teamSize !== 1 ? 's' : ''}</span>
                        {project.start_date && (
                            <span className="flex items-center gap-1">
                                <CalendarBlank size={12} />
                                {project.start_date}{project.end_date ? ` - ${project.end_date}` : ''}
                            </span>
                        )}
                    </div>
                    {teamSize > 0 && (
                        <div className="flex items-center gap-2">
                            <SegmentedProgress value={avgUtilization} size="sm" className="flex-1" />
                            <span className={`text-[11px] font-medium text-muted-foreground`}>
                                Avg {avgUtilization}%
                            </span>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1.5 min-h-[80px]">
                    {allocations.length > 0 ? (
                        allocations.map((alloc: any) => (
                            <DraggableProjectEmployee
                                key={alloc.id}
                                alloc={alloc}
                                project={project}
                                allEmployees={allEmployees}
                                onRemoveAllocation={onRemoveAllocation}
                                onEmployeeClick={onEmployeeClick}
                                isRemoving={isRemoving}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-20 text-muted-foreground border-2 border-dashed rounded-lg">
                            <span className="text-xs">Drop employees here</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main UtilizationBoard ────────────────────────────────────────────────────

export function UtilizationBoard() {
    const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
    const { data: projects = [], isLoading: loadingProjects } = useProjects({ status: 'active' });
    const { data: skills = [] } = useSkills();
    const { data: entities = [] } = useEntities();
    const deleteUtilization = useDeleteUtilization();
    const createTransition = useCreateProjectTransition();

    // Sidebar filters
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [utilizationFilter, setUtilizationFilter] = useState('all');
    const [skillFilter, setSkillFilter] = useState('all');

    // Project search
    const [projectSearch, setProjectSearch] = useState('');


    // Modals
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null);

    // Removal / move dialog state
    const [removeTarget, setRemoveTarget] = useState<{
        id: string;             // allocation id
        empName: string;
        projName: string;
        employeeId: string;
        projectId: string;
        moveToProject?: any;    // if moving to another project, set this
    } | null>(null);
    const [removeRemarks, setRemoveRemarks] = useState('');
    const [removeManager, setRemoveManager] = useState('');
    const [removeManagerOther, setRemoveManagerOther] = useState('');

    // Drag state
    const [activeEmployee, setActiveEmployee] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            // Search
            if (search && !emp.name.toLowerCase().includes(search.toLowerCase())) return false;

            // Entity
            if (entityFilter !== 'all' && emp.entity?.name !== entityFilter) return false;

            // Employment type
            if (typeFilter !== 'all' && emp.employment_type !== typeFilter) return false;

            // Utilization band
            const u = emp.utilization ?? 0;
            if (utilizationFilter === 'available' && u !== 0) return false;
            if (utilizationFilter === 'partial' && (u <= 0 || u >= 80)) return false;
            if (utilizationFilter === 'full' && (u < 80 || u > 100)) return false;
            if (utilizationFilter === 'over' && u <= 100) return false;

            // Skill
            if (skillFilter !== 'all') {
                const hasPrimary = (emp.primary_skills || '').toLowerCase().includes(skillFilter.toLowerCase());
                const hasSecondary = (emp.secondary_skills || '').toLowerCase().includes(skillFilter.toLowerCase());
                const hasInSkills = (emp as any).employee_skills?.some(
                    (es: any) => es.skill?.name?.toLowerCase() === skillFilter.toLowerCase()
                );
                if (!hasPrimary && !hasSecondary && !hasInSkills) return false;
            }

            return true;
        });
    }, [employees, search, entityFilter, typeFilter, utilizationFilter, skillFilter]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        if (!projectSearch) return projects;
        return projects.filter(p =>
            p.name.toLowerCase().includes(projectSearch.toLowerCase())
        );
    }, [projects, projectSearch]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveEmployee(event.active.data.current?.employee);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && over.data.current?.type === 'project') {
            const dragType = active.data.current?.type;
            const employee = active.data.current?.employee as Employee;
            const targetProject = over.data.current?.project;

            if (!employee || !targetProject) {
                setActiveEmployee(null);
                return;
            }

            // Check duplicate
            const existing = targetProject.utilization?.find(
                (a: any) => a.employee?.id === employee.id || a.employee_id === employee.id
            );
            if (existing) {
                toast.warning(`${employee.name} is already assigned to ${targetProject.name}`);
                setActiveEmployee(null);
                return;
            }

            if (dragType === 'project-employee') {
                // Moving from one project to another — trigger removal dialog with move context
                const sourceProjectId = active.data.current?.sourceProjectId;
                const sourceProjectName = active.data.current?.sourceProjectName;
                const allocationId = active.data.current?.allocationId;

                if (sourceProjectId === targetProject.id) {
                    setActiveEmployee(null);
                    return; // Same project, no-op
                }

                setRemoveTarget({
                    id: allocationId,
                    empName: employee.name,
                    projName: sourceProjectName,
                    employeeId: employee.id,
                    projectId: sourceProjectId,
                    moveToProject: targetProject,
                });
                setRemoveRemarks('');
                setRemoveManager('');
                setRemoveManagerOther('');
            } else {
                // New assignment from sidebar
                setAssignmentData({ employee, project: targetProject });
            }
        }

        setActiveEmployee(null);
    };

    const handleRemoveAllocation = (allocationId: string, empName: string, projName: string, employeeId: string, projectId: string) => {
        setRemoveTarget({ id: allocationId, empName, projName, employeeId, projectId });
        setRemoveRemarks('');
        setRemoveManager('');
        setRemoveManagerOther('');
    };

    const confirmRemoveAllocation = async () => {
        if (!removeTarget) return;

        const managerName = removeManager === '__other__' ? removeManagerOther.trim() : removeManager;

        // 1. Record the transition
        try {
            const alloc = projects
                .flatMap(p => (p.utilization || []) as any[])
                .find((a: any) => a.id === removeTarget.id);

            await createTransition.mutateAsync({
                employee_id: removeTarget.employeeId,
                project_id: removeTarget.projectId,
                allocation_id: removeTarget.id,
                start_date: alloc?.start_date || new Date().toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                remarks: removeRemarks.trim() || undefined,
                manager_name: managerName || undefined,
                status: 'completed' as const,
            });
        } catch {
            // Don't block removal if transition recording fails
            console.warn('Could not record project transition');
        }

        // 2. Delete the allocation
        deleteUtilization.mutate(removeTarget.id, {
            onSuccess: () => {
                const moveProject = removeTarget.moveToProject;
                if (moveProject) {
                    // Open assignment dialog for the target project
                    const emp = employees.find(e => e.id === removeTarget.employeeId);
                    if (emp) {
                        toast.success(`${removeTarget.empName} removed from ${removeTarget.projName}. Now assign to ${moveProject.name}.`);
                        setAssignmentData({ employee: emp, project: moveProject });
                    }
                } else {
                    toast.success(`${removeTarget.empName} removed from ${removeTarget.projName}`);
                }
                setRemoveTarget(null);
                setRemoveRemarks('');
                setRemoveManager('');
                setRemoveManagerOther('');
            },
            onError: (err: any) => {
                toast.error(err.message || 'Failed to remove allocation');
                setRemoveTarget(null);
            },
        });
    };

    const handleEmployeeClick = (emp: Employee) => {
        setSelectedEmployeeId(emp.id);
    };

    if (loadingEmployees || loadingProjects) {
        return <TalentMapSkeleton />;
    }

    return (
        <TooltipProvider>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Summary Stats */}
                <SummaryStatsBar employees={employees} />

                <div className="flex h-[calc(100vh-10rem)] gap-4 p-4">
                    {/* ─── Sidebar ─── */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <User weight="duotone" /> Talent Pool
                            </h2>
                            <Badge variant="outline">{filteredEmployees.length}</Badge>
                        </div>

                        {/* Filters */}
                        <div className="space-y-2">
                            <div className="relative">
                                <MagnifyingGlass size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-9 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                <Select value={entityFilter} onValueChange={setEntityFilter}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Entity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Entities</SelectItem>
                                        {entities.map((entity: any) => (
                                            <SelectItem key={entity.id} value={entity.name}>{entity.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="permanent">Permanent</SelectItem>
                                        <SelectItem value="retainer">Retainer</SelectItem>
                                        <SelectItem value="intern">Intern</SelectItem>
                                        <SelectItem value="contractor">Contractor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={utilizationFilter} onValueChange={setUtilizationFilter}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Utilization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="available">Available (0%)</SelectItem>
                                        <SelectItem value="partial">Partial (1-79%)</SelectItem>
                                        <SelectItem value="full">Full (80-100%)</SelectItem>
                                        <SelectItem value="over">Overallocated (&gt;100%)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={skillFilter} onValueChange={setSkillFilter}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Skills</SelectItem>
                                        {skills.map((s: any) => (
                                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Employee List */}
                        <div className="flex-1 overflow-y-auto pr-1 relative">
                            {filteredEmployees.length > 0 ? (
                                <>
                                    {filteredEmployees.map(emp => (
                                        <DraggableEmployee key={emp.id} employee={emp} onClick={handleEmployeeClick} />
                                    ))}
                                    {/* Scroll fade at bottom */}
                                    <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                                    <Funnel size={24} className="mb-2 opacity-50" />
                                    No employees match filters
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Project Boards ─── */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3 gap-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2 flex-shrink-0">
                                <Briefcase weight="duotone" /> Active Projects
                                <Badge variant="outline">
                                    {filteredProjects.length}{projectSearch ? ` of ${projects.length}` : ''}
                                </Badge>
                            </h2>
                            <div className="relative max-w-xs w-full">
                                <MagnifyingGlass size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects..."
                                    value={projectSearch}
                                    onChange={(e) => setProjectSearch(e.target.value)}
                                    className="pl-8 h-9 text-sm"
                                />
                            </div>
                        </div>

                        {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredProjects.map(proj => (
                                    <DroppableProject
                                        key={proj.id}
                                        project={proj}
                                        allEmployees={employees}
                                        onRemoveAllocation={handleRemoveAllocation}
                                        onEmployeeClick={(empId) => setSelectedEmployeeId(empId)}
                                        isRemoving={deleteUtilization.isPending}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                                <Tray size={40} className="mb-3 opacity-40" />
                                <p className="text-sm font-medium">
                                    {projectSearch ? 'No projects match your search' : 'No active projects found'}
                                </p>
                                <p className="text-xs mt-1 opacity-70">
                                    {projectSearch
                                        ? 'Try a different search term'
                                        : 'Create a project to start allocating team members'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeEmployee ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-xl opacity-90 w-64 cursor-grabbing">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{activeEmployee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium">{activeEmployee.name}</p>
                                <p className="text-xs text-muted-foreground">{activeEmployee.utilization ?? 0}% utilized</p>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Assignment Dialog */}
                <AssignmentDialog
                    data={assignmentData}
                    open={!!assignmentData}
                    onClose={() => setAssignmentData(null)}
                />

                {/* Employee Quick-View Modal */}
                <EmployeeQuickViewModal
                    employeeId={selectedEmployeeId}
                    open={!!selectedEmployeeId}
                    onClose={() => setSelectedEmployeeId(null)}
                />

                {/* Remove / Move Allocation Dialog with Remarks */}
                <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {removeTarget?.moveToProject ? (
                                    <><ArrowsLeftRight size={20} /> Move Resource</>
                                ) : (
                                    <><X size={20} /> Remove from Project</>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Context info */}
                            <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Employee: </span>
                                    <span className="font-medium">{removeTarget?.empName}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Removing from: </span>
                                    <span className="font-medium">{removeTarget?.projName}</span>
                                </p>
                                {removeTarget?.moveToProject && (
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Moving to: </span>
                                        <span className="font-medium text-primary">{removeTarget.moveToProject.name}</span>
                                    </p>
                                )}
                            </div>

                            {/* Manager */}
                            <div className="space-y-1.5">
                                <Label className="text-sm">Reporting Manager</Label>
                                <Select value={removeManager} onValueChange={setRemoveManager}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select manager..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees
                                            .filter(e => e.id !== removeTarget?.employeeId)
                                            .slice(0, 50)
                                            .map(e => (
                                                <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                                            ))}
                                        <SelectItem value="__other__">Other (type name)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {removeManager === '__other__' && (
                                    <Input
                                        placeholder="Enter manager name..."
                                        value={removeManagerOther}
                                        onChange={(e) => setRemoveManagerOther(e.target.value)}
                                        className="mt-1.5"
                                    />
                                )}
                            </div>

                            {/* Remarks */}
                            <div className="space-y-1.5">
                                <Label className="text-sm">Remarks / Experience Notes</Label>
                                <Textarea
                                    placeholder="How was the experience on this project? Any notes for the record..."
                                    value={removeRemarks}
                                    onChange={(e) => setRemoveRemarks(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmRemoveAllocation}
                                disabled={deleteUtilization.isPending || createTransition.isPending}
                                variant={removeTarget?.moveToProject ? 'default' : 'destructive'}
                            >
                                {(deleteUtilization.isPending || createTransition.isPending)
                                    ? 'Processing...'
                                    : removeTarget?.moveToProject
                                        ? 'Move & Record'
                                        : 'Remove & Record'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DndContext>
        </TooltipProvider>
    );
}

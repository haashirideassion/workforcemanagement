import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useProjects } from '@/hooks/useProjects';
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
import { User, Briefcase } from '@phosphor-icons/react';

// Draggable Employee Component
function DraggableEmployee({ employee }: { employee: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: employee.id,
        data: { type: 'employee', employee },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 p-3 mb-2 rounded-lg border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing shadow-sm ${isDragging ? 'opacity-50' : ''
                }`}
        >
            <Avatar className="h-8 w-8">
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{employee.name}</p>
                <p className="truncate text-xs text-muted-foreground">{employee.role} • {employee.utilization}% Utilized</p>
            </div>
        </div>
    );
}

// Droppable Project Component
function DroppableProject({ project, children }: { project: any; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: project.id,
        data: { type: 'project', project },
    });

    return (
        <Card
            ref={setNodeRef}
            className={`h-full transition-colors ${isOver ? 'ring-2 ring-primary bg-accent/20' : ''}`}
        >
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Briefcase size={16} />
                        {project.name}
                    </span>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 min-h-[100px]">
                    {children}
                    {(!children || (Array.isArray(children) && children.length === 0)) && (
                        <div className="flex flex-col items-center justify-center h-24 text-muted-foreground border-2 border-dashed rounded-lg">
                            <span className="text-xs">Drop employees here</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function UtilizationBoard() {
    const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
    const { data: projects = [], isLoading: loadingProjects } = useProjects({ status: 'active' });

    const [utilization, setUtilization] = useState<Record<string, string[]>>({});

    // Initialize utilization from project data
    useEffect(() => {
        if (projects.length > 0) {
            const initialUtilization: Record<string, string[]> = {};
            projects.forEach(project => {
                if (project.utilization) {
                    initialUtilization[project.id] = project.utilization.map((a: any) => a.employee.id);
                }
            });
            setUtilization(initialUtilization);
        }
    }, [projects]);

    const [activeEmployee, setActiveEmployee] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveEmployee(active.data.current?.employee);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // If dropped over a project
            if (over.data.current?.type === 'project') {
                const projectId = over.id as string;
                const employeeId = active.id as string;

                // Check if already assigned
                const isAssigned = utilization[projectId]?.includes(employeeId);

                if (!isAssigned) {
                    setUtilization(prev => ({
                        ...prev,
                        [projectId]: [...(prev[projectId] || []), employeeId]
                    }));
                    console.log(`Assigned ${employeeId} to ${projectId}`);
                }
            }
        }

        setActiveEmployee(null);
    };



    if (loadingEmployees || loadingProjects) {
        return <div className="p-8 text-center">Loading utilization board...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-4rem)] gap-6 p-4">
                {/* Sidebar: Bench / Available Employees */}
                <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <User weight="duotone" /> Available Talent
                        </h2>
                        <Badge variant="outline">{employees.length}</Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        {employees.map(emp => (
                            <DraggableEmployee key={emp.id} employee={emp} />
                        ))}
                    </div>
                </div>

                {/* Main: Team Boards */}
                <div className="flex-1 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase weight="duotone" /> Active Teams
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map(proj => (
                            <DroppableProject key={proj.id} project={proj}>
                                {utilization[proj.id]?.map(empId => {
                                    const emp = employees.find(e => e.id === empId);
                                    return emp ? (
                                        <div key={emp.id} className="flex items-center gap-2 text-sm p-2 bg-background rounded border">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-[10px]">{emp.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{emp.name}</span>
                                        </div>
                                    ) : null;
                                })}
                            </DroppableProject>
                        ))}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeEmployee ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-xl opacity-90 w-64 cursor-grabbing">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{activeEmployee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">{activeEmployee.name}</p>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

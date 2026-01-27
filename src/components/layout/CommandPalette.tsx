import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    Briefcase,
    ChartBar,
    Certificate,
    TrendUp,
    Plus,
    MagnifyingGlass,
} from '@phosphor-icons/react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import { useEmployees } from '@/hooks/useEmployees';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { data: employees = [] } = useEmployees();

    // Filter employees based on search query
    const filteredEmployees = useMemo(() => {
        if (!search || search.length < 2) return [];
        return employees
            .filter(emp =>
                emp.name.toLowerCase().includes(search.toLowerCase()) ||
                emp.email?.toLowerCase().includes(search.toLowerCase())
            )
            .slice(0, 5); // Limit to 5 results
    }, [search, employees]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        setSearch('');
        command();
    };

    return (
        <CommandDialog
            open={open}
            onOpenChange={(open) => { setOpen(open); if (!open) setSearch(''); }}
            commandProps={{ shouldFilter: false }}
        >
            <CommandInput
                placeholder="Search employees, navigate, or run commands..."
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>
                    {search.length >= 2 ? 'No employees found.' : 'Type to search employees...'}
                </CommandEmpty>

                {/* Employee Search Results */}
                {filteredEmployees.length > 0 && (
                    <CommandGroup heading="Employees">
                        {filteredEmployees.map((employee) => (
                            <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => runCommand(() => navigate(`/employees/${employee.id}`))}
                            >
                                <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback className="text-xs">
                                        {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span>{employee.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {employee.entity?.name} • {employee.employment_type}
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* Quick Actions */}
                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => runCommand(() => navigate('/employees'))}>
                        <MagnifyingGlass className="mr-2 h-4 w-4" />
                        <span>Search All Employees</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/projects'))}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Browse Projects</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/utilization'))}>
                        <ChartBar className="mr-2 h-4 w-4" />
                        <span>View Utilization</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Navigation */}
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <CommandShortcut>⌘D</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/employees'))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Employees</span>
                        <CommandShortcut>⌘E</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/projects'))}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Projects</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/skills'))}>
                        <Certificate className="mr-2 h-4 w-4" />
                        <span>Skills</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/optimization'))}>
                        <TrendUp className="mr-2 h-4 w-4" />
                        <span>Optimization</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Actions */}
                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => runCommand(() => {
                        navigate('/employees');
                    })}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Add New Employee</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => {
                        navigate('/projects');
                    })}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Add New Project</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}


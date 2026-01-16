import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    Briefcase,
    ChartBar,
    Certificate,
    TrendUp,
    Plus,
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

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

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
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate('/employees'))}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Search Employees</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/projects'))}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Search Projects</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/utilization'))}>
                        <ChartBar className="mr-2 h-4 w-4" />
                        <span>Check Utilization</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
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

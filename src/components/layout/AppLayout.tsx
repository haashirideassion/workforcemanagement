import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    House,
    Users,
    Briefcase,
    ChartBar,
    Certificate,
    TrendUp,
    Bell,
    List,
    MagnifyingGlass,
} from '@phosphor-icons/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
    { to: '/', label: 'Overview', icon: House },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/teams', label: 'Teams', icon: Briefcase },
    { to: '/utilization', label: 'Utilization', icon: ChartBar },
    { to: '/skills', label: 'Skills', icon: Certificate },
    { to: '/optimization', label: 'Optimization', icon: TrendUp },
];

import { CommandPalette } from './CommandPalette';
import { ModeToggle } from '@/components/mode-toggle';
import { usePageTitle } from '@/hooks/usePageTitle';

export function AppLayout() {
    usePageTitle();
    const location = useLocation();

    return (
        <SidebarProvider>
            <CommandPalette />
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-600 text-sidebar-primary-foreground">
                                        <div className="font-bold text-white">W</div>
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">Workforce</span>
                                        <span className="truncate text-xs">Management System</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Platform</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.to}
                                            tooltip={item.label}
                                        >
                                            <NavLink to={item.to}>
                                                <item.icon weight={location.pathname === item.to ? "fill" : "duotone"} />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                                            <AvatarFallback className="rounded-lg">AM</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">Admin User</span>
                                            <span className="truncate text-xs">admin@company.com</span>
                                        </div>
                                        <List className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                                                <AvatarFallback className="rounded-lg">AM</AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">Admin User</span>
                                                <span className="truncate text-xs">admin@company.com</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                        <div
                            className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-inset ring-muted-foreground/10 cursor-pointer hover:bg-muted"
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        >
                            <MagnifyingGlass weight="bold" className="size-3.5" />
                            <span>Search...</span>
                            <kbd className="pointer-events-none ml-2 select-none text-[10px] font-medium opacity-50">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <ModeToggle />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Bell className="size-4" weight="duotone" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 pt-0">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

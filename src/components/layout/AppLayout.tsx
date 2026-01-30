import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
    Buildings,
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
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
    { to: '/', label: 'Dashboard', icon: House },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/accounts', label: 'Accounts', icon: Buildings },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/utilization', label: 'Utilization', icon: ChartBar },
    { to: '/skills', label: 'Skills', icon: Certificate },
    { to: '/optimization', label: 'Optimization', icon: TrendUp },
];

import { CommandPalette } from './CommandPalette';
import { ModeToggle } from '@/components/mode-toggle';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTheme } from '@/components/theme-provider';
import { GradientButton } from '@/components/ui/gradient-button';

export function AppLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    usePageTitle();
    const location = useLocation();
    const { theme } = useTheme();

    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-color-scheme: dark)').matches);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const userEmail = user?.email || 'user@example.com';
    const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];
    const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <SidebarProvider>
            <CommandPalette />
            <Sidebar collapsible="icon" variant="inset" style={{ fontFamily: 'var(--font-heading)' }}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <img
                                        src="/src/assets/itslogo.png"
                                        alt="Ideassion Logo"
                                        className="size-8 rounded-lg object-contain"
                                    />
                                    <div className="grid flex-1 text-left text-sm leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                        <span className="truncate font-semibold">Ideassion</span>
                                        <span className="truncate text-xs">Workforce System</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.to;
                                    const showGradient = isDark && isActive;

                                    return (
                                        <SidebarMenuItem key={item.to}>
                                            {showGradient ? (
                                                <SidebarMenuButton
                                                    isActive={isActive}
                                                    tooltip={item.label}
                                                    className="p-0 bg-transparent hover:bg-transparent data-[active=true]:bg-transparent data-[active=true]:ring-0 data-[active=true]:outline-none focus-visible:ring-0"
                                                >
                                                    <GradientButton className="w-full h-10 px-3 py-2 flex items-center justify-start gap-2 rounded-sm">
                                                        <NavLink
                                                            to={item.to}
                                                            className="flex items-center gap-2 w-full text-white"
                                                        >
                                                            <item.icon weight="fill" className="size-4 shrink-0" />
                                                            <span>{item.label}</span>
                                                        </NavLink>
                                                    </GradientButton>
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.label}
                                                >
                                                    <NavLink to={item.to}>
                                                        <item.icon
                                                            weight={isActive ? 'fill' : 'duotone'}
                                                        />
                                                        <span>{item.label}</span>
                                                    </NavLink>
                                                </SidebarMenuButton>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
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
                                        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                                            <Users size={16} className="text-white" weight="fill" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                                            <span className="truncate font-semibold">{userName}</span>
                                            <span className="truncate text-xs">{userEmail}</span>
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
                                            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                                                <Users size={16} className="text-white" weight="fill" />
                                            </div>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">{userName}</span>
                                                <span className="truncate text-xs">{userEmail}</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
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
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </SidebarInset>
            <Toaster position="top-right" closeButton richColors />
        </SidebarProvider>
    );
}

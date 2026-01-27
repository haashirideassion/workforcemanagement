import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
    '/': 'Dashboard | Workforce Management',
    '/employees': 'Employees | Workforce Management',
    '/teams': 'Teams | Workforce Management',
    '/allocations': 'Project Allocations | Workforce Management',
    '/skills': 'Skills Directory | Workforce Management',
    '/optimization': 'Optimization | Workforce Management',
    '/allocation-board': 'Allocation Board | Workforce Management',
};

export function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        // Handle dynamic routes like /employees/:id
        if (location.pathname.startsWith('/employees/')) {
            document.title = 'Employee Details | Workforce Management';
            return;
        }
        if (location.pathname.startsWith('/teams/')) {
            document.title = 'Team Details | Workforce Management';
            return;
        }
        if (location.pathname.startsWith('/projects/')) {
            document.title = 'Project Details | Workforce Management';
            return;
        }

        const title = routeTitles[location.pathname] || 'Workforce Management System';
        document.title = title;
    }, [location]);
}

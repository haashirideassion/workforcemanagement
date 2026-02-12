import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
    '/': 'Overview · IWS Workforce',
    '/employees': 'People Directory · IWS Workforce',
    '/accounts': 'Client Accounts · IWS Workforce',
    '/projects': 'Project Portfolio · IWS Workforce',
    '/utilization': 'Utilization Analytics · IWS Workforce',
    '/utilization-board': 'Talent Map · IWS Workforce',
    '/skills': 'Skills Matrix · IWS Workforce',
    '/optimization': 'Resource Optimization · IWS Workforce',
    '/bench': 'Bench Pool · IWS Workforce',
};

export function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        // Handle dynamic routes
        if (location.pathname.startsWith('/employees/')) {
            document.title = 'Employee Profile · IWS Workforce';
            return;
        }
        if (location.pathname.startsWith('/accounts/')) {
            document.title = 'Account Details · IWS Workforce';
            return;
        }
        if (location.pathname.startsWith('/projects/')) {
            document.title = 'Project Details · IWS Workforce';
            return;
        }

        const title = routeTitles[location.pathname] || 'IWS Workforce';
        document.title = title;
    }, [location]);
}

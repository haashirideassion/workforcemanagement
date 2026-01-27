import { useQuery } from '@tanstack/react-query';
import type { Account } from '@/types';

const mockAccounts: Account[] = [
    { id: '1', name: 'Acme Corporation', email: 'contact@acme.com', entity: 'ITS', activeProjects: 3, utilizedResources: 8, utilization: 85, billingType: 'Retainer', status: 'healthy', zone: 'USA', startDate: '2024-01-15' },
    { id: '2', name: 'TechStart Inc', email: 'hello@techstart.io', entity: 'IBCC', activeProjects: 2, utilizedResources: 5, utilization: 60, billingType: 'T&M', status: 'at-risk', zone: 'Asia', startDate: '2024-03-01' },
    { id: '3', name: 'Global Finance Ltd', email: 'projects@globalfinance.com', entity: 'IITT', activeProjects: 4, utilizedResources: 12, utilization: 95, billingType: 'Fixed', status: 'critical', zone: 'EMEA', startDate: '2023-06-20' },
    { id: '4', name: 'HealthTech Solutions', email: 'info@healthtech.com', entity: 'ITS', activeProjects: 0, utilizedResources: 0, utilization: 0, billingType: 'Retainer', status: 'on-hold', zone: 'USA', startDate: '2024-02-10' },
    { id: '5', name: 'RetailMax', email: 'dev@retailmax.com', entity: 'IBCC', activeProjects: 2, utilizedResources: 6, utilization: 78, billingType: 'T&M', status: 'healthy', zone: 'LatAm', startDate: '2023-11-05' },
    { id: '6', name: 'EduLearn Platform', email: 'tech@edulearn.com', entity: 'IITT', activeProjects: 1, utilizedResources: 3, utilization: 45, billingType: 'Fixed', status: 'at-risk', zone: 'Europe', startDate: '2024-04-01' },
    { id: '7', name: 'CloudNine Systems', email: 'support@cloudnine.io', entity: 'ITS', activeProjects: 5, utilizedResources: 15, utilization: 92, billingType: 'Retainer', status: 'healthy', zone: 'USA', startDate: '2022-08-15' },
    { id: '8', name: 'DataDriven Analytics', email: 'hello@datadriven.com', entity: 'IBCC', activeProjects: 1, utilizedResources: 2, utilization: 30, billingType: 'T&M', status: 'at-risk', zone: 'APAC', startDate: '2024-05-20' },
];

export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            return mockAccounts;
        },
    });
}

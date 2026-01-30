// Utility function to check and update project statuses based on dates
import type { Project } from '@/types';

export function shouldUpdateProjectStatus(project: Project): { shouldUpdate: boolean; newStatus?: 'active' } {
    // Only update if project is in proposal status
    if (project.status !== 'proposal') {
        return { shouldUpdate: false };
    }

    // Check if start date has arrived
    if (project.start_date) {
        const today = new Date().toISOString().split('T')[0];
        const startDate = project.start_date;

        // If start date is today or in the past, update to active
        if (startDate <= today) {
            return { shouldUpdate: true, newStatus: 'active' };
        }
    }

    return { shouldUpdate: false };
}

export function ensureProposalHasFutureStartDate(startDate: string | null, status: string): string {
    // If status is proposal, ensure start date is in the future
    if (status === 'proposal') {
        const today = new Date();
        const start = startDate ? new Date(startDate) : null;

        // If no start date or start date is in the past/today, set to tomorrow
        if (!start || start <= today) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }
    }

    return startDate || '';
}

import { Badge } from '@/components/ui/badge';
import { Warning, WarningCircle, Info, CheckCircle } from '@phosphor-icons/react';

interface BenchStatusBadgeProps {
    status?: string;
    benchDays?: number;
    utilization?: number;
    showDetails?: boolean;
}

export function BenchStatusBadge({ status, benchDays = 0, utilization = 0, showDetails = false }: BenchStatusBadgeProps) {
    if (!status) return null;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'layoff-consideration':
                return {
                    variant: 'destructive' as const,
                    icon: <Warning size={14} className="mr-1" weight="fill" />,
                    label: 'Layoff Consideration',
                    description: `>30 days bench, 0% utilization`
                };
            case 'at-risk':
                return {
                    variant: 'orange' as const,
                    icon: <WarningCircle size={14} className="mr-1" weight="fill" />,
                    label: 'At Risk',
                    description: `${benchDays} days bench, 0% utilization`
                };
            case 'review-required':
                return {
                    variant: 'yellow' as const,
                    icon: <Info size={14} className="mr-1" weight="fill" />,
                    label: 'Review Required',
                    description: `${utilization}% utilization <50%`
                };
            case 'healthy':
            default:
                return {
                    variant: 'green' as const,
                    icon: <CheckCircle size={14} className="mr-1" weight="fill" />,
                    label: 'Healthy',
                    description: `${utilization}% utilization`
                };
        }
    };

    const config = getStatusConfig(status);

    if (showDetails) {
        return (
            <div className="flex flex-col gap-1">
                <Badge variant={config.variant} className="w-fit flex items-center">
                    {config.icon}
                    {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{config.description}</span>
            </div>
        );
    }

    return (
        <Badge variant={config.variant} className="flex items-center">
            {config.icon}
            {config.label}
        </Badge>
    );
}

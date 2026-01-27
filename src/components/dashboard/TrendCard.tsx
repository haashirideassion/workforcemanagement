import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface TrendDataPoint {
    date: string;
    value: number;
}

export interface TrendCardProps {
    title: string;
    value: string | number;
    subValue?: string | number;
    icon: React.ReactNode;
    iconBgColor?: string;
    trend: {
        value: number;
        label?: string; // e.g. "vs last month"
        direction: 'up' | 'down' | 'neutral';
        isPositive: boolean; // true = good (green), false = bad (red)
    };
    history: TrendDataPoint[];
    onDetailClick?: () => void;
    className?: string; // For additional styling
}

export function TrendCard({
    title,
    value,
    subValue,
    icon,
    iconBgColor = 'bg-primary/10',
    trend,
    history,
    onDetailClick,
    className
}: TrendCardProps) {
    const isTrendingUp = trend.direction === 'up';
    // Determine trend color based on isPositive
    // If isPositive is true, we want green. If false, we want red. 
    // Usually "Positive" means "Good".
    const trendColor = trend.isPositive ? 'text-green-600' : 'text-red-600';
    const trendIcon = isTrendingUp ? <ArrowUp weight="bold" /> : <ArrowDown weight="bold" />;

    return (
        <Card
            className={cn("relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow", className)}
            onClick={onDetailClick}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-0 pt-0 px-3 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn("p-1.5 rounded-full", iconBgColor)}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="pb-1 pt-0 px-3">
                <div className="flex flex-col gap-0">
                    <div className="text-6xl font-bold tracking-tight">
                        {value}
                        {subValue && <span className="text-lg font-normal text-muted-foreground ml-2">{subValue}</span>}
                    </div>

                    <div className="flex items-center gap-2 text-xs mt-0">
                        <span className={cn("flex items-center gap-0.5 font-medium", trendColor)}>
                            {trendIcon}
                            {Math.abs(trend.value)}%
                        </span>
                        <span className="text-muted-foreground">
                            {trend.label || 'vs last month'}
                        </span>
                    </div>
                </div>

                {/* Sparkline Area */}
                <div className="h-[50px] w-full mt-1 -mx-2 mb-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={trend.isPositive ? "#16a34a" : "#dc2626"} // green-600 or red-600
                                fill="none"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

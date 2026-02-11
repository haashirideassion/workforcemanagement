import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
    trend,
    onDetailClick,
    className
}: TrendCardProps) {
    const isTrendingUp = trend.direction === 'up';

    return (
        <Card
            className={cn("relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow", className)}
            onClick={onDetailClick}
            data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
            <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardTitle>
                        <div className="flex flex-col gap-1">
                            <div className="text-3xl font-bold tracking-tight">
                                {value}
                            </div>
                            {subValue && <span className="text-sm font-normal text-muted-foreground">{subValue}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                            <span className={cn("flex items-center gap-0.5 font-medium", trend.isPositive ? 'text-green-600' : 'text-red-600')}>
                                {isTrendingUp ? <ArrowUp weight="bold" /> : <ArrowDown weight="bold" />}
                                {Math.abs(trend.value)}%
                            </span>
                            <span className="text-muted-foreground">
                                {trend.label || 'vs last month'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Circular Progress Chart */}
                    <div className="w-24 h-24 flex items-center justify-center">
                        <ResponsiveContainer width={96} height={96}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'value', value: Math.min(100, Math.max(0, parseInt(String(value)) || 0)) },
                                        { name: 'empty', value: Math.max(0, 100 - Math.min(100, Math.max(0, parseInt(String(value)) || 0))) }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={48}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    <Cell fill={trend.isPositive ? "#10b981" : "#ef4444"} />
                                    <Cell fill="#e5e7eb" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {Math.min(100, Math.max(0, parseInt(String(value)) || 0))}%
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}

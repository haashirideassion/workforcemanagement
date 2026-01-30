import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUp, ArrowDown } from '@phosphor-icons/react';
import type { TrendDataPoint } from './TrendCard';

interface TrendDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    value: string | number;
    trend: {
        value: number;
        label?: string;
        direction: 'up' | 'down' | 'neutral';
        isPositive: boolean;
    };
    history: TrendDataPoint[];
    description?: string;
}

export function TrendDetailDialog({
    open,
    onOpenChange,
    title,
    value,
    trend,
    history,
    description
}: TrendDetailDialogProps) {
    const isTrendingUp = trend.direction === 'up';
    const trendColor = trend.isPositive ? 'text-green-600' : 'text-red-600';
    const trendIcon = isTrendingUp ? <ArrowUp weight="bold" /> : <ArrowDown weight="bold" />;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title} Analysis</DialogTitle>
                    <DialogDescription>
                        {description || `Detailed breakdown of ${title.toLowerCase()} over time.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Stats */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div>
                            <div className="text-sm text-muted-foreground">Current Value</div>
                            <div className="text-3xl font-bold">{value}</div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-sm text-muted-foreground">Trend</div>
                            <div className={`flex items-center gap-1 font-medium ${trendColor}`}>
                                {trendIcon}
                                {Math.abs(trend.value)}%
                                <span className="text-xs text-muted-foreground font-normal ml-1">
                                    {trend.label || 'vs last month'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={`detail-gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    formatter={(value: number | undefined) => [value || 0, title]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill={`url(#detail-gradient-${title})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Additional Context Placeholder */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">3-Month Average</div>
                            <div className="font-semibold">
                                {history.length > 0
                                    ? Math.round(history.reduce((a, b) => a + b.value, 0) / history.length)
                                    : 0}
                            </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Highest Point</div>
                            <div className="font-semibold">
                                {history.length > 0
                                    ? Math.max(...history.map(h => h.value))
                                    : 0}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

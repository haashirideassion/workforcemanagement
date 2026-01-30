import * as React from 'react';
import { cn } from '@/lib/utils';

export interface UtilizationSegment {
    id: string;
    label: string;
    value: number; // Percentage 0-100
    color?: string; // hex or tailwind class
}

interface SegmentedProgressProps {
    value: number; // Total value (0-100). If multiSegments provided, this can be sum or ignored.
    className?: string;
    showGlow?: boolean;
    size?: 'sm' | 'md' | 'lg';
    isMultiUtilization?: boolean;
    multiSegments?: UtilizationSegment[];
}

const DEFAULT_PALETTE = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
];

const GLOW_colors: Record<string, string> = {
    'bg-blue-500': 'rgba(59, 130, 246, 0.5)',
    'bg-purple-500': 'rgba(168, 85, 247, 0.5)',
    'bg-green-500': 'rgba(34, 197, 94, 0.5)',
    'bg-yellow-500': 'rgba(234, 179, 8, 0.5)',
    'bg-orange-500': 'rgba(249, 115, 22, 0.5)',
    'bg-pink-500': 'rgba(236, 72, 153, 0.5)',
    'bg-cyan-500': 'rgba(6, 182, 212, 0.5)',
    'bg-indigo-500': 'rgba(99, 102, 241, 0.5)',
};

/**
 * A segmented vertical-tick progress bar.
 * Dual-mode:
 * 1. Single-fill (default): One color for all filled segments.
 * 2. Multi-utilization (isMultiUtilization=true): Different colors per segment.
 */
const SegmentedProgress = React.forwardRef<HTMLDivElement, SegmentedProgressProps>(
    ({ value = 0, className, showGlow = true, size = 'md', isMultiUtilization = false, multiSegments = [] }, ref) => {
        const containerRef = React.useRef<HTMLDivElement>(null);
        const [segmentCount, setSegmentCount] = React.useState(50);

        // Size configurations
        const sizeConfig = {
            sm: { height: 'h-3', segmentWidth: 2, gap: 1 },
            md: { height: 'h-5', segmentWidth: 2, gap: 1 },
            lg: { height: 'h-7', segmentWidth: 3, gap: 1 },
        };

        const config = sizeConfig[size];

        // Measure container and calculate segments
        React.useEffect(() => {
            const calculateSegments = () => {
                if (containerRef.current) {
                    const containerWidth = containerRef.current.offsetWidth;
                    const segmentTotalWidth = config.segmentWidth + config.gap;
                    const calculatedSegments = Math.floor(containerWidth / segmentTotalWidth);
                    setSegmentCount(Math.max(10, calculatedSegments));
                }
            };

            calculateSegments();

            // Recalculate on resize
            const resizeObserver = new ResizeObserver(calculateSegments);
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            return () => resizeObserver.disconnect();
        }, [config.segmentWidth, config.gap]);

        // Helper to determine color of a tick at specific index
        const getTickColor = (index: number) => {
            if (!isMultiUtilization) {
                // Default mode: Single color based on total value
                const filledSegments = Math.round((Math.max(0, Math.min(100, value)) / 100) * segmentCount);
                if (index < filledSegments) return 'bg-blue-500';
                return 'bg-gray-400/30 dark:bg-gray-600/40';
            } else {
                // Multi-utilization mode
                if (multiSegments.length === 0) return 'bg-gray-400/30 dark:bg-gray-600/40';

                // Find which segment this index belongs to
                // We map 0..segmentCount to 0..100%
                const tickPercentageStart = (index / segmentCount) * 100;
                // const tickPercentageEnd = ((index + 1) / segmentCount) * 100; // not strictly needed if we check point inclusion

                let currentAccumulated = 0;
                for (let i = 0; i < multiSegments.length; i++) {
                    const segment = multiSegments[i];
                    const nextAccumulated = currentAccumulated + segment.value;

                    // If the tick falls within this segment's range
                    if (tickPercentageStart < nextAccumulated) {
                        return segment.color || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
                    }
                    currentAccumulated = nextAccumulated;
                }

                return 'bg-gray-400/30 dark:bg-gray-600/40';
            }
        };

        const getGlowStyle = (colorClass: string) => {
            if (!showGlow || colorClass.includes('gray')) return {};
            // Extract color or use map
            const glowColor = GLOW_colors[colorClass] || 'rgba(59, 130, 246, 0.5)'; // Default blue glow
            return { boxShadow: `0 0 2px ${glowColor}` };
        };

        // Combine refs
        const setRefs = React.useCallback((node: HTMLDivElement | null) => {
            containerRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
        }, [ref]);

        return (
            <div className={cn("w-full flex flex-col gap-2", className)}>
                {/* The Bar */}
                <div
                    ref={setRefs}
                    className="flex items-center w-full"
                    style={{ gap: `${config.gap}px` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    {Array.from({ length: segmentCount }).map((_, index) => {
                        const colorClass = getTickColor(index);
                        return (
                            <div
                                key={index}
                                className={cn(
                                    config.height,
                                    'flex-shrink-0 rounded-[0.5px]',
                                    colorClass
                                )}
                                style={{
                                    width: `${config.segmentWidth}px`,
                                    ...getGlowStyle(colorClass)
                                }}
                            />
                        );
                    })}
                </div>

                {/* The Legend (Only for multi-utilization) */}
                {isMultiUtilization && multiSegments.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {multiSegments.map((segment, idx) => {
                            const colorClass = segment.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
                            // Extract tailwind bg color to a CSS var or style is tricky without context, 
                            // but since we usually use tailwind classes, we can render the dot with that class.
                            return (
                                <div key={segment.id || idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <div className={cn("w-2 h-2 rounded-full", colorClass)} />
                                    <span>
                                        <span className="font-medium text-foreground">{segment.label}</span>
                                        <span className="opacity-70"> · {segment.value}%</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
);

SegmentedProgress.displayName = 'SegmentedProgress';

export { SegmentedProgress };

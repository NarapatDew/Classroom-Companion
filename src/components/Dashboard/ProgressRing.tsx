import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = '#10b981' // emerald-500 default
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Animated counting number
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        const animation = animate(count, percentage, { 
            duration: 1.5, 
            ease: "easeOut" 
        });
        return animation.stop;
    }, [percentage, count]);

    // Strip # for safe ID usage
    const safeColorId = color.replace('#', '');

    return (
        <div className="relative flex items-center justify-center p-2 group" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 overflow-visible relative z-10 transition-transform duration-500 hover:scale-105">
                <defs>
                    <linearGradient id={`gradient-${safeColorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={color} stopOpacity="0.7" />
                    </linearGradient>
                    <filter id={`shadow-${safeColorId}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={color} floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Background Track Circle */}
                <circle
                    stroke="#f1f5f9" // slate-100
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                
                {/* Main Solid Progress Circle */}
                <motion.circle
                    stroke={`url(#gradient-${safeColorId})`}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    filter={`url(#shadow-${safeColorId})`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="flex items-baseline gap-1 drop-shadow-sm">
                    <motion.span className="text-5xl font-black tracking-tight text-gray-800">
                        {rounded}
                    </motion.span>
                    <span className="text-2xl font-bold text-gray-500">%</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressRing;

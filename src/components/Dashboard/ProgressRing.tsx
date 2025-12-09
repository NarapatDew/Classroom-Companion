import React from 'react';
import { motion } from 'framer-motion';

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
    color = '#1967d2'
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    stroke="#e8eaed" // Google Gray 200 equivalent
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <motion.circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference} // Initial state
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-sans font-medium text-text">{percentage}%</span>
            </div>
        </div>
    );
};

export default ProgressRing;

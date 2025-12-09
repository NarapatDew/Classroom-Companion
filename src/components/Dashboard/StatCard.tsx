import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, className = '' }) => {
    return (
        <div className={`bg-white border border-border rounded-lg p-5 shadow-card ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-muted text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
                    <p className="text-2xl font-sans text-text">{value}</p>
                </div>
                <div className="p-2 rounded-full bg-secondary text-primary">
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;

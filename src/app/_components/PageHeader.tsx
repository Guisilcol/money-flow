import React from 'react';

interface PageHeaderProps {
    label: string;
    title: string;
    dateRange?: string;
    icon?: React.FC;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    label,
    title,
    dateRange,
    icon: Icon,
    actions
}) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{label}</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
            {dateRange && (
                <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-400">
                    {Icon && <Icon />}
                    {dateRange}
                </div>
            )}
        </div>
        {actions}
    </div>
);

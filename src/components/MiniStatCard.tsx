import React from 'react';

interface MiniStatCardProps {
    title: string;
    amount: number;
    subtitle?: string;
    colorClass: string;
    icon: React.FC;
    isPositive?: boolean;
}

export const MiniStatCard: React.FC<MiniStatCardProps> = ({
    title,
    amount,
    subtitle,
    colorClass,
    icon: Icon,
    isPositive = false
}) => (
    <div className={`${colorClass} rounded-2xl p-5 flex flex-col gap-2 transition-all hover:scale-[1.02] hover:shadow-lg`}>
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {title}
            </span>
            <div className="opacity-60">
                <Icon />
            </div>
        </div>
        <div className="text-xl font-black">
            {isPositive ? '+ ' : ''}R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        {subtitle && (
            <span className="text-[10px] font-medium opacity-60">{subtitle}</span>
        )}
    </div>
);

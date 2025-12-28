import React from 'react';

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.FC;
  colorClass: string;
  subText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, icon: Icon, colorClass, subText }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={`p-2 rounded-xl ${colorClass} shadow-sm`}>
        <Icon />
      </div>
    </div>
    <div className="text-2xl font-black text-slate-900">
      R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </div>
    {subText && <span className="text-xs text-slate-400 font-medium">{subText}</span>}
  </div>
);
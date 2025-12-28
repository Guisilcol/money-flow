import React from 'react';

export const StatCard = ({ title, amount, icon: Icon, colorClass, subText }: any) => (
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
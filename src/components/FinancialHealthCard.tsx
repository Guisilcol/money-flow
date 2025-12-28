import React from 'react';
import { PeriodSummary } from '../types';

interface FinancialHealthCardProps {
    summary: PeriodSummary;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({ summary }) => {
    const commitmentRate = summary.totalEntries > 0
        ? (summary.totalExpenses / summary.totalEntries) * 100
        : 0;

    const getBarColor = () => {
        if (summary.totalExpenses / summary.totalEntries > 0.8) return 'bg-rose-500';
        if (summary.totalExpenses / summary.totalEntries > 0.5) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                Saúde Financeira do Período
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-500">Comprometimento</span>
                    <span className="text-xl font-black text-slate-900">
                        {commitmentRate.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${getBarColor()}`}
                        style={{ width: `${Math.min(100, (summary.totalExpenses / Math.max(1, summary.totalEntries)) * 100)}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-4 italic">
                    Você tem <strong>R$ {summary.fixedExpenses.toLocaleString('pt-BR')}</strong> em contas fixas neste período.
                </p>
            </div>
        </div>
    );
};

import React from 'react';
import { PeriodSummary } from '../_lib/types';
import { Icons } from '../_lib/constants';

interface HeroSummaryProps {
    summary: PeriodSummary;
    periodName: string;
    dateRange: string;
    onEditClick?: () => void;
}

export const HeroSummary: React.FC<HeroSummaryProps> = ({
    summary,
    periodName,
    dateRange,
    onEditClick
}) => {
    const usagePercentage = summary.projectedVariableBalance > 0
        ? ((summary.projectedVariableBalance - summary.currentVariableBalance) / summary.projectedVariableBalance) * 100
        : 0;

    const isOverBudget = summary.currentVariableBalance < 0;
    const clampedUsage = Math.min(100, Math.max(0, usagePercentage));

    const getProgressColor = () => {
        if (isOverBudget) return 'bg-rose-500';
        if (usagePercentage > 80) return 'bg-amber-500';
        if (usagePercentage > 50) return 'bg-sky-500';
        return 'bg-emerald-500';
    };

    const getBalanceColor = () => {
        if (isOverBudget) return 'text-rose-600';
        if (usagePercentage > 80) return 'text-amber-600';
        return 'text-emerald-600';
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-300/30">
            {/* Header */}
            <div className="mb-8">
                <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                    Período Selecionado
                </span>
                <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                        {periodName}
                    </h2>
                    {onEditClick && (
                        <button
                            onClick={onEditClick}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
                            title="Editar período"
                            aria-label="Editar período"
                        >
                            <Icons.Edit />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-400 mt-1">
                    <Icons.Calendar />
                    {dateRange}
                </div>
            </div>

            {/* Main Balance Display */}
            <div className="text-center py-6">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">
                    Saldo Disponível para Gastos
                </p>
                <p className={`text-5xl md:text-6xl font-black ${getBalanceColor()} transition-colors`}>
                    R$ {Math.abs(summary.currentVariableBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {isOverBudget && (
                    <p className="text-rose-400 text-sm font-bold mt-2 animate-pulse">
                        ⚠️ Você ultrapassou o orçamento!
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
                <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-slate-400">Consumido</span>
                    <span className="text-white">{clampedUsage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${getProgressColor()} rounded-full`}
                        style={{ width: `${clampedUsage}%` }}
                    />
                </div>
                <div className="flex justify-between items-center text-xs font-medium mt-2 text-slate-500">
                    <span>R$ 0</span>
                    <span>Orçamento: R$ {summary.projectedVariableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700">
                <div className="text-center">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Gastos Variáveis</p>
                    <p className="text-lg font-black text-rose-400 mt-1">
                        - R$ {summary.variableExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="text-center border-x border-slate-700">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Orçamento Variável</p>
                    <p className="text-lg font-black text-sky-400 mt-1">
                        R$ {summary.projectedVariableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Investimento</p>
                    <p className="text-lg font-black text-indigo-400 mt-1">
                        R$ {summary.investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
};

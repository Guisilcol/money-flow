import React, { useState, useMemo } from 'react';
import { Transaction, PeriodSummary } from '../types';
import { Icons } from '../constants';
import { FinancialHealthCard } from './FinancialHealthCard';

interface TabbedTransactionTableProps {
    transactions: Transaction[];
    onDeleteTransaction: (id: string) => void;
    summary: PeriodSummary;
}

type InternalTabId = 'overview' | 'transactions';

const INTERNAL_TABS = [
    { id: 'overview', label: 'Visão Geral', icon: Icons.TrendingUp },
    { id: 'transactions', label: 'Gastos Variáveis', icon: Icons.Calendar }
];

export const TabbedTransactionTable: React.FC<TabbedTransactionTableProps> = ({
    transactions,
    onDeleteTransaction,
    summary
}) => {
    const [activeTab, setActiveTab] = useState<InternalTabId>('overview');

    // Filter states
    const [filterDate, setFilterDate] = useState('');
    const [filterMinValue, setFilterMinValue] = useState('');
    const [filterMaxValue, setFilterMaxValue] = useState('');
    const [filterName, setFilterName] = useState('');

    // Filtered and sorted transactions (all are variable expenses now)
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                // Date filter
                if (filterDate && t.date !== filterDate) return false;

                // Value filters
                if (filterMinValue && t.amount < parseFloat(filterMinValue)) return false;
                if (filterMaxValue && t.amount > parseFloat(filterMaxValue)) return false;

                // Name filter (description)
                if (filterName && !t.description.toLowerCase().includes(filterName.toLowerCase())) return false;

                return true;
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [transactions, filterDate, filterMinValue, filterMaxValue, filterName]);

    const clearFilters = () => {
        setFilterDate('');
        setFilterMinValue('');
        setFilterMaxValue('');
        setFilterName('');
    };

    const hasActiveFilters = filterDate || filterMinValue || filterMaxValue || filterName;

    const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100">
                {INTERNAL_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as InternalTabId)}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 font-bold text-sm transition-all relative ${isActive
                                ? 'text-slate-900 bg-slate-50/50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/30'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="p-8">
                {activeTab === 'overview' && (
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <FinancialHealthCard summary={summary} />
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-slate-50/80 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                    <Icons.Filter className="w-4 h-4" />
                                    Filtros
                                </h4>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Icons.X className="w-3 h-3" />
                                        Limpar Filtros
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Date Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Data</label>
                                    <input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Min Value Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Valor Mín. (R$)</label>
                                    <input
                                        type="number"
                                        value={filterMinValue}
                                        onChange={(e) => setFilterMinValue(e.target.value)}
                                        placeholder="0,00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Max Value Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Valor Máx. (R$)</label>
                                    <input
                                        type="number"
                                        value={filterMaxValue}
                                        onChange={(e) => setFilterMaxValue(e.target.value)}
                                        placeholder="0,00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Name Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Nome / Descrição</label>
                                    <input
                                        type="text"
                                        value={filterName}
                                        onChange={(e) => setFilterName(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                            <h4 className="text-xl font-black text-slate-900">
                                Gastos Variáveis
                            </h4>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Total: <span className="ml-1 text-rose-600">
                                    - R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="pb-4 px-3">Data</th>
                                        <th className="pb-4 px-3">Descrição</th>
                                        <th className="pb-4 px-3 text-right">Valor</th>
                                        <th className="pb-4 px-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredTransactions.map(t => (
                                        <tr key={t.id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="py-5 px-3 text-xs font-mono font-bold text-slate-400">
                                                {t.date.split('-').reverse().join('/')}
                                            </td>
                                            <td className="py-5 px-3 font-bold text-slate-900">{t.description}</td>
                                            <td className="py-5 px-3 text-right font-black text-slate-900">
                                                - R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-5 px-3 text-right w-10">
                                                <button
                                                    onClick={() => onDeleteTransaction(t.id)}
                                                    className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-slate-300 font-bold italic">
                                                {hasActiveFilters
                                                    ? 'Nenhum gasto encontrado com os filtros aplicados.'
                                                    : 'Nenhum gasto variável registrado neste período.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Results count */}
                        {filteredTransactions.length > 0 && (
                            <div className="text-xs text-slate-400 text-right">
                                Exibindo {filteredTransactions.length} de {transactions.length} gastos
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

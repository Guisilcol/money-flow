import React, { useState, useMemo } from 'react';
import { Transaction, PeriodSummary } from '../types';
import { Icons } from '../constants';
import { FinancialHealthCard } from './FinancialHealthCard';

interface TabbedTransactionTableProps {
    transactions: Transaction[];
    onDeleteTransaction: (id: string) => void;
    onUpdateTransaction: (transaction: Transaction) => void;
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
    onUpdateTransaction,
    summary
}) => {
    const [activeTab, setActiveTab] = useState<InternalTabId>('overview');

    // Filter states
    const [filterDate, setFilterDate] = useState('');
    const [filterMinValue, setFilterMinValue] = useState('');
    const [filterMaxValue, setFilterMaxValue] = useState('');
    const [filterName, setFilterName] = useState('');

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editAmount, setEditAmount] = useState('');

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

    const startEditing = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setEditDate(transaction.date);
        setEditDescription(transaction.description);
        setEditAmount(transaction.amount.toString());
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditDate('');
        setEditDescription('');
        setEditAmount('');
    };

    const handleSubmitEdit = (e: React.FormEvent, transaction: Transaction) => {
        e.preventDefault();
        if (!editDate || !editDescription.trim() || !editAmount) return;

        onUpdateTransaction({
            ...transaction,
            date: editDate,
            description: editDescription.trim(),
            amount: parseFloat(editAmount)
        });

        cancelEditing();
    };

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
                                        <th className="pb-4 px-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredTransactions.map(t => (
                                        <tr key={t.id}>
                                            {editingId === t.id ? (
                                                <td colSpan={4} className="py-4 px-3">
                                                    <form
                                                        onSubmit={(e) => handleSubmitEdit(e, t)}
                                                        className="flex gap-3 items-center"
                                                    >
                                                        <input
                                                            type="date"
                                                            value={editDate}
                                                            onChange={(e) => setEditDate(e.target.value)}
                                                            className="px-3 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editDescription}
                                                            onChange={(e) => setEditDescription(e.target.value)}
                                                            placeholder="Descrição"
                                                            className="flex-1 px-3 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            autoFocus
                                                        />
                                                        <input
                                                            type="number"
                                                            value={editAmount}
                                                            onChange={(e) => setEditAmount(e.target.value)}
                                                            placeholder="Valor"
                                                            step="0.01"
                                                            min="0"
                                                            className="w-28 px-3 py-2 text-sm font-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            Salvar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEditing}
                                                            className="px-3 py-2 text-slate-400 hover:text-slate-600 font-bold transition-all text-sm"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </form>
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="py-5 px-3 text-xs font-mono font-bold text-slate-400">
                                                        {t.date.split('-').reverse().join('/')}
                                                    </td>
                                                    <td className="py-5 px-3 font-bold text-slate-900">{t.description}</td>
                                                    <td className="py-5 px-3 text-right font-black text-slate-900">
                                                        - R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-5 px-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => startEditing(t)}
                                                                className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50"
                                                                title="Editar"
                                                            >
                                                                <Icons.Edit />
                                                            </button>
                                                            <button
                                                                onClick={() => onDeleteTransaction(t.id)}
                                                                className="p-2 text-slate-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50"
                                                                title="Excluir"
                                                            >
                                                                <Icons.Trash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
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

import React, { useState, useMemo } from 'react';
import { Transaction, Entry, FixedExpense } from '../types';
import { Icons } from '../constants';
import { generateId } from '../utils';

// Unified item type for the table
interface UnifiedItem {
    id: string;
    type: 'entry' | 'fixed' | 'variable';
    name: string;
    amount: number;
    date?: string;
    originalItem: Transaction | Entry | FixedExpense;
}

interface UnifiedTransactionTableProps {
    transactions: Transaction[];
    entries: Entry[];
    fixedExpenses: FixedExpense[];
    periodId: string;
    // Transaction handlers
    onDeleteTransaction: (id: string) => void;
    onUpdateTransaction: (transaction: Transaction) => void;
    onAddTransaction: (transaction: Transaction) => void;
    // Entry handlers
    onDeleteEntry: (id: string) => void;
    onUpdateEntry: (entry: Entry) => void;
    onAddEntry: (entry: Entry) => void;
    // Fixed expense handlers
    onDeleteFixedExpense: (id: string) => void;
    onUpdateFixedExpense: (expense: FixedExpense) => void;
    onAddFixedExpense: (expense: FixedExpense) => void;
}

type TabId = 'all' | 'entries' | 'fixed' | 'variable';

const TABS: { id: TabId; label: string; color: string }[] = [
    { id: 'all', label: 'Todos', color: 'slate' },
    { id: 'entries', label: 'Entradas', color: 'emerald' },
    { id: 'fixed', label: 'Gastos Fixos', color: 'amber' },
    { id: 'variable', label: 'Gastos Variáveis', color: 'rose' }
];

const TYPE_BADGES = {
    entry: { label: 'Entrada', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
    fixed: { label: 'Fixo', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    variable: { label: 'Variável', bgColor: 'bg-rose-100', textColor: 'text-rose-700' }
};

export const UnifiedTransactionTable: React.FC<UnifiedTransactionTableProps> = ({
    transactions,
    entries,
    fixedExpenses,
    periodId,
    onDeleteTransaction,
    onUpdateTransaction,
    onAddTransaction,
    onDeleteEntry,
    onUpdateEntry,
    onAddEntry,
    onDeleteFixedExpense,
    onUpdateFixedExpense,
    onAddFixedExpense
}) => {
    const [activeTab, setActiveTab] = useState<TabId>('all');
    const [filterName, setFilterName] = useState('');

    // Add form states
    const [isAdding, setIsAdding] = useState(false);
    const [addType, setAddType] = useState<'entry' | 'fixed' | 'variable'>('variable');
    const [addName, setAddName] = useState('');
    const [addAmount, setAddAmount] = useState('');
    const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editType, setEditType] = useState<'entry' | 'fixed' | 'variable'>('variable');
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');

    // Unify all items into a single list
    const unifiedItems = useMemo((): UnifiedItem[] => {
        const items: UnifiedItem[] = [];

        // Add entries
        entries.forEach(entry => {
            items.push({
                id: entry.id,
                type: 'entry',
                name: entry.name,
                amount: entry.amount,
                originalItem: entry
            });
        });

        // Add fixed expenses
        fixedExpenses.forEach(expense => {
            items.push({
                id: expense.id,
                type: 'fixed',
                name: expense.name,
                amount: expense.amount,
                originalItem: expense
            });
        });

        // Add variable expenses (transactions)
        transactions.forEach(transaction => {
            items.push({
                id: transaction.id,
                type: 'variable',
                name: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                originalItem: transaction
            });
        });

        return items;
    }, [transactions, entries, fixedExpenses]);

    // Filter items based on active tab and search
    const filteredItems = useMemo(() => {
        return unifiedItems
            .filter(item => {
                // Tab filter
                if (activeTab === 'entries' && item.type !== 'entry') return false;
                if (activeTab === 'fixed' && item.type !== 'fixed') return false;
                if (activeTab === 'variable' && item.type !== 'variable') return false;

                // Name filter
                if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false;

                return true;
            })
            .sort((a, b) => {
                // Sort by type first (entries, then fixed, then variable), then by date for variables
                const typeOrder = { entry: 0, fixed: 1, variable: 2 };
                if (typeOrder[a.type] !== typeOrder[b.type]) {
                    return typeOrder[a.type] - typeOrder[b.type];
                }
                // For variables, sort by date descending
                if (a.type === 'variable' && b.type === 'variable' && a.date && b.date) {
                    return b.date.localeCompare(a.date);
                }
                return 0;
            });
    }, [unifiedItems, activeTab, filterName]);

    // Calculate totals per tab
    const totals = useMemo(() => ({
        all: {
            entries: entries.reduce((acc, e) => acc + e.amount, 0),
            fixed: fixedExpenses.reduce((acc, e) => acc + e.amount, 0),
            variable: transactions.reduce((acc, t) => acc + t.amount, 0)
        },
        entries: entries.reduce((acc, e) => acc + e.amount, 0),
        fixed: fixedExpenses.reduce((acc, e) => acc + e.amount, 0),
        variable: transactions.reduce((acc, t) => acc + t.amount, 0)
    }), [entries, fixedExpenses, transactions]);

    const handleDelete = (item: UnifiedItem) => {
        switch (item.type) {
            case 'entry':
                onDeleteEntry(item.id);
                break;
            case 'fixed':
                onDeleteFixedExpense(item.id);
                break;
            case 'variable':
                onDeleteTransaction(item.id);
                break;
        }
    };

    const startEditing = (item: UnifiedItem) => {
        setEditingId(item.id);
        setEditType(item.type);
        setEditName(item.name);
        setEditAmount(item.amount.toString());
        setEditDate(item.date || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditAmount('');
        setEditDate('');
    };

    const handleSubmitEdit = (e: React.FormEvent, item: UnifiedItem) => {
        e.preventDefault();
        if (!editName.trim() || !editAmount) return;

        switch (item.type) {
            case 'entry':
                onUpdateEntry({
                    ...(item.originalItem as Entry),
                    name: editName.trim(),
                    amount: parseFloat(editAmount)
                });
                break;
            case 'fixed':
                onUpdateFixedExpense({
                    ...(item.originalItem as FixedExpense),
                    name: editName.trim(),
                    amount: parseFloat(editAmount)
                });
                break;
            case 'variable':
                onUpdateTransaction({
                    ...(item.originalItem as Transaction),
                    description: editName.trim(),
                    amount: parseFloat(editAmount),
                    date: editDate
                });
                break;
        }

        cancelEditing();
    };

    const resetAddForm = () => {
        setAddName('');
        setAddAmount('');
        setAddDate(new Date().toISOString().split('T')[0]);
        setIsAdding(false);
    };

    const handleSubmitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addName.trim() || !addAmount) return;

        const id = generateId();
        const amount = parseFloat(addAmount);

        switch (addType) {
            case 'entry':
                onAddEntry({ id, periodId, name: addName.trim(), amount });
                break;
            case 'fixed':
                onAddFixedExpense({ id, periodId, name: addName.trim(), amount });
                break;
            case 'variable':
                onAddTransaction({
                    id,
                    periodId,
                    type: 'EXPENSE' as any,
                    category: 'VARIABLE_EXPENSE' as any,
                    description: addName.trim(),
                    amount,
                    date: addDate
                });
                break;
        }

        resetAddForm();
    };

    const startAdding = (type: 'entry' | 'fixed' | 'variable') => {
        setAddType(type);
        setIsAdding(true);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-4 font-bold text-sm transition-all relative ${isActive
                                ? 'text-slate-900 bg-slate-50/50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/30'
                                }`}
                        >
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="p-6">
                {/* Search and Add */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            placeholder="Buscar por nome..."
                            className="w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <Icons.Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    {/* Add buttons based on active tab */}
                    <div className="flex gap-2">
                        {(activeTab === 'all' || activeTab === 'entries') && (
                            <button
                                onClick={() => startAdding('entry')}
                                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
                            >
                                <Icons.Plus /> Entrada
                            </button>
                        )}
                        {(activeTab === 'all' || activeTab === 'fixed') && (
                            <button
                                onClick={() => startAdding('fixed')}
                                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
                            >
                                <Icons.Plus /> Fixo
                            </button>
                        )}
                        {(activeTab === 'all' || activeTab === 'variable') && (
                            <button
                                onClick={() => startAdding('variable')}
                                className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
                            >
                                <Icons.Plus /> Variável
                            </button>
                        )}
                    </div>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <form onSubmit={handleSubmitAdd} className="mb-6 p-4 bg-slate-50 rounded-2xl">
                        <div className="flex flex-wrap gap-3">
                            <div className={`px-3 py-2 rounded-lg text-sm font-bold ${TYPE_BADGES[addType].bgColor} ${TYPE_BADGES[addType].textColor}`}>
                                {TYPE_BADGES[addType].label}
                            </div>
                            <input
                                type="text"
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder="Nome / Descrição"
                                className="flex-1 min-w-[200px] px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                            {addType === 'variable' && (
                                <input
                                    type="date"
                                    value={addDate}
                                    onChange={(e) => setAddDate(e.target.value)}
                                    className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            )}
                            <input
                                type="number"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                placeholder="Valor"
                                step="0.01"
                                min="0"
                                className="w-32 px-4 py-2 text-sm font-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all text-sm"
                            >
                                Salvar
                            </button>
                            <button
                                type="button"
                                onClick={resetAddForm}
                                className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold transition-all text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {/* Summary Stats */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    {(activeTab === 'all' || activeTab === 'entries') && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold">
                            Entradas: + R$ {totals.entries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                    {(activeTab === 'all' || activeTab === 'fixed') && (
                        <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold">
                            Fixos: - R$ {totals.fixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                    {(activeTab === 'all' || activeTab === 'variable') && (
                        <div className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold">
                            Variáveis: - R$ {totals.variable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="pb-4 px-3">Tipo</th>
                                <th className="pb-4 px-3">Nome</th>
                                <th className="pb-4 px-3">Data</th>
                                <th className="pb-4 px-3 text-right">Valor</th>
                                <th className="pb-4 px-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.map(item => (
                                <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/50 transition-all">
                                    {editingId === item.id ? (
                                        <td colSpan={5} className="py-4 px-3">
                                            <form
                                                onSubmit={(e) => handleSubmitEdit(e, item)}
                                                className="flex flex-wrap gap-3 items-center"
                                            >
                                                <div className={`px-3 py-2 rounded-lg text-xs font-bold ${TYPE_BADGES[editType].bgColor} ${TYPE_BADGES[editType].textColor}`}>
                                                    {TYPE_BADGES[editType].label}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    placeholder="Nome / Descrição"
                                                    className="flex-1 min-w-[200px] px-3 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    autoFocus
                                                />
                                                {item.type === 'variable' && (
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) => setEditDate(e.target.value)}
                                                        className="px-3 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                )}
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
                                            <td className="py-4 px-3">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${TYPE_BADGES[item.type].bgColor} ${TYPE_BADGES[item.type].textColor}`}>
                                                    {TYPE_BADGES[item.type].label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-3 font-bold text-slate-900">
                                                {item.name}
                                            </td>
                                            <td className="py-4 px-3 text-xs font-mono font-bold text-slate-400">
                                                {item.date ? item.date.split('-').reverse().join('/') : '-'}
                                            </td>
                                            <td className={`py-4 px-3 text-right font-black ${item.type === 'entry' ? 'text-emerald-600' : 'text-slate-900'
                                                }`}>
                                                {item.type === 'entry' ? '+ ' : '- '}R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => startEditing(item)}
                                                        className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50"
                                                        title="Editar"
                                                    >
                                                        <Icons.Edit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
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
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-300 font-bold italic">
                                        {filterName
                                            ? 'Nenhum item encontrado com o filtro aplicado.'
                                            : 'Nenhum lançamento registrado nesta categoria.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Results count */}
                {filteredItems.length > 0 && (
                    <div className="text-xs text-slate-400 text-right mt-4">
                        Exibindo {filteredItems.length} de {unifiedItems.length} lançamentos
                    </div>
                )}
            </div>
        </div>
    );
};

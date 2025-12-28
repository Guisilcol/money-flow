import React, { useState } from 'react';
import { FixedExpense } from '../types';
import { Icons } from '../constants';
import { generateId } from '../utils';

interface FixedExpenseCardProps {
    periodId: string;
    fixedExpenses: FixedExpense[];
    onAddFixedExpense: (expense: FixedExpense) => void;
    onDeleteFixedExpense: (expenseId: string) => void;
}

export const FixedExpenseCard: React.FC<FixedExpenseCardProps> = ({
    periodId,
    fixedExpenses,
    onAddFixedExpense,
    onDeleteFixedExpense
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const totalFixedExpenses = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !amount) return;

        onAddFixedExpense({
            id: generateId(),
            periodId,
            name: name.trim(),
            amount: parseFloat(amount)
        });

        setName('');
        setAmount('');
        setIsAdding(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-amber-50/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Icons.Calendar />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900">Gastos Fixos</h3>
                            <p className="text-xs text-slate-500">Valores mensais recorrentes</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="text-xl font-black text-amber-600">
                            R$ {totalFixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-50">
                {fixedExpenses.map((expense) => (
                    <div key={expense.id} className="group flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-all">
                        <span className="font-bold text-slate-700">{expense.name}</span>
                        <div className="flex items-center gap-4">
                            <span className="font-black text-slate-900">
                                R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                                onClick={() => onDeleteFixedExpense(expense.id)}
                                className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50"
                            >
                                <Icons.Trash />
                            </button>
                        </div>
                    </div>
                ))}

                {fixedExpenses.length === 0 && !isAdding && (
                    <div className="px-6 py-8 text-center text-slate-300 font-bold italic">
                        Nenhum gasto fixo cadastrado
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding ? (
                <form onSubmit={handleSubmit} className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome do gasto (ex: Aluguel)"
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                            autoFocus
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Valor"
                            step="0.01"
                            min="0"
                            className="w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-black text-slate-900"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all"
                        >
                            Salvar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false);
                                setName('');
                                setAmount('');
                            }}
                            className="px-4 py-3 text-slate-400 hover:text-slate-600 font-bold transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full p-4 flex items-center justify-center gap-2 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-all border-t border-slate-100"
                >
                    <Icons.Plus /> Adicionar Gasto Fixo
                </button>
            )}
        </div>
    );
};

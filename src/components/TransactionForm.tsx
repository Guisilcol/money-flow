import React from 'react';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { generateId, getTodayStr } from '../utils';

interface TransactionFormProps {
    periodId: string;
    onSubmit: (transaction: Transaction) => void;
    onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
    periodId,
    onSubmit,
    onCancel
}) => {
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newTransaction: Transaction = {
            id: generateId(),
            periodId: periodId,
            type: TransactionType.EXPENSE,
            category: TransactionCategory.VARIABLE_EXPENSE,
            amount: parseFloat(formData.get('amount') as string),
            description: formData.get('description') as string,
            date: formData.get('date') as string
        };

        onSubmit(newTransaction);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Descrição
                </label>
                <input
                    name="description"
                    required
                    placeholder="Ex: Supermercado, Restaurante..."
                    className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Valor (R$)
                    </label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0,00"
                        className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-lg"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Data
                    </label>
                    <input
                        name="date"
                        type="date"
                        required
                        defaultValue={getTodayStr()}
                        className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
                Salvar Gasto Variável
            </button>
        </form>
    );
};

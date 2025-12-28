import React from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { generateId, getTodayStr } from '../utils';

type ActiveTab = 'overview' | 'fixed' | 'variable' | 'entries';

interface TransactionFormProps {
    periodId: string;
    activeTab: ActiveTab;
    onSubmit: (transaction: Transaction) => void;
    onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
    periodId,
    activeTab,
    onSubmit,
    onCancel
}) => {
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as TransactionType;

        const isFixedFormValue = formData.get('isFixed') === 'true';
        const isFixed = activeTab === 'fixed' ? true : isFixedFormValue;

        const newTransaction: Transaction = {
            id: generateId(),
            periodId: periodId,
            type: type,
            category: formData.get('category') as string,
            amount: parseFloat(formData.get('amount') as string),
            description: formData.get('description') as string,
            date: formData.get('date') as string,
            isFixed: type === TransactionType.EXPENSE ? isFixed : false
        };

        onSubmit(newTransaction);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Tipo de Transação (Escondido se estiver na aba Fixed) */}
            {activeTab !== 'fixed' && (
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <label className="flex-1 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value={TransactionType.EXPENSE}
                            defaultChecked={activeTab !== 'entries'}
                            className="hidden peer"
                        />
                        <div className="text-center py-3 rounded-xl peer-checked:bg-white peer-checked:shadow-md text-[10px] font-black text-slate-400 peer-checked:text-indigo-600 uppercase tracking-widest transition-all">
                            Saída
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value={TransactionType.ENTRY}
                            defaultChecked={activeTab === 'entries'}
                            className="hidden peer"
                        />
                        <div className="text-center py-3 rounded-xl peer-checked:bg-white peer-checked:shadow-md text-[10px] font-black text-slate-400 peer-checked:text-emerald-600 uppercase tracking-widest transition-all">
                            Entrada
                        </div>
                    </label>
                </div>
            )}

            {activeTab === 'fixed' && (
                <input type="hidden" name="type" value={TransactionType.EXPENSE} />
            )}

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Descrição
                </label>
                <input
                    name="description"
                    required
                    placeholder="Ex: Aluguel, Supermercado..."
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

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Categoria
                </label>
                <select
                    name="category"
                    className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none bg-white font-bold"
                >
                    {[...CATEGORIES.ENTRY, ...CATEGORIES.EXPENSE].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Opção Fixa */}
            {activeTab !== 'fixed' && (
                <div className="flex items-center gap-4 py-4 px-4 bg-slate-50 rounded-2xl">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isFixed" value="true" id="isFixed" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                    <label htmlFor="isFixed" className="text-sm font-bold text-slate-600 select-none">
                        Este é um gasto fixo?
                    </label>
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
                {activeTab === 'fixed' ? 'Salvar Conta Fixa' : 'Salvar Lançamento'}
            </button>
        </form>
    );
};

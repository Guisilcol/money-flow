import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { CATEGORY_LABELS } from '../constants';
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
    // Estado para rastrear o tipo selecionado dinamicamente
    const getInitialType = () => {
        if (activeTab === 'fixed') return TransactionType.EXPENSE;
        if (activeTab === 'entries') return TransactionType.ENTRY;
        return TransactionType.EXPENSE;
    };

    const [selectedType, setSelectedType] = useState<TransactionType>(getInitialType);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Determinar categoria baseado no tipo e seleção do usuário
        let category: TransactionCategory;
        if (selectedType === TransactionType.ENTRY) {
            category = TransactionCategory.ENTRY;
        } else {
            // Para EXPENSE, usar valor do formulário ou default baseado na aba
            const categoryValue = formData.get('category') as TransactionCategory;
            if (activeTab === 'fixed') {
                category = TransactionCategory.FIXED_EXPENSE;
            } else if (categoryValue) {
                category = categoryValue;
            } else {
                category = TransactionCategory.VARIABLE_EXPENSE;
            }
        }

        const newTransaction: Transaction = {
            id: generateId(),
            periodId: periodId,
            type: selectedType,
            category: category,
            amount: parseFloat(formData.get('amount') as string),
            description: formData.get('description') as string,
            date: formData.get('date') as string
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
                            checked={selectedType === TransactionType.EXPENSE}
                            onChange={() => setSelectedType(TransactionType.EXPENSE)}
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
                            checked={selectedType === TransactionType.ENTRY}
                            onChange={() => setSelectedType(TransactionType.ENTRY)}
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

            {/* Seletor de Categoria para Gastos (só aparece quando tipo é EXPENSE e não está na aba Fixed) */}
            {selectedType === TransactionType.EXPENSE && activeTab !== 'fixed' && (
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Tipo de Gasto
                    </label>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value={TransactionCategory.VARIABLE_EXPENSE}
                                defaultChecked
                                className="hidden peer"
                            />
                            <div className="text-center py-3 rounded-xl peer-checked:bg-white peer-checked:shadow-md text-[10px] font-black text-slate-400 peer-checked:text-rose-600 uppercase tracking-widest transition-all">
                                {CATEGORY_LABELS[TransactionCategory.VARIABLE_EXPENSE]}
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value={TransactionCategory.FIXED_EXPENSE}
                                className="hidden peer"
                            />
                            <div className="text-center py-3 rounded-xl peer-checked:bg-white peer-checked:shadow-md text-[10px] font-black text-slate-400 peer-checked:text-amber-600 uppercase tracking-widest transition-all">
                                {CATEGORY_LABELS[TransactionCategory.FIXED_EXPENSE]}
                            </div>
                        </label>
                    </div>
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

import React, { useState } from 'react';
import { Icons } from '../constants';
import { generateId } from '../utils';

interface Item {
    id: string;
    periodId: string;
    name: string;
    amount: number;
}

interface ItemCardProps {
    periodId: string;
    items: Item[];
    onAdd: (item: Item) => void;
    onUpdate: (item: Item) => void;
    onDelete: (itemId: string) => void;
    // Theming
    title: string;
    subtitle: string;
    themeColor: 'emerald' | 'amber';
    icon: React.ComponentType<{ className?: string }>;
    addButtonText: string;
    inputPlaceholder: string;
    emptyMessage: string;
    isIncome?: boolean; // Show + or without sign
}

const colorClasses = {
    emerald: {
        headerBg: 'bg-emerald-50/50',
        iconBg: 'bg-emerald-100',
        iconText: 'text-emerald-600',
        totalText: 'text-emerald-600',
        amountText: 'text-emerald-600',
        buttonText: 'text-emerald-600',
        buttonHover: 'hover:bg-emerald-50',
        inputRing: 'focus:ring-emerald-500',
        submitBg: 'bg-emerald-500 hover:bg-emerald-600',
    },
    amber: {
        headerBg: 'bg-amber-50/50',
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
        totalText: 'text-amber-600',
        amountText: 'text-slate-900',
        buttonText: 'text-amber-600',
        buttonHover: 'hover:bg-amber-50',
        inputRing: 'focus:ring-amber-500',
        submitBg: 'bg-amber-500 hover:bg-amber-600',
    },
};

export const ItemCard: React.FC<ItemCardProps> = ({
    periodId,
    items,
    onAdd,
    onUpdate,
    onDelete,
    title,
    subtitle,
    themeColor,
    icon: Icon,
    addButtonText,
    inputPlaceholder,
    emptyMessage,
    isIncome = false,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const colors = colorClasses[themeColor];
    const total = items.reduce((acc, curr) => acc + curr.amount, 0);

    const resetForm = () => {
        setName('');
        setAmount('');
    };

    const handleSubmitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !amount) return;

        onAdd({
            id: generateId(),
            periodId,
            name: name.trim(),
            amount: parseFloat(amount),
        });

        resetForm();
        setIsAdding(false);
    };

    const handleSubmitEdit = (e: React.FormEvent, item: Item) => {
        e.preventDefault();
        if (!name.trim() || !amount) return;

        onUpdate({
            ...item,
            name: name.trim(),
            amount: parseFloat(amount),
        });

        resetForm();
        setEditingId(null);
    };

    const startEditing = (item: Item) => {
        setEditingId(item.id);
        setName(item.name);
        setAmount(item.amount.toString());
        setIsAdding(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        resetForm();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className={`p-6 border-b border-slate-100 ${colors.headerBg}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center ${colors.iconText}`}>
                            <Icon />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900">{title}</h3>
                            <p className="text-xs text-slate-500">{subtitle}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        <p className={`text-xl font-black ${colors.totalText}`}>
                            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-50">
                {items.map((item) => (
                    <div key={item.id}>
                        {editingId === item.id ? (
                            <form
                                onSubmit={(e) => handleSubmitEdit(e, item)}
                                className="p-6 bg-slate-50/50"
                            >
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={inputPlaceholder}
                                        className={`flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${colors.inputRing} font-bold text-slate-900`}
                                        autoFocus
                                    />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Valor"
                                        step="0.01"
                                        min="0"
                                        className={`w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${colors.inputRing} font-black text-slate-900`}
                                    />
                                    <button
                                        type="submit"
                                        className={`px-6 py-3 ${colors.submitBg} text-white font-bold rounded-xl transition-all`}
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="px-4 py-3 text-slate-400 hover:text-slate-600 font-bold transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="group flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-all">
                                <span className="font-bold text-slate-700">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black ${colors.amountText}`}>
                                        {isIncome ? '+ ' : ''}R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <button
                                        onClick={() => startEditing(item)}
                                        className="p-2 text-slate-300 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50"
                                        title="Editar"
                                    >
                                        <Icons.Edit />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50"
                                        title="Excluir"
                                    >
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {items.length === 0 && !isAdding && (
                    <div className="px-6 py-8 text-center text-slate-300 font-bold italic">
                        {emptyMessage}
                    </div>
                )}
            </div>

            {/* Add Form */}
            {isAdding ? (
                <form onSubmit={handleSubmitAdd} className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={inputPlaceholder}
                            className={`flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${colors.inputRing} font-bold text-slate-900`}
                            autoFocus
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Valor"
                            step="0.01"
                            min="0"
                            className={`w-32 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 ${colors.inputRing} font-black text-slate-900`}
                        />
                        <button
                            type="submit"
                            className={`px-6 py-3 ${colors.submitBg} text-white font-bold rounded-xl transition-all`}
                        >
                            Salvar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false);
                                resetForm();
                            }}
                            className="px-4 py-3 text-slate-400 hover:text-slate-600 font-bold transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                    }}
                    className={`w-full p-4 flex items-center justify-center gap-2 text-sm font-bold ${colors.buttonText} ${colors.buttonHover} transition-all border-t border-slate-100`}
                >
                    <Icons.Plus /> {addButtonText}
                </button>
            )}
        </div>
    );
};

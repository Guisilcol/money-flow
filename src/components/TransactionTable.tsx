import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Icons } from '../constants';

interface TransactionTableProps {
    transactions: Transaction[];
    onDeleteTransaction: (id: string) => void;
    emptyMessage?: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    onDeleteTransaction,
    emptyMessage = 'Nenhum lançamento encontrado nesta categoria.'
}) => {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <h4 className="text-xl font-black text-slate-900">
                    {transactions.length > 0 && transactions[0].type === TransactionType.ENTRY
                        ? 'Minhas Entradas'
                        : transactions.some(t => t.isFixed)
                            ? 'Contas Mensais Fixas'
                            : 'Lançamentos Variáveis'}
                </h4>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Total da Aba: <span className="text-slate-900 ml-1">R$ {
                        total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="pb-4 px-3">Data</th>
                            <th className="pb-4 px-3">Descrição</th>
                            <th className="pb-4 px-3">Categoria</th>
                            <th className="pb-4 px-3 text-right">Valor</th>
                            <th className="pb-4 px-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.map(t => (
                            <tr key={t.id} className="group hover:bg-slate-50/80 transition-all">
                                <td className="py-5 px-3 text-xs font-mono font-bold text-slate-400">
                                    {t.date.split('-').reverse().join('/')}
                                </td>
                                <td className="py-5 px-3 font-bold text-slate-900">{t.description}</td>
                                <td className="py-5 px-3">
                                    <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter">
                                        {t.category}
                                    </span>
                                </td>
                                <td className={`py-5 px-3 text-right font-black ${t.type === TransactionType.ENTRY ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

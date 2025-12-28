import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AccountingPeriod, Transaction, TransactionType, PeriodSummary } from '../types';
import { Icons, CATEGORIES } from '../constants';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';
import { generateId, getTodayStr } from '../utils';

interface PeriodDetailsProps {
  period: AccountingPeriod;
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const PeriodDetails: React.FC<PeriodDetailsProps> = ({
  period,
  transactions,
  onAddTransaction,
  onDeleteTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fixed' | 'variable' | 'entries'>('overview');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  // --- Derived State ---
  const summary = useMemo((): PeriodSummary => {
    const entries = transactions.filter(t => t.type === TransactionType.ENTRY);
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalEntries = entries.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const fixedExpenses = expenses.filter(t => t.isFixed).reduce((acc, curr) => acc + curr.amount, 0);
    const variableExpenses = expenses.filter(t => !t.isFixed).reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalEntries,
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      balance: totalEntries - totalExpenses
    };
  }, [transactions]);

  // --- Handlers ---
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as TransactionType;
    
    // Se estiver na aba de fixos, força ser fixo. Caso contrário, lê do checkbox.
    const isFixedFormValue = formData.get('isFixed') === 'true';
    const isFixed = activeTab === 'fixed' ? true : isFixedFormValue;

    const newTransaction: Transaction = {
      id: generateId(),
      periodId: period.id,
      type: type,
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      isFixed: type === TransactionType.EXPENSE ? isFixed : false
    };

    onAddTransaction(newTransaction);
    setIsAddingTransaction(false);
  };

  const filteredTransactions = transactions
    .filter(t => {
      if (activeTab === 'entries') return t.type === TransactionType.ENTRY;
      if (activeTab === 'fixed') return t.type === TransactionType.EXPENSE && t.isFixed;
      return t.type === TransactionType.EXPENSE && !t.isFixed;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const chartData = transactions.reduce((acc: any[], curr) => {
    const found = acc.find(a => a.name === curr.category);
    if (found) found.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount, type: curr.type });
    return acc;
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Período Selecionado</span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{period.name}</h2>
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-400">
            <Icons.Calendar />
            {period.startDate.split('-').reverse().join('/')} até {period.endDate.split('-').reverse().join('/')}
          </div>
        </div>
        <button 
          onClick={() => setIsAddingTransaction(true)}
          className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-[1.25rem] font-bold flex items-center gap-2 shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95"
        >
          <Icons.Plus /> Lançar {activeTab === 'fixed' ? 'Conta Fixa' : activeTab === 'entries' ? 'Entrada' : 'Gasto'}
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Entradas" 
          amount={summary.totalEntries} 
          icon={Icons.TrendingUp} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Saídas Totais" 
          amount={summary.totalExpenses} 
          icon={Icons.TrendingDown} 
          colorClass="bg-rose-50 text-rose-600"
        />
        <StatCard 
          title="Gastos Fixos" 
          amount={summary.fixedExpenses} 
          icon={Icons.Calendar} 
          colorClass="bg-amber-50 text-amber-600"
          subText={`Variáveis: R$ ${summary.variableExpenses.toFixed(2)}`}
        />
        <StatCard 
          title="Saldo Final" 
          amount={summary.balance} 
          icon={Icons.Wallet} 
          colorClass={summary.balance >= 0 ? "bg-indigo-50 text-indigo-600" : "bg-rose-100 text-rose-700"}
        />
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex bg-slate-50/50 border-b overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'entries', label: 'Minhas Entradas' },
            { id: 'fixed', label: 'Gastos Fixos' },
            { id: 'variable', label: 'Gastos Variáveis' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-5 text-sm font-bold transition-all whitespace-nowrap border-b-4 ${
                activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 bg-white' 
                : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="h-72">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Fluxo por Categoria</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.type === TransactionType.ENTRY ? '#10b981' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-6">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                    Saúde Financeira do Período
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-500">Comprometimento</span>
                      <span className="text-xl font-black text-slate-900">
                        {summary.totalEntries > 0 
                          ? ((summary.totalExpenses / summary.totalEntries) * 100).toFixed(1) 
                          : 0}% 
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${summary.totalExpenses / summary.totalEntries > 0.8 ? 'bg-rose-500' : summary.totalExpenses / summary.totalEntries > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (summary.totalExpenses / Math.max(1, summary.totalEntries)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-4 italic">
                      Você tem <strong>R$ {summary.fixedExpenses.toLocaleString('pt-BR')}</strong> em contas fixas neste período.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <h4 className="text-xl font-black text-slate-900">
                  {activeTab === 'fixed' ? 'Contas Mensais Fixas' : 
                   activeTab === 'variable' ? 'Lançamentos Variáveis' : 'Minhas Entradas'}
                </h4>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Total da Aba: <span className="text-slate-900 ml-1">R$ {
                    filteredTransactions
                      .reduce((acc, t) => acc + t.amount, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
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
                    {filteredTransactions.map(t => (
                        <tr key={t.id} className="group hover:bg-slate-50/80 transition-all">
                          <td className="py-5 px-3 text-xs font-mono font-bold text-slate-400">{t.date.split('-').reverse().join('/')}</td>
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
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic">
                          Nenhum lançamento encontrado nesta categoria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isAddingTransaction} 
        onClose={() => setIsAddingTransaction(false)} 
        title={activeTab === 'fixed' ? 'Nova Conta Fixa' : "Novo Lançamento"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Tipo de Transação (Escondido se estiver na aba Fixed) */}
          {activeTab !== 'fixed' && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="type" value={TransactionType.EXPENSE} defaultChecked={activeTab !== 'entries'} className="hidden peer" />
                <div className="text-center py-3 rounded-xl peer-checked:bg-white peer-checked:shadow-md text-[10px] font-black text-slate-400 peer-checked:text-indigo-600 uppercase tracking-widest transition-all">
                  Saída
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="type" value={TransactionType.ENTRY} defaultChecked={activeTab === 'entries'} className="hidden peer" />
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
            <input name="description" required placeholder="Ex: Aluguel, Supermercado..." className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor (R$)</label>
              <input name="amount" type="number" step="0.01" required placeholder="0,00" className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-lg" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data</label>
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
            <select name="category" className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none bg-white font-bold">
              {[...CATEGORIES.ENTRY, ...CATEGORIES.EXPENSE].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Opção Fixa - Apenas mostra se NÃO estiver na aba fixa (pois na aba fixa é automático) e for Despesa */}
          {activeTab !== 'fixed' && (
             <div className="flex items-center gap-4 py-4 px-4 bg-slate-50 rounded-2xl">
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isFixed" value="true" id="isFixed" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <label htmlFor="isFixed" className="text-sm font-bold text-slate-600 select-none">Este é um gasto fixo?</label>
            </div>
          )}

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
            {activeTab === 'fixed' ? 'Salvar Conta Fixa' : 'Salvar Lançamento'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
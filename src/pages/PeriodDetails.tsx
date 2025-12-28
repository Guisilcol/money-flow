import React, { useState, useMemo } from 'react';
import { AccountingPeriod, Transaction, TransactionType, PeriodSummary } from '../types';
import { Icons } from '../constants';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';
import { TabNavigation } from '../components/TabNavigation';
import { PageHeader } from '../components/PageHeader';
import { CategoryChart } from '../components/CategoryChart';
import { FinancialHealthCard } from '../components/FinancialHealthCard';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionForm } from '../components/TransactionForm';

interface PeriodDetailsProps {
  period: AccountingPeriod;
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdatePeriod: (period: AccountingPeriod) => void;
}

type TabId = 'overview' | 'fixed' | 'variable' | 'entries';

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'entries', label: 'Minhas Entradas' },
  { id: 'fixed', label: 'Gastos Fixos' },
  { id: 'variable', label: 'Gastos Variáveis' }
];

export const PeriodDetails: React.FC<PeriodDetailsProps> = ({
  period,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onUpdatePeriod
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  // --- Derived State ---
  const summary = useMemo((): PeriodSummary => {
    const entries = transactions.filter(t => t.type === TransactionType.ENTRY);
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

    const totalEntries = entries.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const fixedExpenses = expenses.filter(t => t.isFixed).reduce((acc, curr) => acc + curr.amount, 0);
    const variableExpenses = expenses.filter(t => !t.isFixed).reduce((acc, curr) => acc + curr.amount, 0);

    // Novos cálculos
    const investmentAmount = totalEntries * ((period.investmentPercentage || 0) / 100);
    const projectedVariableBalance = totalEntries - investmentAmount - fixedExpenses;
    const currentVariableBalance = projectedVariableBalance - variableExpenses;

    return {
      totalEntries,
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      balance: totalEntries - totalExpenses,
      investmentAmount,
      projectedVariableBalance,
      currentVariableBalance
    };
  }, [transactions, period.investmentPercentage]);

  const filteredTransactions = transactions
    .filter(t => {
      if (activeTab === 'entries') return t.type === TransactionType.ENTRY;
      if (activeTab === 'fixed') return t.type === TransactionType.EXPENSE && t.isFixed;
      return t.type === TransactionType.EXPENSE && !t.isFixed;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const chartData = transactions.reduce((acc: { name: string; value: number; type: TransactionType }[], curr) => {
    const found = acc.find(a => a.name === curr.category);
    if (found) found.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount, type: curr.type });
    return acc;
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    onAddTransaction(transaction);
    setIsAddingTransaction(false);
  };

  const getButtonLabel = () => {
    if (activeTab === 'fixed') return 'Lançar Conta Fixa';
    if (activeTab === 'entries') return 'Lançar Entrada';
    return 'Adicionar Lançamento';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <PageHeader
        label="Período Selecionado"
        title={period.name}
        dateRange={`${period.startDate.split('-').reverse().join('/')} até ${period.endDate.split('-').reverse().join('/')}`}
        icon={Icons.Calendar}
        actions={
          <button
            onClick={() => setIsAddingTransaction(true)}
            className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-[1.25rem] font-bold flex items-center gap-2 shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Icons.Plus /> {getButtonLabel()}
          </button>
        }
      />

      {/* Investment Percentage Input */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-bold text-slate-600 whitespace-nowrap">
            Porcentagem de Investimento:
          </label>
          <div className="flex items-center gap-4 flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={period.investmentPercentage || 0}
              onChange={(e) => onUpdatePeriod({ ...period, investmentPercentage: Number(e.target.value) })}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={period.investmentPercentage || 0}
                onChange={(e) => onUpdatePeriod({ ...period, investmentPercentage: Math.min(100, Math.max(0, Number(e.target.value))) })}
                className="w-20 px-3 py-2 text-center font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-bold text-slate-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Entradas"
          amount={summary.totalEntries}
          icon={Icons.TrendingUp}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Investimento"
          amount={summary.investmentAmount}
          icon={Icons.TrendingUp}
          colorClass="bg-indigo-50 text-indigo-600"
          subText={`${period.investmentPercentage || 0}% das entradas`}
        />
        <StatCard
          title="Total Gastos Fixos"
          amount={summary.fixedExpenses}
          icon={Icons.Calendar}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title="Saldo Projetado (Gasto Variável)"
          amount={summary.projectedVariableBalance}
          icon={Icons.TrendingUp}
          colorClass="bg-sky-50 text-sky-600"
          subText="Entradas - Investimento - Fixos"
        />
        <StatCard
          title="Saldo Atual (Gasto Variável)"
          amount={summary.currentVariableBalance}
          icon={Icons.TrendingDown}
          colorClass={summary.currentVariableBalance >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
          subText="Projetado - Gastos Variáveis"
        />
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
        />

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <CategoryChart data={chartData} />
              <div className="space-y-6">
                <FinancialHealthCard summary={summary} />
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <TransactionTable
              transactions={filteredTransactions}
              onDeleteTransaction={onDeleteTransaction}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddingTransaction}
        onClose={() => setIsAddingTransaction(false)}
        title={activeTab === 'fixed' ? 'Nova Conta Fixa' : "Novo Lançamento"}
      >
        <TransactionForm
          periodId={period.id}
          activeTab={activeTab}
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddingTransaction(false)}
        />
      </Modal>
    </div>
  );
};
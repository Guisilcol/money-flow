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
  onDeleteTransaction
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

    return {
      totalEntries,
      totalExpenses,
      fixedExpenses,
      variableExpenses,
      balance: totalEntries - totalExpenses
    };
  }, [transactions]);

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
    return 'Lançar Gasto';
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
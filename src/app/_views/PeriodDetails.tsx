import React, { useMemo } from 'react';
import {
  AccountingPeriod,
  Transaction,
  PeriodSummary,
  FixedExpense,
  Entry,
} from '../_lib/types';
import { Icons } from '../_lib/constants';
import { HeroSummary } from '../_components/HeroSummary';
import { MiniStatCard } from '../_components/MiniStatCard';
import { SettingsAccordion } from '../_components/SettingsAccordion';
import { UnifiedTransactionTable } from '../_components/UnifiedTransactionTable';
import { calculateDailyBudget, getRemainingDays } from '../_lib/dailySpending';

interface PeriodDetailsProps {
  period: AccountingPeriod;
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onUpdatePeriod: (period: AccountingPeriod) => void;
  onAddFixedExpense: (expense: FixedExpense) => void;
  onDeleteFixedExpense: (expenseId: string) => void;
  onUpdateFixedExpense: (expense: FixedExpense) => void;
  onAddEntry: (entry: Entry) => void;
  onDeleteEntry: (entryId: string) => void;
  onUpdateEntry: (entry: Entry) => void;
}

export const PeriodDetails: React.FC<PeriodDetailsProps> = ({
  period,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  onUpdatePeriod,
  onAddFixedExpense,
  onDeleteFixedExpense,
  onUpdateFixedExpense,
  onAddEntry,
  onDeleteEntry,
  onUpdateEntry
}) => {
  // --- Derived State ---
  const summary = useMemo((): PeriodSummary => {
    // Entradas e gastos fixos agora vêm do período, não das transações
    const totalEntries = (period.entries || []).reduce((acc, curr) => acc + curr.amount, 0);
    const fixedExpenses = (period.fixedExpenses || []).reduce((acc, curr) => acc + curr.amount, 0);

    // Transações agora são apenas gastos variáveis
    const variableExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = variableExpenses + fixedExpenses;

    // Cálculos
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
  }, [transactions, period.investmentPercentage, period.fixedExpenses, period.entries]);

  const handleInvestmentChange = (value: number) => {
    onUpdatePeriod({ ...period, investmentPercentage: value });
  };

  const dateRange = `${period.startDate.split('-').reverse().join('/')} até ${period.endDate.split('-').reverse().join('/')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section - Saldo em Destaque */}
      <HeroSummary
        summary={summary}
        periodName={period.name}
        dateRange={dateRange}
      />

      {/* Compact Dashboard - 4 Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard
          title="Entradas"
          amount={summary.totalEntries}
          subtitle={`${period.investmentPercentage || 0}% p/ investimento`}
          colorClass="bg-emerald-50 text-emerald-700"
          icon={Icons.TrendingUp}
          isPositive={true}
        />
        <MiniStatCard
          title="Gastos Fixos"
          amount={summary.fixedExpenses}
          colorClass="bg-amber-50 text-amber-700"
          icon={Icons.Calendar}
        />
        <MiniStatCard
          title="Gastos Variáveis"
          amount={summary.variableExpenses}
          colorClass="bg-rose-50 text-rose-700"
          icon={Icons.TrendingDown}
        />
        <MiniStatCard
          title="Gasto Diário recomendado"
          amount={calculateDailyBudget(summary.currentVariableBalance, period.endDate, transactions)}
          subtitle={`${getRemainingDays(period.endDate, transactions)} dias restantes`}
          colorClass="bg-indigo-50 text-indigo-700"
          icon={Icons.Calendar}
        />
      </div>

      {/* Settings Accordion */}
      <SettingsAccordion
        investmentPercentage={period.investmentPercentage || 0}
        onChangeInvestmentPercentage={handleInvestmentChange}
      />

      {/* Unified Transaction Table */}
      <UnifiedTransactionTable
        periodId={period.id}
        transactions={transactions}
        entries={period.entries || []}
        fixedExpenses={period.fixedExpenses || []}
        onAddTransaction={onAddTransaction}
        onDeleteTransaction={onDeleteTransaction}
        onUpdateTransaction={onUpdateTransaction}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
        onUpdateEntry={onUpdateEntry}
        onAddFixedExpense={onAddFixedExpense}
        onDeleteFixedExpense={onDeleteFixedExpense}
        onUpdateFixedExpense={onUpdateFixedExpense}
      />
    </div>
  );
};
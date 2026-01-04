"use client";

import { useParams } from 'next/navigation';
import { Icons } from '../../_lib/constants';
import { usePeriod } from '../../_lib/hooks/usePeriod';
import { usePeriodSummary } from '../../_lib/hooks/usePeriodSummary';
import { HeroSummary } from '../../_components/HeroSummary';
import { MiniStatCard } from '../../_components/MiniStatCard';
import { SettingsAccordion } from '../../_components/SettingsAccordion';
import { UnifiedTransactionTable } from '../../_components/UnifiedTransactionTable';
import { calculateDailyBudget, getRemainingDays } from '../../_lib/dailySpending';

// ============ Error Components ============

function ErrorNoId() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 lg:p-14">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-6">
                    <Icons.AlertCircle />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">ID não informado</h2>
                <p className="text-slate-500">
                    Não foi possível renderizar esta página. O ID do período não foi informado.
                </p>
            </div>
        </div>
    );
}

function ErrorNotFound() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 lg:p-14">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-6">
                    <Icons.AlertCircle />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Período não encontrado</h2>
                <p className="text-slate-500">
                    O ID informado não corresponde a nenhum período existente. Selecione um período no menu lateral.
                </p>
            </div>
        </div>
    );
}

function Loading() {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 lg:p-14">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Carregando...</p>
            </div>
        </div>
    );
}

// ============ Main Component ============

export default function PeriodPage() {
    const params = useParams();
    const periodId = params?.id as string | undefined;

    const {
        period,
        transactions,
        error,
        isLoading,
        updateInvestmentPercentage,
        addEntry,
        updateEntry,
        deleteEntry,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    } = usePeriod(periodId);

    const summary = usePeriodSummary(period, transactions);

    // Error States
    if (error === 'no-id') return <ErrorNoId />;
    if (error === 'not-found') return <ErrorNotFound />;
    if (isLoading || !period || !summary) return <Loading />;

    // Derived values
    const dateRange = `${period.startDate.split('-').reverse().join('/')} até ${period.endDate.split('-').reverse().join('/')}`;

    return (
        <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
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
                    onChangeInvestmentPercentage={updateInvestmentPercentage}
                />

                {/* Unified Transaction Table */}
                <UnifiedTransactionTable
                    periodId={period.id}
                    transactions={transactions}
                    entries={period.entries || []}
                    fixedExpenses={period.fixedExpenses || []}
                    onAddTransaction={addTransaction}
                    onDeleteTransaction={deleteTransaction}
                    onUpdateTransaction={updateTransaction}
                    onAddEntry={addEntry}
                    onDeleteEntry={deleteEntry}
                    onUpdateEntry={updateEntry}
                    onAddFixedExpense={addFixedExpense}
                    onDeleteFixedExpense={deleteFixedExpense}
                    onUpdateFixedExpense={updateFixedExpense}
                />
            </div>
        </main>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AccountingPeriod, Transaction } from '../../_lib/types';
import { loadPeriodById, loadTransactions, saveTransactions, loadPeriods, savePeriods } from '../../_lib/repositories';
import { Icons } from '../../_lib/constants';
import { HeroSummary } from '../../_components/HeroSummary';
import { MiniStatCard } from '../../_components/MiniStatCard';
import { SettingsAccordion } from '../../_components/SettingsAccordion';
import { UnifiedTransactionTable } from '../../_components/UnifiedTransactionTable';
import { calculateDailyBudget, getRemainingDays } from '../../_lib/dailySpending';
import { PeriodSummary, FixedExpense, Entry } from '../../_lib/types';

// Error states
type ErrorState = 'none' | 'no-id' | 'not-found';

export default function PeriodPage() {
    const params = useParams();
    const id = params?.id as string | undefined;

    const [period, setPeriod] = useState<AccountingPeriod | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allPeriods, setAllPeriods] = useState<AccountingPeriod[]>([]);
    const [error, setError] = useState<ErrorState>('none');
    const [isLoading, setIsLoading] = useState(true);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                setError('no-id');
                setIsLoading(false);
                return;
            }

            const [foundPeriod, allTrans, periods] = await Promise.all([
                loadPeriodById(id),
                loadTransactions(),
                loadPeriods()
            ]);

            if (!foundPeriod) {
                setError('not-found');
                setIsLoading(false);
                return;
            }

            setPeriod(foundPeriod);
            setTransactions(allTrans.filter(t => t.periodId === id));
            setAllPeriods(periods);
            setIsLoading(false);
        };

        loadData();
    }, [id]);

    // Persist transactions when they change
    useEffect(() => {
        if (!isLoading && period) {
            loadTransactions().then(allTrans => {
                const otherTrans = allTrans.filter(t => t.periodId !== id);
                saveTransactions([...otherTrans, ...transactions]);
            });
        }
    }, [transactions, isLoading, period, id]);

    // Persist periods when the current period changes
    useEffect(() => {
        if (!isLoading && period) {
            const updatedPeriods = allPeriods.map(p => p.id === period.id ? period : p);
            savePeriods(updatedPeriods);
        }
    }, [period, isLoading, allPeriods]);

    // --- Handlers ---
    const handleUpdatePeriod = (updatedPeriod: AccountingPeriod) => {
        setPeriod(updatedPeriod);
        setAllPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
    };

    const handleAddTransaction = (transaction: Transaction) => {
        setTransactions(prev => [...prev, transaction]);
    };

    const handleDeleteTransaction = (transactionId: string) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const handleAddFixedExpense = (expense: FixedExpense) => {
        if (!period) return;
        handleUpdatePeriod({
            ...period,
            fixedExpenses: [...(period.fixedExpenses || []), expense]
        });
    };

    const handleDeleteFixedExpense = (expenseId: string) => {
        if (!period) return;
        handleUpdatePeriod({
            ...period,
            fixedExpenses: (period.fixedExpenses || []).filter(e => e.id !== expenseId)
        });
    };

    const handleUpdateFixedExpense = (updatedExpense: FixedExpense) => {
        if (!period) return;
        handleUpdatePeriod({
            ...period,
            fixedExpenses: (period.fixedExpenses || []).map(e =>
                e.id === updatedExpense.id ? updatedExpense : e
            )
        });
    };

    const handleAddEntry = (entry: Entry) => {
        if (!period) return;
        handleUpdatePeriod({
            ...period,
            entries: [...(period.entries || []), entry]
        });
    };

    const handleDeleteEntry = (entryId: string) => {
        if (!period) return;
        handleUpdatePeriod({
            ...period,
            entries: (period.entries || []).filter(e => e.id !== entryId)
        });
    };

    const handleUpdateEntry = (updatedEntry: Entry) => {
        if (!period) return;
        handleUpdatePeriod({
            ...period,
            entries: (period.entries || []).map(e =>
                e.id === updatedEntry.id ? updatedEntry : e
            )
        });
    };

    // --- Error States ---
    if (error === 'no-id') {
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

    if (error === 'not-found') {
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

    if (isLoading || !period) {
        return (
            <div className="flex-1 flex items-center justify-center p-4 md:p-10 lg:p-14">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Carregando...</p>
                </div>
            </div>
        );
    }

    // --- Derived State ---
    const summary: PeriodSummary = (() => {
        const totalEntries = (period.entries || []).reduce((acc, curr) => acc + curr.amount, 0);
        const fixedExpenses = (period.fixedExpenses || []).reduce((acc, curr) => acc + curr.amount, 0);
        const variableExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpenses = variableExpenses + fixedExpenses;
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
    })();

    const handleInvestmentChange = (value: number) => {
        handleUpdatePeriod({ ...period, investmentPercentage: value });
    };

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
                    onChangeInvestmentPercentage={handleInvestmentChange}
                />

                {/* Unified Transaction Table */}
                <UnifiedTransactionTable
                    periodId={period.id}
                    transactions={transactions}
                    entries={period.entries || []}
                    fixedExpenses={period.fixedExpenses || []}
                    onAddTransaction={handleAddTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onUpdateTransaction={handleUpdateTransaction}
                    onAddEntry={handleAddEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onAddFixedExpense={handleAddFixedExpense}
                    onDeleteFixedExpense={handleDeleteFixedExpense}
                    onUpdateFixedExpense={handleUpdateFixedExpense}
                />
            </div>
        </main>
    );
}

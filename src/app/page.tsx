"use client";

import React, { useEffect } from 'react';
import { AccountingPeriod } from './_lib/types';
import { Sidebar } from './_components/Sidebar';
import { PeriodDetails } from './_views/PeriodDetails';
import { WelcomePage } from './_views/WelcomePage';
import { usePeriods } from './_hooks/usePeriods';
import { useTransactions } from './_hooks/useTransactions';
import { useTemplate } from './_hooks/useTemplate';
import { useDataPersistence } from './_hooks/useDataPersistence';

export default function Home() {
    // Hooks customizados
    const periodsHook = usePeriods();
    const transactionsHook = useTransactions(periodsHook.selectedPeriodId);
    const templateHook = useTemplate();

    // Persistência de dados
    const { isInitialized, handleExportData, handleImportData } = useDataPersistence({
        periods: periodsHook,
        transactions: transactionsHook,
        template: templateHook,
    });

    // Configurar callback para deletar transações quando um período é deletado
    useEffect(() => {
        periodsHook.setDeleteTransactionsCallback(() => (periodId: string) => {
            transactionsHook.setTransactions(prev => prev.filter(t => t.periodId !== periodId));
        });
    }, [transactionsHook.setTransactions]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handler de criação usa template
    const handleCreatePeriod = (period: AccountingPeriod) => {
        periodsHook.handleCreatePeriod(period, templateHook.template);
    };

    if (!isInitialized) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
            {/* Sidebar - Periods */}
            <Sidebar
                periods={periodsHook.periods}
                selectedPeriodId={periodsHook.selectedPeriodId}
                onSelectPeriod={periodsHook.handleSelectPeriod}
                onCreatePeriod={handleCreatePeriod}
                onDeletePeriod={periodsHook.deletePeriod}
                onRenamePeriod={periodsHook.handleRenamePeriod}
                onExportData={handleExportData}
                onImportData={handleImportData}
            />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
                {!periodsHook.selectedPeriod ? (
                    <WelcomePage />
                ) : (
                    <PeriodDetails
                        period={periodsHook.selectedPeriod}
                        transactions={transactionsHook.periodTransactions}
                        onAddTransaction={transactionsHook.handleAddTransaction}
                        onDeleteTransaction={transactionsHook.deleteTransaction}
                        onUpdateTransaction={transactionsHook.handleUpdateTransaction}
                        onUpdatePeriod={periodsHook.handleUpdatePeriod}
                        onAddFixedExpense={periodsHook.handleAddFixedExpense}
                        onDeleteFixedExpense={periodsHook.handleDeleteFixedExpense}
                        onUpdateFixedExpense={periodsHook.handleUpdateFixedExpense}
                        onAddEntry={periodsHook.handleAddEntry}
                        onDeleteEntry={periodsHook.handleDeleteEntry}
                        onUpdateEntry={periodsHook.handleUpdateEntry}
                    />
                )}
            </main>
        </div>
    );
}

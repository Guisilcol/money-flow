"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Icons } from '../../_lib/constants';
import { usePeriod } from '../../_lib/hooks/usePeriod';
import { usePeriodSummary } from '../../_lib/hooks/usePeriodSummary';
import { usePeriodsContext } from '../../_contexts/PeriodsContext';
import { HeroSummary } from '../../_components/HeroSummary';
import { MiniStatCard } from '../../_components/MiniStatCard';
import { Modal } from '../../_components/Modal';
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
        updatePeriod,
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

    const { refreshPeriods } = usePeriodsContext();
    const summary = usePeriodSummary(period, transactions);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStartDate, setEditingStartDate] = useState('');
    const [editingEndDate, setEditingEndDate] = useState('');

    const openEditModal = () => {
        if (period) {
            setEditingStartDate(period.startDate);
            setEditingEndDate(period.endDate);
            setIsEditModalOpen(true);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingStartDate('');
        setEditingEndDate('');
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (period && editingStartDate && editingEndDate) {
            const newName = `${editingStartDate} - ${editingEndDate}`;
            updatePeriod({
                ...period,
                name: newName,
                startDate: editingStartDate,
                endDate: editingEndDate,
            });
            // Small delay to ensure IndexedDB save completes before refreshing sidebar
            await new Promise(resolve => setTimeout(resolve, 100));
            await refreshPeriods();
        }
        closeEditModal();
    };

    // Error States
    if (error === 'no-id') return <ErrorNoId />;
    if (error === 'not-found') return <ErrorNotFound />;
    if (isLoading || !period || !summary) return <Loading />;

    // Derived values
    const dateRange = `${period.startDate.split('-').reverse().join('/')} até ${period.endDate.split('-').reverse().join('/')}`;

    return (
        <>
            <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Hero Section - Saldo em Destaque */}
                    <HeroSummary
                        summary={summary}
                        periodName={period.name}
                        dateRange={dateRange}
                        onEditClick={openEditModal}
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

            {/* Edit Period Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                title="Editar Período"
            >
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Início</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    required
                                    value={editingStartDate}
                                    onChange={(e) => setEditingStartDate(e.target.value)}
                                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                    className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                                    <Icons.Calendar />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fim</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    required
                                    value={editingEndDate}
                                    onChange={(e) => setEditingEndDate(e.target.value)}
                                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                    className="w-full p-4 bg-slate-50 border-slate-200 border-2 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold cursor-pointer"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                                    <Icons.Calendar />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                        Salvar Alterações
                    </button>
                </form>
            </Modal>
        </>
    );
}

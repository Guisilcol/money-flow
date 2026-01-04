"use client";

import { useCallback, useEffect, useState } from 'react';
import { AccountingPeriod, Transaction, Entry, FixedExpense } from '../types';
import {
    loadPeriodById,
    loadTransactions,
    saveTransactions,
    loadPeriods,
    savePeriods,
} from '../repositories';

type ErrorState = 'none' | 'no-id' | 'not-found';

interface UsePeriodReturn {
    // Estado
    period: AccountingPeriod | null;
    transactions: Transaction[];
    error: ErrorState;
    isLoading: boolean;

    // Handlers para Period
    updatePeriod: (updatedPeriod: AccountingPeriod) => void;
    updateInvestmentPercentage: (value: number) => void;

    // Handlers para Entries
    addEntry: (entry: Entry) => void;
    updateEntry: (updatedEntry: Entry) => void;
    deleteEntry: (entryId: string) => void;

    // Handlers para Fixed Expenses
    addFixedExpense: (expense: FixedExpense) => void;
    updateFixedExpense: (updatedExpense: FixedExpense) => void;
    deleteFixedExpense: (expenseId: string) => void;

    // Handlers para Transactions
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (updatedTransaction: Transaction) => void;
    deleteTransaction: (transactionId: string) => void;
}

/**
 * Custom hook que encapsula toda a lógica de gerenciamento de um período contábil.
 *
 * Este hook elimina múltiplos useEffect no componente, centralizando:
 * - Carregamento de dados
 * - Persistência imediata nos handlers (não via useEffect de sincronização)
 * - CRUD de entries, fixedExpenses e transactions
 */
export function usePeriod(periodId: string | undefined): UsePeriodReturn {
    const [period, setPeriod] = useState<AccountingPeriod | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allPeriods, setAllPeriods] = useState<AccountingPeriod[]>([]);
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<ErrorState>('none');
    const [isLoading, setIsLoading] = useState(true);

    // Único useEffect: carregamento inicial
    useEffect(() => {
        const loadData = async () => {
            if (!periodId) {
                setError('no-id');
                setIsLoading(false);
                return;
            }

            const [foundPeriod, allTrans, periods] = await Promise.all([
                loadPeriodById(periodId),
                loadTransactions(),
                loadPeriods(),
            ]);

            if (!foundPeriod) {
                setError('not-found');
                setIsLoading(false);
                return;
            }

            setPeriod(foundPeriod);
            setAllTransactions(allTrans);
            setTransactions(allTrans.filter((t) => t.periodId === periodId));
            setAllPeriods(periods);
            setIsLoading(false);
        };

        loadData();
    }, [periodId]);

    // ============ Helpers de Persistência ============

    /**
     * Atualiza o período no estado e persiste imediatamente.
     */
    const updatePeriodAndPersist = useCallback(
        (updater: (prev: AccountingPeriod) => AccountingPeriod) => {
            setPeriod((prev) => {
                if (!prev) return prev;
                const next = updater(prev);

                // Persistir imediatamente
                setAllPeriods((currentPeriods) => {
                    const updated = currentPeriods.map((p) =>
                        p.id === next.id ? next : p
                    );
                    savePeriods(updated);
                    return updated;
                });

                return next;
            });
        },
        []
    );

    /**
     * Atualiza transactions e persiste imediatamente.
     */
    const updateTransactionsAndPersist = useCallback(
        (updater: (prev: Transaction[]) => Transaction[]) => {
            setTransactions((prev) => {
                const next = updater(prev);

                // Combinar com transações de outros períodos e persistir
                setAllTransactions((currentAll) => {
                    const otherTrans = currentAll.filter(
                        (t) => t.periodId !== periodId
                    );
                    const updated = [...otherTrans, ...next];
                    saveTransactions(updated);
                    return updated;
                });

                return next;
            });
        },
        [periodId]
    );

    // ============ Handlers para Period ============

    const updatePeriod = useCallback(
        (updatedPeriod: AccountingPeriod) => {
            updatePeriodAndPersist(() => updatedPeriod);
        },
        [updatePeriodAndPersist]
    );

    const updateInvestmentPercentage = useCallback(
        (value: number) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                investmentPercentage: value,
            }));
        },
        [updatePeriodAndPersist]
    );

    // ============ Handlers para Entries ============

    const addEntry = useCallback(
        (entry: Entry) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                entries: [...(prev.entries || []), entry],
            }));
        },
        [updatePeriodAndPersist]
    );

    const updateEntry = useCallback(
        (updatedEntry: Entry) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                entries: (prev.entries || []).map((e) =>
                    e.id === updatedEntry.id ? updatedEntry : e
                ),
            }));
        },
        [updatePeriodAndPersist]
    );

    const deleteEntry = useCallback(
        (entryId: string) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                entries: (prev.entries || []).filter((e) => e.id !== entryId),
            }));
        },
        [updatePeriodAndPersist]
    );

    // ============ Handlers para Fixed Expenses ============

    const addFixedExpense = useCallback(
        (expense: FixedExpense) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                fixedExpenses: [...(prev.fixedExpenses || []), expense],
            }));
        },
        [updatePeriodAndPersist]
    );

    const updateFixedExpense = useCallback(
        (updatedExpense: FixedExpense) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                fixedExpenses: (prev.fixedExpenses || []).map((e) =>
                    e.id === updatedExpense.id ? updatedExpense : e
                ),
            }));
        },
        [updatePeriodAndPersist]
    );

    const deleteFixedExpense = useCallback(
        (expenseId: string) => {
            updatePeriodAndPersist((prev) => ({
                ...prev,
                fixedExpenses: (prev.fixedExpenses || []).filter(
                    (e) => e.id !== expenseId
                ),
            }));
        },
        [updatePeriodAndPersist]
    );

    // ============ Handlers para Transactions ============

    const addTransaction = useCallback(
        (transaction: Transaction) => {
            updateTransactionsAndPersist((prev) => [...prev, transaction]);
        },
        [updateTransactionsAndPersist]
    );

    const updateTransaction = useCallback(
        (updatedTransaction: Transaction) => {
            updateTransactionsAndPersist((prev) =>
                prev.map((t) =>
                    t.id === updatedTransaction.id ? updatedTransaction : t
                )
            );
        },
        [updateTransactionsAndPersist]
    );

    const deleteTransaction = useCallback(
        (transactionId: string) => {
            updateTransactionsAndPersist((prev) =>
                prev.filter((t) => t.id !== transactionId)
            );
        },
        [updateTransactionsAndPersist]
    );

    return {
        // Estado
        period,
        transactions,
        error,
        isLoading,

        // Handlers para Period
        updatePeriod,
        updateInvestmentPercentage,

        // Handlers para Entries
        addEntry,
        updateEntry,
        deleteEntry,

        // Handlers para Fixed Expenses
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,

        // Handlers para Transactions
        addTransaction,
        updateTransaction,
        deleteTransaction,
    };
}

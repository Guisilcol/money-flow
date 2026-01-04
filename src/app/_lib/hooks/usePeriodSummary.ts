"use client";

import { useMemo } from 'react';
import { AccountingPeriod, Transaction, PeriodSummary } from '../types';

/**
 * Custom hook que calcula o resumo financeiro de um período.
 *
 * Utiliza useMemo para evitar recálculos desnecessários,
 * só recalculando quando period ou transactions mudam.
 */
export function usePeriodSummary(
    period: AccountingPeriod | null,
    transactions: Transaction[]
): PeriodSummary | null {
    return useMemo(() => {
        if (!period) return null;

        const totalEntries = (period.entries || []).reduce(
            (acc, curr) => acc + curr.amount,
            0
        );

        const fixedExpenses = (period.fixedExpenses || []).reduce(
            (acc, curr) => acc + curr.amount,
            0
        );

        const variableExpenses = transactions.reduce(
            (acc, curr) => acc + curr.amount,
            0
        );

        const totalExpenses = variableExpenses + fixedExpenses;

        const investmentAmount =
            totalEntries * ((period.investmentPercentage || 0) / 100);

        const projectedVariableBalance =
            totalEntries - investmentAmount - fixedExpenses;

        const currentVariableBalance =
            projectedVariableBalance - variableExpenses;

        return {
            totalEntries,
            totalExpenses,
            fixedExpenses,
            variableExpenses,
            balance: totalEntries - totalExpenses,
            investmentAmount,
            projectedVariableBalance,
            currentVariableBalance,
        };
    }, [period, transactions]);
}

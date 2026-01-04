"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AccountingPeriod, Template } from '../_lib/types';
import {
    loadPeriods,
    loadTransactions,
    loadTemplate,
    savePeriods,
    saveTransactions,
    exportAllData,
    importAllData,
} from '../_lib/repositories';
import { applyTemplateToNewPeriod } from '../_lib/services/periodService';
import { downloadDataAsJson, parseImportFile } from '../_lib/services/dataService';

interface PeriodsContextValue {
    // Estado
    periods: AccountingPeriod[];
    template: Template;
    selectedPeriodId: string | null;
    isInitialized: boolean;

    // Operações
    createPeriod: (period: AccountingPeriod) => void;
    deletePeriod: (id: string) => Promise<void>;
    updatePeriodDates: (id: string, startDate: string, endDate: string) => Promise<void>;
    exportData: () => Promise<void>;
    importData: (file: File) => Promise<void>;
    refreshPeriods: () => Promise<void>;
}

const PeriodsContext = createContext<PeriodsContextValue | null>(null);

export function usePeriodsContext(): PeriodsContextValue {
    const context = useContext(PeriodsContext);
    if (!context) {
        throw new Error('usePeriodsContext must be used within a PeriodsProvider');
    }
    return context;
}

interface PeriodsProviderProps {
    children: React.ReactNode;
}

export function PeriodsProvider({ children }: PeriodsProviderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
    const [template, setTemplate] = useState<Template>({ entries: [], fixedExpenses: [] });
    const [isInitialized, setIsInitialized] = useState(false);

    // Extrai o ID do período selecionado da URL
    const selectedPeriodId = useMemo(() => {
        if (pathname?.startsWith('/period/')) {
            return pathname.split('/period/')[1]?.split('/')[0] || null;
        }
        return null;
    }, [pathname]);

    // Carrega dados iniciais
    useEffect(() => {
        const loadData = async () => {
            const [savedPeriods, savedTemplate] = await Promise.all([
                loadPeriods(),
                loadTemplate()
            ]);
            setPeriods(savedPeriods);
            setTemplate(savedTemplate);
            setIsInitialized(true);
        };
        loadData();
    }, []);

    // Persiste períodos quando mudam
    useEffect(() => {
        if (!isInitialized) return;
        savePeriods(periods);
    }, [periods, isInitialized]);

    // Recarrega períodos do storage
    const refreshPeriods = useCallback(async () => {
        const [savedPeriods, savedTemplate] = await Promise.all([
            loadPeriods(),
            loadTemplate()
        ]);
        setPeriods(savedPeriods);
        setTemplate(savedTemplate);
    }, []);

    // Cria um novo período aplicando o template
    const createPeriod = useCallback((period: AccountingPeriod) => {
        const periodWithTemplate = applyTemplateToNewPeriod(period, template);
        setPeriods(prev => [periodWithTemplate, ...prev]);
        router.push(`/period/${periodWithTemplate.id}`);
    }, [template, router]);

    // Exclui um período e suas transações relacionadas
    const deletePeriod = useCallback(async (id: string) => {
        const confirmDelete = window.confirm(
            'Deseja excluir este período permanentemente? Todas as transações serão perdidas.'
        );

        if (!confirmDelete) return;

        // Remove o período
        const updatedPeriods = periods.filter(p => p.id !== id);
        setPeriods(updatedPeriods);

        // Remove transações relacionadas
        const allTransactions = await loadTransactions();
        const filteredTransactions = allTransactions.filter(t => t.periodId !== id);
        await saveTransactions(filteredTransactions);

        // Navega para outro período se o atual foi excluído
        if (selectedPeriodId === id) {
            if (updatedPeriods.length > 0) {
                router.push(`/period/${updatedPeriods[0].id}`);
            } else {
                router.push('/');
            }
        }
    }, [periods, selectedPeriodId, router]);

    // Atualiza as datas de um período
    const updatePeriodDates = useCallback(async (id: string, startDate: string, endDate: string) => {
        const newName = `${startDate} - ${endDate}`;
        const updatedPeriods = periods.map(p =>
            p.id === id ? { ...p, name: newName, startDate, endDate } : p
        );
        setPeriods(updatedPeriods);
        await savePeriods(updatedPeriods);

        // Recarrega os dados para sincronizar o estado
        await refreshPeriods();
    }, [periods, refreshPeriods]);

    // Exporta todos os dados
    const exportData = useCallback(async () => {
        try {
            const data = await exportAllData();
            downloadDataAsJson(data);
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            alert('Erro ao exportar dados. Tente novamente.');
        }
    }, []);

    // Importa dados de um arquivo
    const importData = useCallback(async (file: File) => {
        const confirmImport = window.confirm(
            'ATENÇÃO: Isso substituirá TODOS os dados existentes no sistema. Esta ação não pode ser desfeita. Deseja continuar?'
        );

        if (!confirmImport) return;

        try {
            const data = await parseImportFile(file);
            await importAllData(data);

            // Recarrega estado do storage
            await refreshPeriods();

            const savedPeriods = await loadPeriods();
            if (savedPeriods.length > 0) {
                router.push(`/period/${savedPeriods[0].id}`);
            } else {
                router.push('/');
            }

            alert('Dados importados com sucesso!');
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            alert('Erro ao importar dados. Verifique se o arquivo é válido.');
        }
    }, [router, refreshPeriods]);

    const value = useMemo<PeriodsContextValue>(() => ({
        periods,
        template,
        selectedPeriodId,
        isInitialized,
        createPeriod,
        deletePeriod,
        updatePeriodDates,
        exportData,
        importData,
        refreshPeriods,
    }), [
        periods,
        template,
        selectedPeriodId,
        isInitialized,
        createPeriod,
        deletePeriod,
        updatePeriodDates,
        exportData,
        importData,
        refreshPeriods,
    ]);

    return (
        <PeriodsContext.Provider value={value}>
            {children}
        </PeriodsContext.Provider>
    );
}

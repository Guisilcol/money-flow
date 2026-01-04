"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AccountingPeriod, Template } from '../_lib/types';
import { Sidebar } from './Sidebar';
import {
    loadPeriods,
    loadTransactions,
    loadTemplate,
    savePeriods,
    saveTransactions,
    saveTemplate,
    exportAllData,
    importAllData,
    DatabaseExport,
} from '../_lib/repositories';
import { generateId } from '../_lib/uuid';

interface AppLayoutProps {
    children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
    const [template, setTemplate] = useState<Template>({ entries: [], fixedExpenses: [] });
    const [isInitialized, setIsInitialized] = useState(false);

    // Extract selected period ID from URL
    const selectedPeriodId = pathname?.startsWith('/period/')
        ? pathname.split('/period/')[1]?.split('/')[0] || null
        : null;

    // Load initial data
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

    // Persist periods when they change
    useEffect(() => {
        if (!isInitialized) return;
        savePeriods(periods);
    }, [periods, isInitialized]);

    // Handlers
    const handleSelectPeriod = (id: string) => {
        router.push(`/period/${id}`);
    };

    const handleCreatePeriod = (period: AccountingPeriod) => {
        // Apply template to new period
        const templateEntries = template.entries.map(te => ({
            id: generateId(),
            periodId: period.id,
            name: te.name,
            amount: te.amount,
        }));

        const templateFixedExpenses = template.fixedExpenses.map(tfe => ({
            id: generateId(),
            periodId: period.id,
            name: tfe.name,
            amount: tfe.amount,
        }));

        const periodWithDefaults = {
            ...period,
            fixedExpenses: [...(period.fixedExpenses || []), ...templateFixedExpenses],
            entries: [...(period.entries || []), ...templateEntries]
        };

        setPeriods(prev => [periodWithDefaults, ...prev]);
        router.push(`/period/${periodWithDefaults.id}`);
    };

    const handleDeletePeriod = async (id: string) => {
        const confirmDelete = window.confirm('Deseja excluir este período permanentemente? Todas as transações serão perdidas.');

        if (confirmDelete) {
            // Delete period
            const updatedPeriods = periods.filter(p => p.id !== id);
            setPeriods(updatedPeriods);

            // Delete related transactions
            const allTransactions = await loadTransactions();
            const filteredTransactions = allTransactions.filter(t => t.periodId !== id);
            await saveTransactions(filteredTransactions);

            // Navigate away if we deleted the current period
            if (selectedPeriodId === id) {
                if (updatedPeriods.length > 0) {
                    router.push(`/period/${updatedPeriods[0].id}`);
                } else {
                    router.push('/');
                }
            }
        }
    };

    const handleRenamePeriod = (id: string, newName: string) => {
        setPeriods(prev => prev.map(p =>
            p.id === id ? { ...p, name: newName } : p
        ));
    };

    const handleExportData = useCallback(async () => {
        try {
            const data = await exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `moneyflow-backup-${data.exportedAt.split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            alert('Erro ao exportar dados. Tente novamente.');
        }
    }, []);

    const handleImportData = useCallback(async (file: File) => {
        const confirmImport = window.confirm(
            'ATENÇÃO: Isso substituirá TODOS os dados existentes no sistema. Esta ação não pode ser desfeita. Deseja continuar?'
        );

        if (!confirmImport) return;

        try {
            const text = await file.text();
            const data: DatabaseExport = JSON.parse(text);
            await importAllData(data);

            // Reload all state from storage
            const [savedPeriods, savedTemplate] = await Promise.all([
                loadPeriods(),
                loadTemplate()
            ]);

            setPeriods(savedPeriods);
            setTemplate(savedTemplate);

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
    }, [router]);

    if (!isInitialized) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
            <Sidebar
                periods={periods}
                selectedPeriodId={selectedPeriodId}
                onSelectPeriod={handleSelectPeriod}
                onCreatePeriod={handleCreatePeriod}
                onDeletePeriod={handleDeletePeriod}
                onRenamePeriod={handleRenamePeriod}
                onExportData={handleExportData}
                onImportData={handleImportData}
            />
            {children}
        </div>
    );
}

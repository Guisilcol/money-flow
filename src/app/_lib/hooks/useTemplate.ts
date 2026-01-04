"use client";

import { useCallback, useEffect, useState } from 'react';
import { Template, TemplateEntry, TemplateFixedExpense } from '../types';
import { loadTemplate, saveTemplate } from '../repositories';

/**
 * Estado inicial enquanto os dados estão sendo carregados do IndexedDB.
 */
const INITIAL_TEMPLATE: Template = { entries: [], fixedExpenses: [] };

/**
 * Custom hook que encapsula toda a lógica de gerenciamento do template.
 * 
 * Este hook elimina a necessidade de múltiplos useEffect no componente,
 * centralizando a lógica de carregamento e persistência dos dados.
 * A persistência é feita diretamente nos handlers de mutação, evitando
 * o anti-pattern de sincronizar estado com useEffect.
 */
export function useTemplate() {
    const [template, setTemplate] = useState<Template>(INITIAL_TEMPLATE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Carregamento inicial - único useEffect necessário
    useEffect(() => {
        loadTemplate().then((savedTemplate) => {
            setTemplate(savedTemplate);
            setIsLoaded(true);
        });
    }, []);

    /**
     * Função helper que atualiza o estado e persiste no IndexedDB.
     * Evita o padrão problemático de useEffect para sincronização.
     */
    const updateAndPersist = useCallback((updater: (prev: Template) => Template) => {
        setTemplate((prev) => {
            const next = updater(prev);
            saveTemplate(next); // Persistência imediata
            return next;
        });
    }, []);

    // ============ Handlers para Entradas ============

    const addEntry = useCallback((entry: TemplateEntry) => {
        updateAndPersist((prev) => ({
            ...prev,
            entries: [...prev.entries, entry],
        }));
    }, [updateAndPersist]);

    const updateEntry = useCallback((updatedEntry: TemplateEntry) => {
        updateAndPersist((prev) => ({
            ...prev,
            entries: prev.entries.map((e) =>
                e.id === updatedEntry.id ? updatedEntry : e
            ),
        }));
    }, [updateAndPersist]);

    const deleteEntry = useCallback((entryId: string) => {
        updateAndPersist((prev) => ({
            ...prev,
            entries: prev.entries.filter((e) => e.id !== entryId),
        }));
    }, [updateAndPersist]);

    // ============ Handlers para Gastos Fixos ============

    const addFixedExpense = useCallback((expense: TemplateFixedExpense) => {
        updateAndPersist((prev) => ({
            ...prev,
            fixedExpenses: [...prev.fixedExpenses, expense],
        }));
    }, [updateAndPersist]);

    const updateFixedExpense = useCallback((updatedExpense: TemplateFixedExpense) => {
        updateAndPersist((prev) => ({
            ...prev,
            fixedExpenses: prev.fixedExpenses.map((e) =>
                e.id === updatedExpense.id ? updatedExpense : e
            ),
        }));
    }, [updateAndPersist]);

    const deleteFixedExpense = useCallback((expenseId: string) => {
        updateAndPersist((prev) => ({
            ...prev,
            fixedExpenses: prev.fixedExpenses.filter((e) => e.id !== expenseId),
        }));
    }, [updateAndPersist]);

    return {
        // Estado
        template,
        isLoaded,

        // Handlers para Entradas
        addEntry,
        updateEntry,
        deleteEntry,

        // Handlers para Gastos Fixos
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
    };
}

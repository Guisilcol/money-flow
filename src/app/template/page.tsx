"use client";

import React, { useEffect, useState } from 'react';
import { Template, TemplateEntry, TemplateFixedExpense } from '../_lib/types';
import { Icons } from '../_lib/constants';
import { PageHeader } from '../_components/PageHeader';
import { ItemCard } from '../_components/ItemCard';
import { loadTemplate, saveTemplate } from '../_lib/repositories';

export default function TemplatePage() {
    const [template, setTemplate] = useState<Template>({ entries: [], fixedExpenses: [] });
    const [isLoaded, setIsLoaded] = useState(false);

    // Carregar template do IndexedDB
    useEffect(() => {
        const load = async () => {
            const savedTemplate = await loadTemplate();
            setTemplate(savedTemplate);
            setIsLoaded(true);
        };
        load();
    }, []);

    // Salvar template ao alterar
    useEffect(() => {
        if (!isLoaded) return;
        saveTemplate(template);
    }, [template, isLoaded]);

    // Handlers para entradas
    const handleAddEntry = (entry: TemplateEntry) => {
        setTemplate(prev => ({
            ...prev,
            entries: [...prev.entries, entry]
        }));
    };

    const handleUpdateEntry = (updatedEntry: TemplateEntry) => {
        setTemplate(prev => ({
            ...prev,
            entries: prev.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
        }));
    };

    const handleDeleteEntry = (entryId: string) => {
        setTemplate(prev => ({
            ...prev,
            entries: prev.entries.filter(e => e.id !== entryId)
        }));
    };

    // Handlers para gastos fixos
    const handleAddFixedExpense = (expense: TemplateFixedExpense) => {
        setTemplate(prev => ({
            ...prev,
            fixedExpenses: [...prev.fixedExpenses, expense]
        }));
    };

    const handleUpdateFixedExpense = (updatedExpense: TemplateFixedExpense) => {
        setTemplate(prev => ({
            ...prev,
            fixedExpenses: prev.fixedExpenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
        }));
    };

    const handleDeleteFixedExpense = (expenseId: string) => {
        setTemplate(prev => ({
            ...prev,
            fixedExpenses: prev.fixedExpenses.filter(e => e.id !== expenseId)
        }));
    };

    if (!isLoaded) return null;

    return (
        <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <PageHeader
                    label="Configuração"
                    title="Template Padrão"
                    dateRange="Valores padrão para novos períodos"
                    icon={Icons.Settings}
                    actions={null}
                />

                {/* Info Card */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Icons.Info />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900 mb-1">Como funciona</h4>
                            <p className="text-sm text-indigo-700">
                                Os itens cadastrados aqui serão automaticamente adicionados a cada novo período contábil criado.
                                Você pode adicionar, editar ou remover entradas e gastos fixos a qualquer momento.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Template Entries */}
                <ItemCard
                    items={template.entries}
                    onAdd={handleAddEntry}
                    onUpdate={handleUpdateEntry}
                    onDelete={handleDeleteEntry}
                    title="Entradas Padrão"
                    subtitle="Receitas automáticas para novos períodos"
                    themeColor="emerald"
                    icon={Icons.TrendingUp}
                    addButtonText="Adicionar Entrada"
                    inputPlaceholder="Nome da entrada (ex: Salário)"
                    emptyMessage="Nenhuma entrada padrão cadastrada"
                    isIncome={true}
                />

                {/* Template Fixed Expenses */}
                <ItemCard
                    items={template.fixedExpenses}
                    onAdd={handleAddFixedExpense}
                    onUpdate={handleUpdateFixedExpense}
                    onDelete={handleDeleteFixedExpense}
                    title="Gastos Fixos Padrão"
                    subtitle="Despesas automáticas para novos períodos"
                    themeColor="amber"
                    icon={Icons.Calendar}
                    addButtonText="Adicionar Gasto Fixo"
                    inputPlaceholder="Nome do gasto (ex: Aluguel)"
                    emptyMessage="Nenhum gasto fixo padrão cadastrado"
                />
            </div>
        </main>
    );
}


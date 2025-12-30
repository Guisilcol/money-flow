import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  AccountingPeriod,
  FixedExpense,
  Entry,
  Template,
  TemplateEntry,
  TemplateFixedExpense
} from './types';
import { Sidebar } from './components/Sidebar';
import { PeriodDetails } from './pages/PeriodDetails';
import { WelcomePage } from './pages/WelcomePage';
import { TemplatePage } from './pages/TemplatePage';
import {
  loadPeriods,
  loadTransactions,
  savePeriods,
  saveTransactions,
  loadTemplate,
  saveTemplate,
  exportAllData,
  importAllData,
  DatabaseExport
} from './libs/repositories';
import { generateId } from './libs/uuid';

const App: React.FC = () => {
  // --- State ---
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [template, setTemplate] = useState<Template>({ entries: [], fixedExpenses: [] });
  const [isTemplateView, setIsTemplateView] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Derived State ---
  const selectedPeriod = useMemo(() =>
    periods.find(p => p.id === selectedPeriodId), [periods, selectedPeriodId]
  );

  const periodTransactions = useMemo(() =>
    transactions.filter(t => t.periodId === selectedPeriodId), [transactions, selectedPeriodId]
  );

  // --- Initial Data ---
  useEffect(() => {
    const loadData = async () => {
      const savedPeriods = await loadPeriods();
      const savedTransactions = await loadTransactions();
      const savedTemplate = await loadTemplate();

      setPeriods(savedPeriods);
      if (savedPeriods.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(savedPeriods[0].id);
      }
      setTransactions(savedTransactions);
      setTemplate(savedTemplate);
      setIsInitialized(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const saveData = async () => {
      await savePeriods(periods);
      await saveTransactions(transactions);
      await saveTemplate(template);
    };
    saveData();
  }, [periods, transactions, template, isInitialized]);

  // --- Handlers ---
  const handleCreatePeriod = (newPeriod: AccountingPeriod) => {
    // Copy template items to the new period with new IDs
    const templateEntries: Entry[] = template.entries.map(te => ({
      id: generateId(),
      periodId: newPeriod.id,
      name: te.name,
      amount: te.amount,
    }));

    const templateFixedExpenses: FixedExpense[] = template.fixedExpenses.map(tfe => ({
      id: generateId(),
      periodId: newPeriod.id,
      name: tfe.name,
      amount: tfe.amount,
    }));

    const periodWithDefaults = {
      ...newPeriod,
      fixedExpenses: [...(newPeriod.fixedExpenses || []), ...templateFixedExpenses],
      entries: [...(newPeriod.entries || []), ...templateEntries]
    };
    setPeriods(prev => [periodWithDefaults, ...prev]);
    setSelectedPeriodId(periodWithDefaults.id);
    setIsTemplateView(false);
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdatePeriod = (updatedPeriod: AccountingPeriod) => {
    setPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
  };

  const deletePeriod = (id: string) => {
    const confirmDelete = window.confirm('Deseja excluir este período permanentemente? Todas as transações serão perdidas.');

    if (confirmDelete) {
      const updatedPeriods = periods.filter(p => p.id !== id);
      setPeriods(updatedPeriods);

      const updatedTransactions = transactions.filter(t => t.periodId !== id);
      setTransactions(updatedTransactions);

      if (selectedPeriodId === id) {
        setSelectedPeriodId(updatedPeriods.length > 0 ? updatedPeriods[0].id : null);
      }
    }
  };

  const handleRenamePeriod = (id: string, newName: string) => {
    setPeriods(prev => prev.map(p =>
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  // --- Fixed Expense Handlers ---
  const handleAddFixedExpense = (expense: FixedExpense) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === expense.periodId) {
        return {
          ...p,
          fixedExpenses: [...(p.fixedExpenses || []), expense]
        };
      }
      return p;
    }));
  };

  const handleDeleteFixedExpense = (expenseId: string) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === selectedPeriodId) {
        return {
          ...p,
          fixedExpenses: (p.fixedExpenses || []).filter(e => e.id !== expenseId)
        };
      }
      return p;
    }));
  };

  // --- Entry Handlers ---
  const handleAddEntry = (entry: Entry) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === entry.periodId) {
        return {
          ...p,
          entries: [...(p.entries || []), entry]
        };
      }
      return p;
    }));
  };

  const handleDeleteEntry = (entryId: string) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === selectedPeriodId) {
        return {
          ...p,
          entries: (p.entries || []).filter(e => e.id !== entryId)
        };
      }
      return p;
    }));
  };

  // --- Update Handlers ---
  const handleUpdateEntry = (updatedEntry: Entry) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === updatedEntry.periodId) {
        return {
          ...p,
          entries: (p.entries || []).map(e =>
            e.id === updatedEntry.id ? updatedEntry : e
          )
        };
      }
      return p;
    }));
  };

  const handleUpdateFixedExpense = (updatedExpense: FixedExpense) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === updatedExpense.periodId) {
        return {
          ...p,
          fixedExpenses: (p.fixedExpenses || []).map(e =>
            e.id === updatedExpense.id ? updatedExpense : e
          )
        };
      }
      return p;
    }));
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
  };

  // --- Template Handlers ---
  const handleAddTemplateEntry = (entry: TemplateEntry) => {
    setTemplate(prev => ({
      ...prev,
      entries: [...prev.entries, entry]
    }));
  };

  const handleUpdateTemplateEntry = (updatedEntry: TemplateEntry) => {
    setTemplate(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
    }));
  };

  const handleDeleteTemplateEntry = (entryId: string) => {
    setTemplate(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== entryId)
    }));
  };

  const handleAddTemplateFixedExpense = (expense: TemplateFixedExpense) => {
    setTemplate(prev => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, expense]
    }));
  };

  const handleUpdateTemplateFixedExpense = (updatedExpense: TemplateFixedExpense) => {
    setTemplate(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    }));
  };

  const handleDeleteTemplateFixedExpense = (expenseId: string) => {
    setTemplate(prev => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter(e => e.id !== expenseId)
    }));
  };

  const handleSelectPeriod = (id: string) => {
    setSelectedPeriodId(id);
    setIsTemplateView(false);
  };

  const handleOpenTemplate = () => {
    setIsTemplateView(true);
    setSelectedPeriodId(null);
  };

  // --- Export/Import Handlers ---
  const handleExportData = async () => {
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
  };

  const handleImportData = async (file: File) => {
    const confirmImport = window.confirm(
      'ATENÇÃO: Isso substituirá TODOS os dados existentes no sistema. Esta ação não pode ser desfeita. Deseja continuar?'
    );

    if (!confirmImport) {
      return;
    }

    try {
      const text = await file.text();
      const data: DatabaseExport = JSON.parse(text);
      await importAllData(data);

      // Reload all state from storage
      const savedPeriods = await loadPeriods();
      const savedTransactions = await loadTransactions();
      const savedTemplate = await loadTemplate();

      setPeriods(savedPeriods);
      setTransactions(savedTransactions);
      setTemplate(savedTemplate);
      setSelectedPeriodId(savedPeriods.length > 0 ? savedPeriods[0].id : null);
      setIsTemplateView(false);

      alert('Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      alert('Erro ao importar dados. Verifique se o arquivo é válido.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900">
      {/* Sidebar - Periods */}
      <Sidebar
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        isTemplateView={isTemplateView}
        onSelectPeriod={handleSelectPeriod}
        onCreatePeriod={handleCreatePeriod}
        onDeletePeriod={deletePeriod}
        onRenamePeriod={handleRenamePeriod}
        onOpenTemplate={handleOpenTemplate}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 lg:p-14 overflow-y-auto">
        {isTemplateView ? (
          <TemplatePage
            template={template}
            onAddEntry={handleAddTemplateEntry}
            onUpdateEntry={handleUpdateTemplateEntry}
            onDeleteEntry={handleDeleteTemplateEntry}
            onAddFixedExpense={handleAddTemplateFixedExpense}
            onUpdateFixedExpense={handleUpdateTemplateFixedExpense}
            onDeleteFixedExpense={handleDeleteTemplateFixedExpense}
          />
        ) : !selectedPeriod ? (
          <WelcomePage />
        ) : (
          <PeriodDetails
            period={selectedPeriod}
            transactions={periodTransactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={deleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onUpdatePeriod={handleUpdatePeriod}
            onAddFixedExpense={handleAddFixedExpense}
            onDeleteFixedExpense={handleDeleteFixedExpense}
            onUpdateFixedExpense={handleUpdateFixedExpense}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateEntry={handleUpdateEntry}
          />
        )}
      </main>
    </div>
  );
};

export default App;
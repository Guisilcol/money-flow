import { useState, useMemo } from 'react';
import {
  AccountingPeriod,
  FixedExpense,
  Entry,
  Template,
} from '../_lib/types';
import { generateId } from '../_lib/uuid';

interface UsePeriodsReturn {
  // Estado
  periods: AccountingPeriod[];
  selectedPeriodId: string | null;
  selectedPeriod: AccountingPeriod | undefined;

  // Setters (para persistência)
  setPeriods: React.Dispatch<React.SetStateAction<AccountingPeriod[]>>;
  setSelectedPeriodId: React.Dispatch<React.SetStateAction<string | null>>;

  // Handlers de período
  handleCreatePeriod: (period: AccountingPeriod, template: Template) => void;
  handleUpdatePeriod: (period: AccountingPeriod) => void;
  deletePeriod: (id: string) => void;
  handleRenamePeriod: (id: string, newName: string) => void;
  handleSelectPeriod: (id: string) => void;

  // Handlers de fixed expenses
  handleAddFixedExpense: (expense: FixedExpense) => void;
  handleDeleteFixedExpense: (expenseId: string) => void;
  handleUpdateFixedExpense: (expense: FixedExpense) => void;

  // Handlers de entries
  handleAddEntry: (entry: Entry) => void;
  handleDeleteEntry: (entryId: string) => void;
  handleUpdateEntry: (entry: Entry) => void;

  // Callback para deletar transações do período
  setDeleteTransactionsCallback: (callback: (periodId: string) => void) => void;
}

export function usePeriods(): UsePeriodsReturn {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [deleteTransactionsCallback, setDeleteTransactionsCallback] = useState<((periodId: string) => void) | null>(null);

  const selectedPeriod = useMemo(
    () => periods.find(p => p.id === selectedPeriodId),
    [periods, selectedPeriodId]
  );

  // --- Period Handlers ---
  const handleCreatePeriod = (newPeriod: AccountingPeriod, template: Template) => {
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
  };

  const handleUpdatePeriod = (updatedPeriod: AccountingPeriod) => {
    setPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
  };

  const deletePeriod = (id: string) => {
    const confirmDelete = window.confirm('Deseja excluir este período permanentemente? Todas as transações serão perdidas.');

    if (confirmDelete) {
      const updatedPeriods = periods.filter(p => p.id !== id);
      setPeriods(updatedPeriods);

      // Delete related transactions
      if (deleteTransactionsCallback) {
        deleteTransactionsCallback(id);
      }

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

  const handleSelectPeriod = (id: string) => {
    setSelectedPeriodId(id);
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

  return {
    periods,
    selectedPeriodId,
    selectedPeriod,
    setPeriods,
    setSelectedPeriodId,
    handleCreatePeriod,
    handleUpdatePeriod,
    deletePeriod,
    handleRenamePeriod,
    handleSelectPeriod,
    handleAddFixedExpense,
    handleDeleteFixedExpense,
    handleUpdateFixedExpense,
    handleAddEntry,
    handleDeleteEntry,
    handleUpdateEntry,
    setDeleteTransactionsCallback,
  };
}
